/////**--DEBUG--**/////
//var d3 = require('d3');
// var $ = require('jquery');
// var vue = require('vue');

var d3 = require('../../node_modules/d3/d3.min.js');
var $ = require('../../node_modules/jquery/dist/jquery.min.js');
var _ = require('../../node_modules/underscore/underscore-min.js');
var Vue = require('../../node_modules/vue/dist/vue.min.js');
var marked = require('../../node_modules/marked/marked.min.js');
var introJs = require('../../node_modules/intro.js/minified/intro.min.js')

var modal = require('./modal.js');
require('./binding.js');
var tree = require('./treeNodesViz.js');
var slider = require('./slider.js');
var data = require('./data/data_s.json');

var formNodeContent = document.getElementById("formNode").innerHTML;

var width = window.innerWidth,
    height = window.innerHeight - 10;

var yFirst, yLast;
var monthNames = ["janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre"
];
var chronoRestart = Date.now();
var introFiltersId = [true, true];

var svg = d3.select("#graph")
    .attr("width", width)
    .attr("height", height)
    .call(d3.behavior.zoom()
        .scaleExtent([0.4, 2])
        .on("zoom", function() {
            mousedrag = true;
            svg.attr("transform", "translate(" + (d3.event.translate[0] + 300) + "," + (d3.event.translate[1] + 280) + ")" + " scale(" + d3.event.scale * 0.6 + ")");
        }))
    .on("dblclick.zoom", null)
    .on("dblclick", undoSwitchId)
    .append('svg:g')
    .attr("transform", "translate(300,280) scale(0.6)");
svg.append('svg:rect')
    .attr("id", "graphBackground")
    .attr('width', width * 6)
    .attr('height', height * 6)
    .attr("transform", "translate(" + width * -3 + "," + height * -3 + ")");


var force = d3.layout.force()
    .charge(function(d) {
        if (d.isSpine)
            return -7000;
        return -6000;
    })
    .chargeDistance(1000)
    .linkDistance(function(d) {
        if (d.source.isSpine && d.target.isSpine)
            return 140
        if (d.source.isSpine || d.target.isSpine)
            return 120;
        return 90;
    })
    .linkStrength(0.8)
    .gravity(0.1)
    .theta(0.1)
    .size([width, height])
    .on("tick", tick);

var nodes = force.nodes(),
    links = force.links(),
    node = svg.selectAll("g"),
    link = svg.selectAll("line");


tree.init(nodes, links);

var dateFiltersHook = function(dates) {
    tree.changeDate(dates);
    restart();
}

function initData(newNodes) {
    tree.orderNodes();
    for (var i = 0; i < newNodes.length; i++) {
        nodes.push(newNodes[i]);
    }
    var newLinks = tree.getLinks();
    for (var i = 0; i < newLinks.length; i++)
        links.push(newLinks[i]);

    //add filters
    var types = tree.getNodesTypes();
    var divFilters = document.getElementById("filters");
    var done = false;
    for (var i = 0; i < types.length; i++) {
        if (types[i].label != "") {
            var div = document.createElement('div');
            if (done === false && (i != 0 ^ types.length === 1)) {
                div.setAttribute("data-intro", "Filtre par type: Permet d'afficher / masquer tous les noeuds de ce type. Les noeuds cerclés de noir masquent tous leurs noeuds enfants.");
                done = true;
            }
            div.className = "filters";
            div.title = "montrer / cacher cette information";
            div.id = "filtersType" + types[i].label;
            if (types[i].isActive)
                div.style.background = types[i].color;
            else
                div.style.background = d3.rgb(types[i].color).darker(2);
            div.innerHTML = types[i].label;
            div.addEventListener("click", function() {
                if (chronoRestart + 300 < Date.now()) {
                    if (tree.switchType(this.innerHTML))
                        this.style.backgroundColor = d3.rgb(this.style.backgroundColor).darker(2);
                    else {
                        var types = tree.getNodesTypes();
                        for (var i = 0; i < types.length; i++) {
                            if (types[i].label == this.innerHTML) {
                                this.style.backgroundColor = types[i].color;
                            }
                        }
                    }
                    restart();
                }
            }, false);
            divFilters.appendChild(div);
        }
    }

    //date filter
    var dateRange = tree.getDateRange();
    if (dateRange.min != "" || dateRange.max != "") {
        slider.setDateRange(dateRange.min, dateRange.max);
        slider.setDateStart(tree.getDateFilterStart(), tree.getDateFilterEnd());
        slider.updateHook(dateFiltersHook);
        slider.refreshSlider();
    }

    var unallowIds = tree.getUnallowIds();
    for (var i = 0; i < unallowIds.length; i++) {
        addNodeToFilters(unallowIds[i]);
        tree.setNextUndoId(unallowIds[i].id);
    }

}

function checkBrowser() {
    var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
    var isFirefox = typeof InstallTrigger !== 'undefined'; // Firefox 1.0+
    var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
    // At least Safari 3+: "[object HTMLElementConstructor]"
    var isChrome = !!window.chrome && !isOpera; // Chrome 1+
    var isIE = /*@cc_on!@*/ false || !!document.documentMode; // At least IE6

    return isChrome;
}
$(document).ready(function() {

    if (!checkBrowser())
        document.getElementById("masterPopup").style.display = "block";
    else {
        var newNodes = tree.importData(JSON.stringify(data));
        initData(newNodes);
        $("#leftArrow").click(function() {
            var view = $("#filters");
            var move = "100px";
            var currentPosition = parseInt(view.css("left"));
            if (currentPosition > -100 && currentPosition <= 0)
                move = -currentPosition + "px";
            if (currentPosition < 0)
                view.stop(false, true).animate({
                    left: "+=" + move
                }, {
                    duration: 400
                });
        });

        $("#rightArrow").click(function() {
            var view = $("#filters");
            var move = "100px";
            var currentPosition = parseInt(view.css("left"));
            if (currentPosition > -tree.getNodesTypes().length * 90) {
                view.stop(false, true).animate({
                    left: "-=" + move
                }, {
                    duration: 400
                })
            }
        });

        $("#upArrow").click(function() {
            var view = $("#filtersId");
            var move = "120px";
            var currentPosition = parseInt(view.css("top"));
            if (currentPosition < 0)
                view.stop(false, true).animate({
                    top: "+=" + move
                }, {
                    duration: 400
                });
        });

        $("#downArrow").click(function() {
            var view = $("#filtersId");
            var move = "120px";
            var currentPosition = parseInt(view.css("top"));
            if (currentPosition > 180 - document.getElementById("filtersId").clientHeight) {
                view.stop(false, true).animate({
                    top: "-=" + move
                }, {
                    duration: 400
                })
            }
        });

        $("#showAll").click(function() {
            var id = tree.getNextUndoId();
            while (id != undefined) {
                tree.switchId(id);
                document.getElementById("filtersId")
                    .removeChild(document.getElementById("filtersType" + id));
                id = tree.getNextUndoId();
            }
            tree.activeAllType();
            var types = tree.getNodesTypes();
            for (var i = 0; i < types.length; i++) {
                if (types[i].label != "")
                    document.getElementById("filtersType" + types[i].label).style.backgroundColor = types[i].color;
            }
            restart();
        });

        $("#help").click(function() {
            introJs.introJs().start();
        });

        restart();
    }
});

function restart() {

    chronoRestart = Date.now();
    node = node.data(force.nodes(), function(d) {
        return d.id;
    });

    var elem = node.enter().append("g")
        .attr("id", function(d) {
            return "gVueId" + d.id
        })
        .on("click", clickNode)
        .on("dblclick", dblClickNode);

    elem.append("circle")
        .attr("class", function(d) {
            if (d.isSpine)
                return "strongCircle"
            return "circle";
        })
        .attr("v-fill", "color")
        .attr("r", 0)
        .transition()
        .duration(600)
        .attr("r", function(d) {
            if (d.isSpine)
                return 68;
            return 58;
        });

    elem.append("text")
        .text(function(d) {
            if (d.isSpine)
                return d.dateBegin.getFullYear();
            return "";
        })
        .attr("text-anchor", "middle")
        .attr("transform", "translate(0,45)")
        .attr("fill", function(d) {
            return d.color;
        })
        .attr("display", "none")
        .transition()
        .delay(300)
        .duration(500)
        .attr("display", "inline")
        .attr("fill", "#000");

    elem.insert("text")
        .attr("display", "none")
        .attr("v-content", "label")
        .attr("text-anchor", "middle")
        .each(function(d) {
            new Vue({
                el: "#gVueId" + d.id,
                data: d
            });
        })
        .attr("fill", function(d) {
            return d.color;
        })
        .transition()
        .delay(300)
        .duration(500)
        .attr("display", "inline")
        .attr("fill", "#000");

    node.exit().selectAll('text')
        .transition()
        .duration(250)
        .attr("fill", function(d) {
            return d.color;
        })
        .remove();

    node.exit().selectAll('circle')
        .transition()
        .duration(500)
        .attr("r", 0);

    node.exit()
        .transition()
        .remove();

    link = link.data(force.links(), function(d) {
        return "" + d.source.id + d.target.id;
    });
    link.exit().remove();


    link.enter().insert("line", "g")
        .attr("class", function(d) {
            if (d.source.isSpine && d.target.isSpine)
                return "strongLink";
            return "link";
        });

    force.start();
}

function tick(e) {
    link.attr("x1", function(d) {
            return d.source.x;
        })
        .attr("y1", function(d) {
            return d.source.y;
        })
        .attr("x2", function(d) {
            return d.target.x;
        })
        .attr("y2", function(d) {
            return d.target.y;
        });
    node.attr("transform", function(d) {
        if (d.isSpine) {
            if (d.order === 0) {
                yFirst = d.y;
                if (d.x > 100)
                    d.x = 100;
            } else if (d.order === (d.spineCount - 1)) {
                yLast = d.y;
                if (d.x < 100 + d.spineCount * 140)
                    d.x = 100 + d.spineCount * 140;
            } else {
                var yDelta = yFirst - yLast;
                if (d.y > yFirst + (yDelta / d.spineCount) * d.order + 50) {
                    d.y = yFirst + (yDelta / d.spineCount) * d.order + 50;
                }
                if (d.y < yLast + (yDelta / d.spineCount) * d.order - 50) {
                    d.y = yLast + (yDelta / d.spineCount) * d.order - 50;
                }
            }
        }
        return "translate(" + d.x + "," + d.y + ")";
    });
}

function clickNode(node) {

    d3.event.stopPropagation();
    document.getElementById("formNode").innerHTML = formNodeContent;
    var modalContent = document.getElementById("modalContent");
    modalContent.style.color = d3.rgb(node.color).darker(3);
    modalContent.getElementsByTagName("p")[0].style.color = "black";
    var vm = new Vue({
        el: '#modalContent',
        data: node,
        filters: {
            marked: marked,
            escape: function(d) {
                return d.replace("||", " ");
            },
            date: function(value) {
                if (value != "")
                    return monthNames[value.getMonth()] + " " + value.getFullYear();
                return "";
            }
        }
    });

    modal.openModal(d3.event.clientX, d3.event.clientY);
}

function addNodeToFilters(node) {
    var divFilters = document.getElementById("filtersId");
    var div = document.createElement('div');
    var divText = document.createElement('div');
    div.id = "filtersType" + node.id;
    div.style.marginBottom = "8px";
    div.title = "montrer / cacher cette information";
    if (node.isSpine) {
        divText.className = "filtersIdStrong";
        if (introFiltersId[0]) {
            introFiltersId[0] = false;
            divText.setAttribute("data-intro", "Les noeuds cerclés de noire sont l'ossature du graph, il indique le sens de lecture et ont un comportement particulier...");
            divText.setAttribute("data-position", "right");
        }
    } else {
        divText.className = "filtersId";
        if (introFiltersId[1]) {
            introFiltersId[1] = false;
            divText.setAttribute("data-intro", "Filtre par noeud: permet de masquer le noeud ainsi que tous ses noeud enfants. Double-cliquez pour afficher ou masquer un noeud.");
            divText.setAttribute("data-position", "right");
        }
    }
    divText.innerHTML = node.label.replace('||', ' ');
    divText.style.backgroundColor = node.color;
    div.className = "initAddNode addNode";

    div.addEventListener("dblclick", function() {
        tree.switchId(node.id);
        var filtersId = document.getElementById("filtersId");
        var nodeId = document.getElementById("filtersType" + node.id);
        nodeId.className = "removeNode";
        setTimeout(function() {
            filtersId.removeChild(nodeId)
        }, 300);
        if (parseInt(filtersId.style.top) <= -120)
            filtersId.style.top = (parseInt(filtersId.style.top) + 120) + "px";
        restart();
    }, false);
    div.appendChild(divText);

    divFilters.insertBefore(div, divFilters.firstElementChild);


}

function dblClickNode(node) {
    d3.event.stopPropagation();
    modal.closeModal();
    tree.switchId(node.id);
    addNodeToFilters(node);
    restart();
}

function undoSwitchId() {
    var id = tree.getNextUndoId();
    if (id != undefined) {
        tree.switchId(id);
        document.getElementById("filtersId")
            .removeChild(document.getElementById("filtersType" + id));
        restart();
    }
}


function buildTree(newNodes) {
    while (nodes.length > 0)
        nodes.pop();
    while (links.length > 0)
        links.pop();
    for (var i = 0; i < newNodes.length; i++) {
        nodes.push(newNodes[i]);
    }
    var newLinks = tree.getLinks();
    for (var i = 0; i < newLinks.length; i++)
        links.push(newLinks[i]);
}

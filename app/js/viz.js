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

var grapgOffset = [380, 240, 0.6];

var svg = d3.select("#graph")
    .attr("width", width)
    .attr("height", height)
    .call(d3.behavior.zoom()
        .scaleExtent([0.4, 2])
        .on("zoom", function() {
            mousedrag = true;
            svg.attr("transform", "translate(" + (d3.event.translate[0] + grapgOffset[0]) + "," + (d3.event.translate[1] + grapgOffset[1]) + ")" + " scale(" + d3.event.scale * grapgOffset[2] + ")");
        }))
    .on("dblclick.zoom", null)
    .on("dblclick", undoSwitchId)
    .append('svg:g')
    .attr("transform", "translate(" + grapgOffset[0] + "," + grapgOffset[1] + ") scale(" + grapgOffset[2] + ")");
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

window.onresize = function(event) {
    width = window.innerWidth,
        height = window.innerHeight - 10;
    d3.select("#graph")
        .attr("width", width)
        .attr("height", height);
    d3.layout.force().size([width, height]);
};

window.mobilecheck = function() {
    var check = false;
    (function(a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
}

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

    //id filter
    var unallowIds = tree.getUnallowIds();
    for (var i = 0; i < unallowIds.length; i++) {
        addNodeToFilters(unallowIds[i]);
        tree.setNextUndoId(unallowIds[i].id);
    }

}

$(document).ready(function() {

    if (window.mobilecheck())
        document.getElementById("masterPopup").style.display = "block";
    else {
        var newNodes = tree.importData(JSON.stringify(data));
        initData(newNodes);

        $("#leftArrow").click(function() {
            eventLeftArrow();
        });

        $("#rightArrow").click(function() {
            eventRightArrow();
        });

        $("#upArrow").click(function() {
            eventUpArrow();
        });

        $("#downArrow").click(function() {
            eventDownArrow();
        });

        document.addEventListener('keydown', function(event) {
            if (event.keyCode == 37) {
                eventLeftArrow();
            } else if (event.keyCode == 38) {
                eventUpArrow();
            } else if (event.keyCode == 39) {
                eventRightArrow();
            } else if (event.keyCode == 40) {
                eventDownArrow();
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

function eventUpArrow() {
    var view = $("#filtersId");
    var move = "120px";
    var currentPosition = parseInt(view.css("top"));
    if (currentPosition < 0) {
        document.getElementById("downArrow").style.opacity = 1;
        view.stop(false, true).animate({
            top: "+=" + move
        }, {
            duration: 400
        });
    } else if (currentPosition > 180 - document.getElementById("filtersId").clientHeight) {
        document.getElementById("upArrow").style.opacity = 0;
    }
}

function eventDownArrow() {
    var view = $("#filtersId");
    var move = "120px";
    var currentPosition = parseInt(view.css("top"));
    if (currentPosition > 180 - document.getElementById("filtersId").clientHeight) {
        document.getElementById("upArrow").style.opacity = 1;

        view.stop(false, true).animate({
            top: "-=" + move
        }, {
            duration: 400
        })
    } else if (currentPosition < 0) {
        document.getElementById("downArrow").style.opacity = 0;
    }
}

function eventRightArrow() {
    var view = $("#filters");
    var move = "100px";
    var currentPosition = parseInt(view.css("left"));
    if (currentPosition > -tree.getNodesTypes().length * 90) {
        document.getElementById("leftArrow").style.opacity = 1;
        view.stop(false, true).animate({
            left: "-=" + move
        }, {
            duration: 400
        })
    } else if (currentPosition < 0) {
        document.getElementById("rightArrow").style.opacity = 0;
    }
}

function eventLeftArrow() {
    var view = $("#filters");
    var move = "100px";
    var currentPosition = parseInt(view.css("left"));
    if (currentPosition > -100 && currentPosition <= 0)
        move = -currentPosition + "px";
    if (currentPosition < 0) {
        document.getElementById("rightArrow").style.opacity = 1;
        view.stop(false, true).animate({
            left: "+=" + move
        }, {
            duration: 400
        });
    } else if (currentPosition > -tree.getNodesTypes().length * 90) {
        document.getElementById("leftArrow").style.opacity = 0;

    }
}

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

    tree.orderNodes();
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

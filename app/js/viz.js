/////**--DEBUG--**/////
//var d3 = require('d3');
// var $ = require('jquery');
// var vue = require('vue');

var d3 = require('../../node_modules/d3/d3.min.js');
var $ = require('../../node_modules/jquery/dist/jquery.min.js');
var _ = require('../../node_modules/underscore/underscore-min.js');
var Vue = require('../../node_modules/vue/dist/vue.min.js');

var modal = require('./modal.js');
require('./binding.js');
var tree = require('./treeNodesViz.js');
var slider = require('./slider.js');
var data = require('./data/data_s.json');

var formNodeContent = document.getElementById("formNode").innerHTML;

var width = window.innerWidth,
    height = window.innerHeight - 10;

var yFirst, yLast;
var spineX = [];
var once = true;

var svg = d3.select("#graph")
    .attr("width", width)
    .attr("height", height)
    .call(d3.behavior.zoom()
        .on("zoom", function() {
            mousedrag = true;
            svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
        }))
    .on("dblclick.zoom", null)
    .append('svg:g')
    .on("dblclick", undoSwitchId);

svg.append('svg:rect')
    .attr('width', width * 3)
    .attr('height', height * 2)
    .attr("fill", "#073642");


var force = d3.layout.force()
    .charge(-3000)
    .chargeDistance(1000)
    .linkDistance(function(d) {
        if (d.source.isSpine && d.target.isSpine)
            return 140
        if (d.source.isSpine || d.target.isSpine)
            return 100;
        return 80;
    })
    .linkStrength(0.5)
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
    tree.changeDate(dates)
    restart();
}

$(document).ready(function() {
    var newNodes = tree.importData(JSON.stringify(data));
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
    for (var i = 0; i < types.length; i++) {
        var div = document.createElement('div');
        div.className = "filters";
        div.style.background = types[i].color;
        div.innerHTML = types[i].label;
        div.addEventListener("click", function() {
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
        }, false);
        divFilters.appendChild(div);
    }

    //date filter
    var dateRange = tree.getDateRange();
    if (dateRange.min != "" || dateRange.max != "") {
        slider.setDateRange(dateRange.min, dateRange.max);
        slider.setDateStart(tree.getDateFilterStart(), tree.getDateFilterEnd());
        slider.updateHook(dateFiltersHook);
        slider.refreshSlider();
    }


    restart();
});

function restart() {

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


    node.exit().remove();

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

    var vm = new Vue({
        el: '#modalContent',
        data: node
    });

    modal.openModal(d3.event.clientX, d3.event.clientY);
}

function dblClickNode(node) {
    d3.event.stopPropagation();
    tree.switchId(node.id);
    restart();
}

function undoSwitchId() {
    var id = tree.getNextUndoId();
    if (id != undefined) {
        tree.switchId(id[0]);
        restart();
    }
}

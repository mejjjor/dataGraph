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

var svg = d3.select("#graph")
    .attr("width", width)
    .attr("height", height)
    .call(d3.behavior.zoom()
        .on("zoom", function() {
            mousedrag = true;
            svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
        }))
    .on("dblclick.zoom", null)
    .append('svg:g');
// .on("mousemove", mouseMove)
// .on("mouseup", mouseUp)
// .on("dblclick", createNode);

var force = d3.layout.force()
    .charge(-2000)
    .linkDistance(130)
    .linkStrength(0.5)
    .gravity(0.1)
    .theta(0.2)
    .size([width, height])
    .on("tick", tick);

var nodes = force.nodes(),
    links = force.links(),
    node = svg.selectAll("g"),
    link = svg.selectAll(".link");


tree.init(nodes, links);


$(document).ready(function() {
    var newNodes = tree.importData(JSON.stringify(data));
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
        .on("mousedown", function(d) {
            // d3.event.stopPropagation();
            // mousedown_node = d;
            // drag_line.attr("class", "drag_line");
        })
        .on("mouseup", function(d) {
            // mouseup_node = d;
        })
        .on("click", clickNode);
    // .on("dblclick", function(d) {
    //     d3.event.stopPropagation();
    //     modal.closeModal();
    //     tree.deleteNode(d);
    //     setFilters();
    //     restart();
    // });

    elem.append("circle")
        .attr("class", "circle")
        .attr("v-fill", "color")
        .attr("r", 58)



    elem.append("text")
        .attr("v-content", "label")
        .attr("text-anchor", "middle")
        .each(function(d) {
            new Vue({
                el: "#gVueId" + d.id,
                data: d
            });
        });

    node.exit().remove();

    link = link.data(links);
    link.enter().insert("line", "g")
        .attr("class", "link");
    link.exit().remove();
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

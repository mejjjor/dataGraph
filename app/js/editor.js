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
var tree = require('./treeNodesEditor.js');

var formNodeContent = document.getElementById("formNode").innerHTML;

var width = window.innerWidth,
    height = window.innerHeight - 10;

var mousedown_node = null;
var mouseup_node = null;
var mousedown_link = null;
var mousedrag = null;

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
    .on("mousemove", mouseMove)
    .on("mouseup", mouseUp)
    .on("dblclick", createNode);

svg.append('svg:rect')
    .attr('width', width * 3)
    .attr('height', height * 2)
    .attr('transform', 'translate(-600,-600)');

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

var drag_line = svg.append("line")
    .attr("class", "drag_line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", 0)
    .attr("y2", 0);

function restart() {

    node = node.data(force.nodes(), function(d) {
        return d.id;
    });

    var elem = node.enter().append("g")
        .attr("id", function(d) {
            return "gVueId" + d.id
        })
        .on("mousedown", function(d) {
            d3.event.stopPropagation();
            mousedown_node = d;
            drag_line.attr("class", "drag_line");
        })
        .on("mouseup", function(d) {
            mouseup_node = d;
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
        .attr("class", "link")
        .on("mousedown", function(d) {
            mousedown_link = d;
        })
        .on("dblclick", function(d) {
            d3.event.stopPropagation();
            tree.deleteLink(d);
            restart();
        });
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

function createNode() {
    var point = d3.mouse(this);
    nodes.push(tree.createNode(point[0], point[1]));
    restart();
}

function clickNode(node) {

    d3.event.stopPropagation();
    document.getElementById("formNode").innerHTML = formNodeContent;
    addNewTypes();
    colorSelectors = document.getElementsByClassName("colorSelector");
    selectColor(node);

    var vm = new Vue({
        el: '#formNode',
        data: node
    });
    var unwatchType = linkTypeAndColor(vm, node);

    modal.setBeforeCloseModal(function() {
        unwatchType();
    });

    modal.openModal(d3.event.clientX, d3.event.clientY);
}

function addNewTypes() {
    nodesTypes = tree.getNodesTypes();
    //kk
    document.getElementById("types").innerHTML = '';
    for (var i in nodesTypes)
        document.getElementById("types").innerHTML += '<option value="' + nodesTypes[i] + '"/>';

}

function selectColor(node) {
    //Select color of node
    for (var i = 0; i < colorSelectors.length; i++) {
        if (getComputedStyle(colorSelectors[i]).backgroundColor == node.color)
            colorSelectors[i].className += " colorSelected";

        colorSelectors[i].onclick = function(event) {
            //Unselect all color
            for (var j = 0; j < colorSelectors.length; j++)
                colorSelectors[j].className = colorSelectors[j].className.replace(" colorSelected", "");
            //Select color clicked
            event.target.className += " colorSelected";
            //Change every node color with this type
            for (var j in nodes)
                if (nodes[j].type === node.type)
                    nodes[j].color = getComputedStyle(event.target).backgroundColor;
        };
    }
}

function mouseMove() {
    if (mousedown_node) {
        drag_line
            .attr("x1", mousedown_node.x)
            .attr("y1", mousedown_node.y)
            .attr("x2", d3.mouse(this)[0])
            .attr("y2", d3.mouse(this)[1]);
    }
}

function mouseUp() {
    if (mouseup_node && mousedown_node && mouseup_node != mousedown_node) {
        links.push(tree.createLink(mousedown_node, mouseup_node));
        restart();
    }
    if (!mousedown_node && !mousedown_link && !mousedrag) {
        restart();
    }
    resetEvents();
}

function linkTypeAndColor(vm, node) {
    return vm.$watch('type', function(newVal, oldVal) {
        for (var j in nodes)
            if (nodes[j].type === newVal) {
                node.color = nodes[j].color;
                //break;
            }
        for (var k = 0; k < colorSelectors.length; k++)
            if (getComputedStyle(colorSelectors[k]).backgroundColor === node.color)
                colorSelectors[k].className += " colorSelected";
            else
                colorSelectors[k].className = colorSelectors[k].className.replace(" colorSelected", "");
    });
}

function resetEvents() {
    mousedrag = null;
    mousedown_node = null;
    mouseup_node = null;
    mousedown_link = null;
    drag_line.attr("class", "drag_line_hidden")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", 0);
}


///// IMPORT / EXPORT ////////////

$('#import').click(function(e) {
    var newNodes = tree.importData(document.getElementById("exchange").value);
    for (var i = 0; i < newNodes.length; i++){
        nodes.push(newNodes[i]);
    }
    var newLinks = tree.getLinks();
    for (var i=0;i<newLinks.length;i++)
    	links.push(newLinks[i]);
    restart();
});

$('#export').click(function(e) {
    document.getElementById("exchange").value = tree.exportData();
});

/////**--DEBUG--**/////
// var d3 = require('d3');
// var rivets = require('rivets');
// var $ = require('jquery');
// var ko = require('knockout');

var d3 = require('../../node_modules/d3/d3.min.js');
var rivets = require('../../node_modules/rivets/dist/rivets.min.js');
var $ = require('../../node_modules/jquery/dist/jquery.min.js');
var ko = require('../../node_modules/knockout/build/output/knockout-latest.js');
var modal = require('./modal.js');

var width = 1200,
    height = 700;
var node_id = 0;
var rview; 

var svg = d3.select("#graph")
    .attr("width", width)
    .attr("height", height)
    .on("mousemove", mousemove)
    .on("mouseup", mouseup)
    .on("dblclick", dblclick);


var force = d3.layout.force()
    .charge(-4000)
    .linkDistance(300)
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

var mousedown_node = null;
var mouseup_node = null; 

rivets.formatters.key = function(value, key) {
    return value[key];
};

restart();

function restart() {


    node = node.data(force.nodes(), function(d) {
        return d.id;
    });

    var elem = node.enter().append("g")
        .on("mousedown", function(d) {
            mousedown_node = d;
            drag_line.attr("class", "drag_line");
        })
        .on("mouseup", function(d) {
            mouseup_node = d;
        })
        .on("click", click_node)
        .on("dblclick", dblclick_node);

    elem.append("circle")
        .attr("class", "circle")
        .attr("r", 40);

    elem.append("text")
        .attr("id", function(d) {
            return "rTextId" + d.id;
        })
        .attr("rv-text", function(d) {
            return "rnode | key 'label'";
        })
        .each(function(d) {
            rivets.bind($('#rTextId' + node_id), {
                rnode: d
            })
        });

    node.exit().remove();

    link = link.data(links);
    link.enter().insert("line", "g")
        .attr("class", "link")
        .on("dblclick", dblclick_link);
    link.exit().remove();

    force.start();
}

function getIndexById(node_id) {
    for (i in nodes) {
        if (nodes[i].id === node_id)
            return i;
    }
    return 0;
}

function tick() {
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

function mousemove() {
    if (mousedown_node) {
        drag_line
            .attr("x1", mousedown_node.x)
            .attr("y1", mousedown_node.y)
            .attr("x2", d3.mouse(this)[0])
            .attr("y2", d3.mouse(this)[1]);
    }
}

function mouseup() {

            rivets.bind($('#rTextId0'), {
                rnode: nodes[0]
            })

    if (mouseup_node && mousedown_node && mouseup_node != mousedown_node) {
        links.push({
            source: mousedown_node,
            target: mouseup_node
        });
    }
    mousedown_node = null;
    mouseup_node = null;
    drag_line.attr("class", "drag_line_hidden")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", 0);

    restart();
}

function dblclick() {
    var point = d3.mouse(this),
        newNode = {
            x: point[0],
            y: point[1],
            id: node_id,
            label: "label "+node_id
        },
        n = nodes.push(newNode);
    restart();
    node_id++;
}

function dblclick_node(d) {
    d3.event.stopPropagation();
    modal.closeModal();
    spliceLinksForNode(d);
    var n = nodes.indexOf(d);
    nodes.splice(n, 1);
    restart();
}

function dblclick_link(d) {
    d3.event.stopPropagation();
    links.splice(links.indexOf(d), 1);
    restart();
}

function spliceLinksForNode(node) {
    toSplice = links.filter(
        function(l) {
            return (l.source === node) || (l.target === node);
        });
    toSplice.map(
        function(l) {
            links.splice(links.indexOf(l), 1);
        });
}

function click_node(node) {

    if (rview != undefined)
        rview.unbind();
    modal.openModal(d3.event.clientX, d3.event.clientY);
    rview = rivets.bind($('#formNode'), {
        rFormNode: node
    });
    d3.event.stopPropagation();
}

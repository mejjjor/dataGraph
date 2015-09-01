var d3 = require('../../node_modules/d3/d3.js');


var width = 1200,
    height = 700;

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
    node = svg.selectAll(".node"),
    link = svg.selectAll(".link");

// line displayed when dragging new nodes
var drag_line = svg.append("line")
    .attr("class", "drag_line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", 0)
    .attr("y2", 0);

mousedown_node = null;
mouseup_node = null;

restart();

function restart() {

  node = node.data(nodes);
    node.enter().insert("circle")
        .attr("class", "node")
        .attr("r", 40)
        .on("mousedown", function(d) {
            mousedown_node = d;
            drag_line.attr("class", "drag_line");
        })
        .on("mouseup", function(d) {
            mouseup_node = d;
        });
         node.exit().remove();

    link = link.data(links);
        link.enter().insert("line", ".node")
        .attr("class", "link");
         link.exit().remove();


  

    force.start();
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
    node.attr("cx", function(d) {
            return d.x;
        })
        .attr("cy", function(d) {
            return d.y;
        });
}

function mousemove() {
    if (mousedown_node) {
	console.log("mousemove");
        drag_line
            .attr("x1", mousedown_node.x)
            .attr("y1", mousedown_node.y)
            .attr("x2", d3.mouse(this)[0])
            .attr("y2", d3.mouse(this)[1]);
    }
}

function mouseup() {
	console.log("mouseup");
    if (mouseup_node && mousedown_node) {
        links.push({source: mousedown_node, target: mouseup_node});
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
	console.log("dblclick");
    var point = d3.mouse(this),
        node = {
            x: point[0],
            y: point[1]
        },
        n = nodes.push(node);
        restart();
}
 
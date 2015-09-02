var d3 = require('../../node_modules/d3/d3.min.js');
var rivets = require('../../node_modules/rivets/dist/rivets.min.js');
var $ = require('../../node_modules/jquery/dist/jquery.min.js');

var name = "erik";
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
        })
        .on("click", click_node)
        .on("dblclick", dblclick_node);
    node.exit().remove();

    link = link.data(links);
    link.enter().insert("line", ".node")
        .attr("class", "link")
        .on("dblclick", dblclick_link);
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
    console.log("dblclick");
    var point = d3.mouse(this),
        node = {
            x: point[0],
            y: point[1]
        },
        n = nodes.push(node);
    restart();
}

function dblclick_node(d) {
    d3.event.stopPropagation();
    nodes.splice(d.index, 1);
    spliceLinksForNode(d);
    closeModalNode();
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

function click_node() {
    var point = d3.mouse(this);
    $('#modalNode').css('opacity', 1);
    $('#modalNode').css('pointer-events', 'auto');
    if ($('#modalNode').css('left') == "0px") {
        $('#modalNode').css('left', point[0] + "px");
        $('#modalNode').css('top', point[1] + "px");
    }

    d3.event.stopPropagation();
}

$('#btnCloseModal').click(closeModalNode);
$(document).click(closeModalNode);

function closeModalNode() {
    $('#modalNode').css('opacity', 0);
    $('#modalNode').css('pointer-events', 'none');

}
var data = {
    title: "Panier de fruits",
    fruits: ["pomme", "poire"],
}
rivets.bind($('#view'), {
    data: data
});


//Modal drag & drop

function drag_start(event) {
    if (handle.contains(target)) {

        var style = window.getComputedStyle(event.target, null);
        event.dataTransfer.setData("text/plain", (parseInt(style.getPropertyValue("left"), 10) - event.clientX) + ',' + (parseInt(style.getPropertyValue("top"), 10) - event.clientY));
    } else {
        e.preventDefault();
    }
}

function drag_over(event) {
    event.preventDefault();
    return false;
}

function drop(event) {
    var offset = event.dataTransfer.getData("text/plain").split(',');
    dm.style.left = (event.clientX + parseInt(offset[0], 10)) + 'px';
    dm.style.top = (event.clientY + parseInt(offset[1], 10)) + 'px';
    event.preventDefault();
    return false;
}
document.body.addEventListener('dragover', drag_over, false);
document.body.addEventListener('drop', drop, false);
var dm = document.getElementById('modalNode');
var handle = document.getElementById('ModalHandle');
var target = false;
dm.onmousedown = function(e) {
    target = e.target;
};
dm.ondragstart = function(e) {
    if (handle.contains(target)) {
        var style = window.getComputedStyle(e.target, null);
        e.dataTransfer.setData("text/plain", (parseInt(style.getPropertyValue("left"), 10) - e.clientX) + ',' + (parseInt(style.getPropertyValue("top"), 10) - e.clientY));
    } else {
        e.preventDefault();
    }
};

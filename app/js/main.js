/////**--DEBUG--**/////
// var d3 = require('d3');
// var $ = require('jquery');
// var vue = require('vue');

var d3 = require('../../node_modules/d3/d3.min.js');
var $ = require('../../node_modules/jquery/dist/jquery.min.js');
var Vue = require('../../node_modules/vue/dist/vue.min.js');

var modal = require('./modal.js');
var data = require('./data.json');

Vue.directive('content', {
    update: function(value) {
        var valSplited = value.split("||");
        this.el.innerHTML = "";
        for (var i in valSplited) {
            var j = i > 0 ? 1 : 0;
            this.el.innerHTML += '<tspan x="0" dy="' + j + 'em">' + valSplited[i] + '</tspan>';
        }
        this.el.setAttribute("y", valSplited.length == 0 ? 4 : (-6 * (valSplited.length - 1)));
        var sibling = this.el.previousSibling;
        var dim = this.el.getBBox();
        sibling.style.width = dim.width;
        sibling.style.height = dim.height;
        sibling.style.x = dim.x;
        sibling.style.y = dim.y;
    }
});

Vue.directive('colorized', {
    update: function(value) {
        this.el.style.fill = value
    }
});

Vue.directive('date', {
    twoWay: true,
    bind: function() {
        this.handler = function() {
            var d = this.el.value.split('/');
            this.set(new Date(d[1], d[0] - 1));
        }.bind(this)
        this.el.addEventListener('input', this.handler)
    },
    update: function(value) {
        if (value instanceof Date)
            this.el.value = (value.getMonth() + 1) + "/" + value.getFullYear();
    },
    unbind: function() {
        this.el.removeEventListener('input', this.handler)
    }
});

var width = 1600,
    height = 1000;
var node_id = 0;

var formNodeContent = document.getElementById("formNode").innerHTML;


var svg = d3.select("#graph")
    .attr("width", width)
    .attr("height", height)
    .on("mousemove", mousemove)
    .on("mouseup", mouseup)
    .on("dblclick", dblclick);


var force = d3.layout.force()
    .charge(function(d) {
        if (d.origin)
            return -7000;
        return -3000;
    })
    //.chargeDistance(1000)
    .linkDistance(110)
    .linkStrength(0.5)
    .gravity(0.25)
    .theta(0)
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
var mousedown_link = null;

var nodeIdDateRange;

restart();

function getMaxRange() {
    nodeIdDateRange = {
        min: {
            date: new Date(8640000000000000),
            id: ""
        },
        max: {
            date: new Date(-8640000000000000),
            id: ""
        }
    };
    for (i in nodes) {
        if (nodes[i].dateBegin instanceof Date && nodes[i].dateBegin < nodeIdDateRange.min.date) {
            nodeIdDateRange.min.date = nodes[i].dateBegin;
            nodeIdDateRange.min.id = nodes[i].id;
        }
        if (nodes[i].dateEnd instanceof Date && nodes[i].dateEnd > nodeIdDateRange.max.date) {
            nodeIdDateRange.max.date = nodes[i].dateEnd;
            nodeIdDateRange.max.id = nodes[i].id;
        }
    }
}

function restart() {
    force.resume();
    getMaxRange();

    node = node.data(force.nodes(), function(d) {
        return d.id;
    });

    var elem = node.enter().append("g")
        .attr("id", function(d) {
            return "gVueId" + d.id
        })
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
        .attr("v-colorized", "color")
        .attr("r", 55);

    elem.append("rect")
        .attr("v-colorized", "color")
        .attr("id", function(d) {
            return "rectText" + d.id
        });

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
        .on("dblclick", dblclick_link);
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

    nodes.forEach(function(o, i) {

        if (!o.origin) {
            for (var i in links) {
                if (links[i].target === o) {
                    var dx = o.x - links[i].source.x;
                    var dy = o.y - links[i].source.y;
                    if (Math.abs(dx) > 220)
                        o.x -= dx / 10;
                    if (Math.abs(dy) > 220)
                        o.y -= dy / 10;
                }
            }
        }


        if (o.id === nodeIdDateRange.min.id) {
            //   o.y = height / 2;
            o.x = 115;
        }
        if (o.id === nodeIdDateRange.max.id) {
            o.x = width - 115;
            // o.y = height / 2;
        }

        // if (o.x < 40)
        //     o.x = 40;
        // if (o.x > width - 40)
        //     o.x = width - 40;
        // if (o.y < 40)
        //     o.y = 40;
        // if (o.y > height - 40)
        //     o.y = height - 40;
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

    if (mouseup_node && mousedown_node && mouseup_node != mousedown_node) {
        links.push({
            source: mousedown_node,
            target: mouseup_node
        });
        restart();
    }
    if (!mousedown_node && !mousedown_link) {
        restart();
    }
    mousedown_node = null;
    mouseup_node = null;
    mousedown_link = null;
    drag_line.attr("class", "drag_line_hidden")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", 0);


}

function dblclick() {

    var point = d3.mouse(this),
        newNode = {
            x: point[0],
            y: point[1],
            id: node_id,
            label: "label " + node_id,
            labelSize: 0,
            type: "",
            color: "",
            description: "",
            dateBegin: "",
            dateEnd: "",
            origin: false
        },
        n = nodes.push(newNode);

    node_id++;
    restart();

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

    d3.event.stopPropagation();
    var nodeTypes = [];
    for (var i in nodes) {
        if (nodes[i].type != "" && $.inArray(nodes[i].type, nodeTypes) == -1)
            nodeTypes.push(nodes[i].type);
    }
    //kk
    document.getElementById("types").innerHTML = '';
    for (var i = 0 in nodeTypes) {
        var s = '<option value="' + nodeTypes[i] + '"/>';
        document.getElementById("types").innerHTML += s;
    }


    setFormNode();

    var colorSelectors = document.getElementsByClassName("colorSelector");

    //Select color of node
    for (var i = 0; i < colorSelectors.length; i++) {
        if (getComputedStyle(colorSelectors[i]).backgroundColor == node.color)
            colorSelectors[i].className += " colorSelected";

        colorSelectors[i].onclick = function(event) {
            //Unselect all color
            for (var j = 0; j < colorSelectors.length; j++)
                colorSelectors[j].className = colorSelectors[j].className.replace("colorSelected", "");
            //Select color clicked
            event.target.className += " colorSelected";
            //Change every node color with this type
            for (var j in nodes)
                if (nodes[j].type === node.type)
                    nodes[j].color = getComputedStyle(event.target).backgroundColor;
        };
    }

    var vm = new Vue({
        el: '#formNode',
        data: node
    });

    //BUG: sur 1 node -> 1 type, une couleur
    //sur un autre node -> 1 autre type, une autre couleur
    //sur le 1er node, on choisit le type du 2eme node puis on change la couleur => 2 couleurs selectionnées
    var unwatchType = vm.$watch('type', function(newVal, oldVal) {
        for (var j in nodes)
            if (nodes[j].type === newVal)
                node.color = nodes[j].color;
        for (var k = 0; k < colorSelectors.length; k++)
            if (getComputedStyle(colorSelectors[k]).backgroundColor === nodes[j].color)
                colorSelectors[k].className += " colorSelected";
            else
                colorSelectors[k].className = colorSelectors[k].className.replace("colorSelected", "");
    });


    var unwatchOrigin = vm.$watch('origin', function(newVal, oldVal) {
        treeDirection(node, null);
    });

    modal.setBeforeCloseModal(function() {
        unwatchType();
    });

    modal.openModal(d3.event.clientX, d3.event.clientY);
}

function treeDirection(node, previousNode) {
    for (var i in links) {
        if (links[i].source === node || links[i].target === node) {
            if (!links[i].source.origin && !links[i].target.origin) {
                if (links[i].target === node && links[i].source != previousNode) {
                    links[i].target = links[i].source;
                    links[i].source = node;
                }
                if (links[i].source != previousNode)
                    treeDirection(links[i].target, node);
            }
        }
    }
}

function setFormNode() {
    document.getElementById("formNode").innerHTML = formNodeContent;
}


function findNodePositionById(id) {
    for (j in nodes)
        if (nodes[j].id === id)
            return j;
}

$('#import').click(function(e) {
    dataImport = JSON.parse(document.getElementById("exchange").value);

    nodes.slice(0, nodes.length);

    for (var j in dataImport.nodes) {
        if (node_id <= dataImport.nodes[j].id)
            node_id = dataImport.nodes[j].id + 1;
        if (dataImport.nodes[j].dateBegin != "")
            dataImport.nodes[j].dateBegin = new Date(dataImport.nodes[j].dateBegin);
        else
            dataImport.nodes[j].dateBegin = "";
        if (dataImport.nodes[j].dateEnd != "")
            dataImport.nodes[j].dateEnd = new Date(dataImport.nodes[j].dateEnd);
        else
            dataImport.nodes[j].dateEnd = "";
        nodes.push(dataImport.nodes[j]);
    }
    links.slice(0, links.length);
    for (var i in dataImport.links) {
        var s = findNodePositionById(dataImport.links[i].source);
        var t = findNodePositionById(dataImport.links[i].target);
        var tempLink = {
            source: nodes[s],
            target: nodes[t]
        };
        links.push(tempLink);
    }
    restart();
});

$('#export').click(function(e) {
    var dataExport = {
        nodes: [],
        links: []
    };

    for (var i in nodes) {
        var tempNode = {
            x: i * 10 % width,
            y: i * 10 % height,
            id: nodes[i].id,
            label: nodes[i].label,
            type: nodes[i].type,
            color: nodes[i].color,
            description: nodes[i].description,
            dateBegin: nodes[i].dateBegin,
            dateEnd: nodes[i].dateEnd,
            origin: nodes[i].origin
        }
        dataExport.nodes.push(tempNode);
    }
    for (var j in links) {
        var tempLink = {
            source: links[j].source.id,
            target: links[j].target.id
        }
        dataExport.links.push(tempLink);
    }

    var jsonString = JSON.stringify(dataExport);
    jsonString = jsonString.replace(/\\n/g, "\\n");
    document.getElementById("exchange").value = jsonString;
});


//////////////////////////DEV///////////////


$('#addNodes').click(function(e) {
    var newNode = {
        x: 0,
        y: 0,
        id: node_id,
        label: "label " + node_id,
        type: "",
        color: "",
        description: "",
        dateBegin: new Date(2012, 11),
        dateEnd: new Date(2014, 0)
    };
    nodes.push(newNode);
    node_id++;

    var newNode2 = {
        x: 10,
        y: 10,
        id: node_id,
        label: "label " + node_id,
        type: "",
        color: "",
        description: "",
        dateBegin: new Date(2013, 0),
        dateEnd: new Date(2015, 0)
    };
    nodes.push(newNode2);
    node_id++;

    links.push({
        source: newNode,
        target: newNode2
    });

    restart();
});

document.getElementById("exchange").value = JSON.stringify(data);

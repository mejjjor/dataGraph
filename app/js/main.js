/////**--DEBUG--**/////
//var d3 = require('d3');
// var $ = require('jquery');
// var vue = require('vue');

var d3 = require('../../node_modules/d3/d3.min.js');
var $ = require('../../node_modules/jquery/dist/jquery.min.js');
var Vue = require('../../node_modules/vue/dist/vue.min.js');

var modal = require('./modal.js');
require('./binding.js');
var tree = require('./treeNodes.js');
var data = require('./data/data_s.json');

var width = 1200,
    height = 800;

var mousedown_node = null;
var mouseup_node = null;
var mousedown_link = null;
var mousedrag = null;
var nodesOrigin;
var colorSelectors;

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
    .on("mousemove", mousemove)
    .on("mouseup", mouseup)
    .on("dblclick", createNode);

svg.append('svg:rect')
    .attr('width', width * 3)
    .attr('height', height * 2)
    .attr('transform', 'translate(-600,-600)');

d3.select('#filters')
    .attr('width', width)
    .attr('height', 0);

var force = d3.layout.force()
    .charge(function(d) {
        if (d.origin)
            return -5000;
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


var formNodeContent = document.getElementById("formNode").innerHTML;
document.getElementById("exchange").value = JSON.stringify(data);


restart();

function restart() {
    getNodesOrigin();

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
        .on("click", click_node)
        .on("dblclick", function(d) {
            d3.event.stopPropagation();
            modal.closeModal();
            deleteNode(d);
            restart();
        });

    elem.append("circle")
        .attr("class", "circle")
        .attr("v-colorized", "color")
        .attr("r", 58);

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
            links.splice(links.indexOf(d), 1);
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
    var l = nodesOrigin.length;
    if (l > 0) {
        nodesOrigin[0].x = 0;
        nodesOrigin[l - 1].x = l * 150;
    }

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
        createLink();
    }
    if (!mousedown_node && !mousedown_link && !mousedrag) {
        restart();
    }
    resetEvents();
}

function resetEvents(){
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

function createNode() {
    var point = d3.mouse(this);
    nodes.push(tree.createNode(point[0], point[1]));
    restart();
}

function createLink() {
    links.push(tree.createLink(mousedown_node, mouseup_node));
    restart();
}

function deleteNode(node) {
    for (i in node.sources) {
        node.sources[i].targets.splice(node.sources[i].targets.indexOf(node), 1);
        if (node.origin && node.sources[i].origin)
            node.sources[i].sources.splice(node.sources[i].sources.indexOf(node), 1);
    }
    for (i in node.targets) {
        node.targets[i].sources.splice(node.targets[i].sources.indexOf(node), 1);
    }
    spliceLinksForNode(node);
    treeNodes.splice(treeNodes.indexOf(node), 1);
    nodes.splice(nodes.indexOf(node), 1);
}



function computeOrigin() {

}


function click_node(node) {

    d3.event.stopPropagation();

    document.getElementById("formNode").innerHTML = formNodeContent;
    addNewTypes(node);
    colorSelectors = document.getElementsByClassName("colorSelector");
    selectColor(node);

    var vm = new Vue({
        el: '#formNode',
        data: node
    });

    var unwatchType = linkTypeAndColor(vm, node);

    var unwatchOrigin = vm.$watch('origin', function(newVal, oldVal) {
        treeDirection(node, null);
    });

    modal.setBeforeCloseModal(function() {
        unwatchType();
        unwatchOrigin();
    });

    modal.openModal(d3.event.clientX, d3.event.clientY);
}

$('#reload').click(function(e) {
    setFilters();
})

///// IMPORT / EXPORT ////////////

$('#import').click(function(e) {
    dataImport = JSON.parse(document.getElementById("exchange").value);

    for (var j in dataImport.nodes) {
        var tempNode = dataImport.nodes[j];
        if (node_id <= tempNode.id)
            node_id = tempNode.id + 1;
        if (tempNode.dateBegin != "")
            tempNode.dateBegin = new Date(tempNode.dateBegin);
        //kk
        else
            tempNode.dateBegin = "";
        if (tempNode.dateEnd != "")
            tempNode.dateEnd = new Date(tempNode.dateEnd);
        else
            tempNode.dateEnd = "";

        if (tempNode.toggle)
            nodes.push(tempNode);
        else
            nodesDiff.push(tempNode)
        allNodes.push(tempNode);
    }

    for (var i in dataImport.links) {

        var tempLink = {
            source: getNodesById(dataImport.links[i].source),
            target: getNodesById(dataImport.links[i].target),
            base: dataImport.links[i].base
        };
        if (tempLink.source.toggle && tempLink.target.toggle)
            links.push(tempLink);
        else if (tempLink.base)
            linksDiff.push(tempLink);
        allLinks.push(tempLink);
    }

    getNodesOrigin();
    balanceTree();

    setFilters();

    restart();
});

$('#export').click(function(e) {
    var dataExport = {
        nodes: [],
        links: []
    };

    for (var i in allNodes) {
        var tempNode = {
            // ?? x:0,y:0 
            x: i * 10 % width,
            y: i * 10 % height,
            id: allNodes[i].id,
            label: allNodes[i].label,
            type: allNodes[i].type,
            color: allNodes[i].color,
            description: allNodes[i].description,
            dateBegin: allNodes[i].dateBegin,
            dateEnd: allNodes[i].dateEnd,
            origin: allNodes[i].origin,
            toggle: allNodes[i].toggle
        }
        dataExport.nodes.push(tempNode);
    }
    for (var j in allLinks) {
        var tempLink = {
            source: links[j].source.id,
            target: links[j].target.id,
            base: links[j].base
        }
        dataExport.links.push(tempLink);
    }

    var jsonString = JSON.stringify(dataExport);
    document.getElementById("exchange").value = jsonString;
});

////////// FILTERS ////////////

function setFilters() {
    var radius = 40;
    var spacing = radius * 2 + 10;
    var offsetX = radius + 20;
    var offsetY = radius + 5;

    buildNodesTypes();

    var filters = d3.select('#filters');
    filters.selectAll('*').remove();
    filters.attr("width", width)
        .attr("height", (((Math.floor(((nodesTypes.length * spacing) + offsetX) / (width - offsetY))) + 1) * spacing));
    for (var i in nodesTypes) {
        var gs = filters.append('g')
            .attr("transform", function(d) {
                return "translate(" + (((i * spacing) + offsetX) % (Math.floor((width - spacing) / spacing) * spacing)) + "," + ((Math.floor(((i * spacing) + offsetX) / (width - spacing))) * spacing + offsetY) + ")";
            })
            .on('click', function() {
                //kk A mettre dans le css
                if (getTypeFilter(this.childNodes[1].innerHTML).toggle) {
                    this.childNodes[0].style.setProperty('fill', d3.rgb(this.childNodes[0].style.getPropertyValue('fill')).darker(2));
                    this.childNodes[1].style.setProperty('fill', 'rgb(89,89,89)');
                    hideType(this.childNodes[1].innerHTML);
                } else {
                    this.childNodes[0].style.setProperty('fill', d3.rgb(this.childNodes[0].style.getPropertyValue('fill')).brighter(2));
                    this.childNodes[1].style.setProperty('fill', 'rgb(0,0,0)');
                    showType(this.childNodes[1].innerHTML);
                }
            });
        gs.append('circle')
            .attr('r', radius)
            .style('fill', nodesTypes[i].color);
        gs.append('text')
            .text(nodesTypes[i].type)
            .attr("text-anchor", "middle");
    }
}

/////////UTILS//////////



function isLinkInAllLinks(link) {
    for (var j in allLinks)
        if (link === allLinks[j]) {
            return true;
        }
    return false;
}

function getLinkInAllLinksByST(link) {
    for (var j in allLinks)
        if (link.source === allLinks[j].source && link.target === allLinks[j].target) {
            return allLinks[j];
        }
    return -1;
}

function balanceTree() {
    var originsWeight = [];
    var upCounter = 0;
    var downCounter = 0;
    for (var i in nodesOrigin) {
        originsWeight[i] = nodeCounter(nodesOrigin[i], 0);
        nodesOrigin[i].x = i * 40;
        nodesOrigin[i].y = 0;
        if (upCounter >= downCounter) {
            downCounter += originsWeight[i];
            setBranchDirection(nodesOrigin[i], -1, i);
        } else {
            upCounter += originsWeight[i];
            setBranchDirection(nodesOrigin[i], 1, i);
        }
    }
}

function setBranchDirection(node, s, i) {
    for (var j in links) {
        if (links[j].source.id === node.id && !links[j].target.origin) {
            links[j].target.x = i * 40;
            links[j].target.y = j * 50 * s;
            setBranchDirection(links[j].target, s, i);
        }
    }
}

function nodeCounter(node, c) {
    for (var j in links) {
        if (links[j].source.id === node.id && !links[j].target.origin) {
            c++
            nodeCounter(links[j].target, c);
        }
    }
    return c;
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

function getNodesOrigin() {
    nodesOrigin = [];
    for (i in nodes) {
        if (nodes[i].origin) {
            nodesOrigin.push(nodes[i]);
        }
    }
    nodesOrigin = nodesOrigin.sort(function(a, b) {
        if (a.dateBegin < b.dateBegin)
            return -1;
        return 1;

    });

}

function buildNodesTypes() {
    nodesTypes = [];
    for (var i in allNodes) {
        if (allNodes[i].type != "" && $.inArray(allNodes[i].type, nodesTypes.map(function(elem) {
                return elem.type;
            })) == -1)
            nodesTypes.push(allNodes[i]);
    }
}

function addNewTypes() {
    buildNodesTypes();
    //kk
    document.getElementById("types").innerHTML = '';
    for (var i = 0 in nodesTypes) {
        var s = '<option value="' + nodesTypes[i].type + '"/>';
        document.getElementById("types").innerHTML += s;
    }
}

function selectColor(node) {
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
}

function linkTypeAndColor(vm, node) {
    //BUG: sur 1 node -> 1 type, une couleur
    //sur un autre node -> 1 autre type, une autre couleur
    //sur le 1er node, on choisit le type du 2eme node puis on change la couleur => 2 couleurs selectionnées
    return vm.$watch('type', function(newVal, oldVal) {
        for (var j in nodes)
            if (nodes[j].type === newVal)
                node.color = nodes[j].color;
        for (var k = 0; k < colorSelectors.length; k++)
            if (getComputedStyle(colorSelectors[k]).backgroundColor === nodes[j].color)
                colorSelectors[k].className += " colorSelected";
            else
                colorSelectors[k].className = colorSelectors[k].className.replace("colorSelected", "");
    });
}

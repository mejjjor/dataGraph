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
// // var width = window.innerWidth-20,
//     height = window.innerHeight-70;

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
    .on("mousemove", mouseMove)
    .on("mouseup", mouseUp)
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

tree.init(nodes, links);

var formNodeContent = document.getElementById("formNode").innerHTML;
document.getElementById("exchange").value = JSON.stringify(data);


restart();

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
        .on("click", clickNode)
        .on("dblclick", function(d) {
            d3.event.stopPropagation();
            modal.closeModal();
            tree.deleteNode(d);
            restart();
        });

    elem.append("circle")
        .attr("class", "circle")
        .attr("v-fill", "color")
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
        tree.createLink(mousedown_node, mouseup_node);
        restart();
    }
    if (!mousedown_node && !mousedown_link && !mousedrag) {
        restart();
    }
    resetEvents();
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

function createNode() {
    var point = d3.mouse(this);
    nodes.push(tree.createNode(point[0], point[1]));
    restart();
}

// function deleteNode(node) {
//     for (i in node.sources) {
//         node.sources[i].targets.splice(node.sources[i].targets.indexOf(node), 1);
//         if (node.origin && node.sources[i].origin)
//             node.sources[i].sources.splice(node.sources[i].sources.indexOf(node), 1);
//     }
//     for (i in node.targets) {
//         node.targets[i].sources.splice(node.targets[i].sources.indexOf(node), 1);
//     }
//     spliceLinksForNode(node);
//     treeNodes.splice(treeNodes.indexOf(node), 1);
//     nodes.splice(nodes.indexOf(node), 1);
// }

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
    var unwatchOrigin = watchOrigin(vm, node);

    modal.setBeforeCloseModal(function() {
        unwatchType();
        unwatchOrigin();
    });

    modal.openModal(d3.event.clientX, d3.event.clientY);
}

$('#reload').click(function(e) {
    tree.showAllNodes();
    restart();
})

///// IMPORT / EXPORT ////////////

$('#import').click(function(e) {
    var dataImport = document.getElementById("exchange").value;
    tree.importData(dataImport);
    tree.showAllNodes();
    //balanceTree();
    restart();
});

$('#export').click(function(e) {
    var dataExport = tree.exportData();
    document.getElementById("exchange").value = dataExport;
});

////////// FILTERS ////////////

function setFilters() {
    var radius = 40;
    var spacing = radius * 2 + 10;
    var offsetX = radius + 20;
    var offsetY = radius + 5;

    var filters = d3.select('#filters');
    filters.selectAll('*').remove();
    //height est calculé en fonction du nombre de filtre et la longueur disponible
    filters.attr("width", width)
        .attr("height", (((Math.floor(((nodesTypes.length * spacing) + offsetX) / (width - offsetY))) + 1) * spacing));
    for (var i in nodesTypes) {
        var gs = filters.append('g')
            .attr("transform", function(d) {
                //Permet de repartir les cercles dans l'espace alloué
                return "translate(" + (((i * spacing) + offsetX) % (Math.floor((width - spacing) / spacing) * spacing)) + "," + ((Math.floor(((i * spacing) + offsetX) / (width - spacing))) * spacing + offsetY) + ")";
            })
            .on('click', function() {
                //kk A mettre dans le css
                if (getTypeFilter(this.childNodes[1].innerHTML).toggle) {
                    this.childNodes[0].style.setProperty('fill', d3.rgb(this.childNodes[0].style.getPropertyValue('fill')).darker(2));
                    this.childNodes[1].style.setProperty('fill', 'rgb(89,89,89)');
                    //tree.removeAllowType(this.childNodes[1].innerHTML);
                    //hideType(this.childNodes[1].innerHTML);

                } else {
                    this.childNodes[0].style.setProperty('fill', d3.rgb(this.childNodes[0].style.getPropertyValue('fill')).brighter(2));
                    this.childNodes[1].style.setProperty('fill', 'rgb(0,0,0)');
                    //showType(this.childNodes[1].innerHTML);
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
            c++;
            nodeCounter(links[j].target, c);
        }
    }
    return c;
}

// function spliceLinksForNode(node) {
//     toSplice = links.filter(
//         function(l) {
//             return (l.source === node) || (l.target === node);
//         });
//     toSplice.map(
//         function(l) {
//             links.splice(links.indexOf(l), 1);
//         });
// }


// function getNodesOrigin() {
//     nodesOrigin = [];
//     for (i in nodes) {
//         if (nodes[i].origin) {
//             nodesOrigin.push(nodes[i]);
//         }
//     }
//     nodesOrigin = nodesOrigin.sort(function(a, b) {
//         if (a.dateBegin < b.dateBegin)
//             return -1;
//         return 1;

//     });

// }

function addNewTypes() {
    var nodesTypes = tree.getNodesTypes();
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

function watchOrigin(vm, node) {
    return vm.$watch('origin', function(newVal, oldVal) {
        if (newVal)
            tree.setNodeOrigin(node);
    });
}

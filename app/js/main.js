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
var tree = require('./treeNodes.js');
var slider = require('./slider.js');
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
var nodesTypes;

var filtersDate = document.getElementById("filtersDate");
filtersDate.style.width = width * 30 / 100 + "px";
var filtersDate = document.getElementById("filtersExclude");
filtersDate.style.width = width * 67 / 100 + "px";
var filtersDate = document.getElementById("filtersDateExclude");
filtersDate.style.width = width + "px";



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

var filters = d3.select('#filtersType')
    .attr('width', width)
    .attr('height', 90);

var force = d3.layout.force()
    .charge(function(d) {
        return -2000;
    })
    .chargeDistance(400)
    .linkDistance(110)
    .linkStrength(0.7)
    .gravity(0)
    .theta(0)
    .size([width, height])
    .on("tick", tick);

var nodes = force.nodes(),
    links = force.links(),
    node = svg.selectAll("g"),
    link = svg.selectAll(".link"),
    filter = filters.selectAll("g");

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
            setFilters();
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
    var cptSpine = 0;
    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].isSpine) {
            nodes[i].x = cptSpine * 200;
            cptSpine++;
            nodes[i].y = 100;
        }
    }
    node.attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
    });
}

function mouseMove() {
    // console.log(d3.mouse(this)[0]+" / "+d3.mouse(this)[1]);
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
    var unwatchEnd = watchEnd(vm, node);

    modal.setBeforeCloseModal(function() {
        unwatchType();
        unwatchOrigin();
        unwatchEnd();
    });

    modal.openModal(d3.event.clientX, d3.event.clientY);
}

$('#reload').click(function(e) {
    tree.showAllNodes();
    restart();
})
$('#refresh').click(function(e) {
    tree.setGraph();
    restart();
})



var dateFiltersHook = function(values) {
    tree.setDateFilters(values)
    tree.setGraph();
    restart();
}

///// IMPORT / EXPORT ////////////

$('#import').click(function(e) {
    var dataImport = document.getElementById("exchange").value;
    tree.importData(dataImport);
    var dateRange = tree.getDateRange();
    if (dateRange.min != "" || dateRange.max != "") {
        slider.setDateRange(dateRange.min, dateRange.max);
        slider.setDateStart(tree.getDateFilterStart(), tree.getDateFilterEnd());
        slider.updateHook(dateFiltersHook);
        slider.refreshSlider();
    }
    //tree.showAllNodes();
    //balanceTree();
    restart();
    setFilters();
});

$('#export').click(function(e) {
    var dataExport = tree.exportData();
    document.getElementById("exchange").value = dataExport;
    setFilters();
});

////////// FILTERS ////////////

function setFilters() {
    var radius = 40;
    var spacing = radius * 2 + 10;
    var offsetX = radius + 20;
    var offsetY = radius + 5;

    nodesTypes = tree.getNodesTypes();
    filter = filter.data([]);
    filter.exit().remove();
    filter = filter.data(nodesTypes);

    //height est calculé en fonction du nombre de filtre et la longueur disponible
    filters.attr("width", width)
        .attr("height", (((Math.floor(((nodesTypes.length * spacing) + offsetX) / (width - offsetY))) + 1) * spacing));
    //for (var i in nodesTypes) {

    filter.exit().remove();
    var elem = filter.enter().append('g')
        .attr('id', function(d) {
            return 'type_' + d.type
        })
        .attr("transform", function(d, i) {
            //Permet de repartir les cercles dans l'espace alloué
            return "translate(" + (((i * spacing) + offsetX) % (Math.floor((width - spacing) / spacing) * spacing)) + "," + ((Math.floor(((i * spacing) + offsetX) / (width - spacing))) * spacing + offsetY) + ")";
        })
        .on('click', function(d) {
            //kk A mettre dans le css
            if (d.activate) {
                d.color = d3.rgb(d.color).darker(2).toString();
                this.childNodes[1].style.setProperty('fill', 'rgb(89,89,89)');
                tree.hideType(this.childNodes[1].innerHTML);
                tree.setGraph();

            } else {
                this.childNodes[1].style.setProperty('fill', 'rgb(0,0,0)');
                tree.showType(this.childNodes[1].innerHTML);
                tree.setGraph();
                //BUG ! it's not the inverse of darker(2) for all colors !
                //d.color = d3.rgb(d.color).brighter(2).toString();
                var tempNodes = tree.getTreeNodes();
                for (var i = 0; i < tempNodes.length; i++) {
                    if (tempNodes[i].type === d.type) {
                        d.color = tempNodes[i].color;
                        break;
                    }
                }
            }
            restart();
        });
    elem.append('circle')
        .attr('r', radius)
        .attr('v-fill', 'color')
        .each(function(d) {
            new Vue({
                el: "#type_" + d.type,
                data: d
            });
        });

    elem.append('text')
        .text(function(d) {
            return d.type;
        })
        .attr("text-anchor", "middle")
        .style('fill', function(d) {
            return d.activate ? 'rgb(0,0,0)' : 'rgb(89,89,89)';
        });
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

function addNewTypes() {
    nodesTypes = tree.getNodesTypes();
    //kk
    document.getElementById("types").innerHTML = '';
    for (var i in nodesTypes)
        document.getElementById("types").innerHTML += '<option value="' + nodesTypes[i].type + '"/>';

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
                //change filters color
            nodesTypes = tree.getNodesTypes();
            for (var j = 0; j < nodesTypes.length; j++) {
                if (nodesTypes[j].type === node.type) {
                    nodesTypes[j].color = getComputedStyle(event.target).backgroundColor;
                    break;
                }
            }
        };
    }
}

function linkTypeAndColor(vm, node) {
    return vm.$watch('type', function(newVal, oldVal) {
        setFilters();
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

function watchOrigin(vm, node) {
    return vm.$watch('origin', function(newVal, oldVal) {
        if (newVal)
            tree.setNodeOrigin(node);
    });
}

function watchEnd(vm, node) {
    return vm.$watch('end', function(newVal, oldVal) {
        if (newVal)
            tree.computeEnd(node);
        else
            tree.uncomputeEnd(node);
    });
}

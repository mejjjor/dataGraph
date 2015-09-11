/////**--DEBUG--**/////
// var d3 = require('d3');
// var $ = require('jquery');
// var vue = require('vue');

var d3 = require('../../node_modules/d3/d3.min.js');
var $ = require('../../node_modules/jquery/dist/jquery.min.js');
var Vue = require('../../node_modules/vue/dist/vue.min.js');

var modal = require('./modal.js');

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

var width = 1200,
    height = 700;
var node_id = 0;

var formNodeContent = document.getElementById("formNode").innerHTML;


var svg = d3.select("#graph")
    .attr("width", width)
    .attr("height", height)
    .on("mousemove", mousemove)
    .on("mouseup", mouseup)
    .on("dblclick", dblclick);


var force = d3.layout.force()
    .charge(-3000)
    .chargeDistance(1000)
    .linkDistance(160)
    .linkStrength(0.3)
    .gravity(0.3)
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
        .attr("r", 51);

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
        if (o.id === nodeIdDateRange.min.id) {
            //   o.y = height / 2;
            o.x = 50;
        }
        if (o.id === nodeIdDateRange.max.id) {
            o.x = width - 50;
            // o.y = height / 2;
        }

        if (o.x < 40)
            o.x = 40;
        if (o.x > width - 40)
            o.x = width - 40;
        if (o.y < 40)
            o.y = 40;
        if (o.y > height - 40)
            o.y = height - 40;
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
            dateEnd: ""
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
    var unwatch = vm.$watch('type', function(newVal, oldVal) {
        for (var j in nodes)
            if (nodes[j].type === newVal)
                node.color = nodes[j].color;
        for (var k = 0; k < colorSelectors.length; k++)
            if (getComputedStyle(colorSelectors[k]).backgroundColor === nodes[j].color)
                colorSelectors[k].className += " colorSelected";
            else
                colorSelectors[k].className = colorSelectors[k].className.replace("colorSelected", "");
    });

    modal.setBeforeCloseModal(function() {
        unwatch();
    });

    modal.openModal(d3.event.clientX, d3.event.clientY);
}

function setFormNode() {
    document.getElementById("formNode").innerHTML = formNodeContent;
}


function selectColor(event) {
    console.log(event.target.id);
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
        if (nodes[i].id == 9)
            console.log("eee");
        var tempNode = {
            x: i * 10 % width,
            y: i * 10 % height,
            id: nodes[i].id,
            label: nodes[i].label,
            type: nodes[i].type,
            color: nodes[i].color,
            description: nodes[i].description,
            dateBegin: nodes[i].dateBegin,
            dateEnd: nodes[i].dateEnd
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

document.getElementById("exchange").value = '{"nodes":[{"x":0,"y":0,"id":0,"label":"Middleware","type":"Entreprise","color":"rgb(108, 113, 196)","description":"","dateBegin":"2014-09-30T22:00:00.000Z","dateEnd":"2015-06-30T22:00:00.000Z"},{"x":10,"y":10,"id":1,"label":"My project","type":"Entreprise","color":"rgb(108, 113, 196)","description":"","dateBegin":"2015-07-31T22:00:00.000Z","dateEnd":"2016-06-30T22:00:00.000Z"},{"x":20,"y":20,"id":2,"label":"CGI","type":"Entreprise","color":"rgb(108, 113, 196)","description":"","dateBegin":"2013-09-30T22:00:00.000Z","dateEnd":"2014-08-31T22:00:00.000Z"},{"x":30,"y":30,"id":3,"label":"DataGraph","type":"Projet","color":"rgb(42, 161, 152)","description":"","dateBegin":"","dateEnd":""},{"x":40,"y":40,"id":4,"label":"Javascript","type":"Langage","color":"rgb(203, 75, 22)","description":"","dateBegin":"","dateEnd":""},{"x":50,"y":50,"id":5,"label":"D3.js","type":"librairie","color":"rgb(181, 137, 0)","description":"","dateBegin":"","dateEnd":""},{"x":60,"y":60,"id":6,"label":"Vue.js","type":"librairie","color":"rgb(181, 137, 0)","description":"","dateBegin":"","dateEnd":""},{"x":70,"y":70,"id":7,"label":"NPM","type":"Outil","color":"rgb(133, 153, 0)","description":"","dateBegin":"","dateEnd":""},{"x":80,"y":80,"id":8,"label":"Browserify","type":"Outil","color":"rgb(133, 153, 0)","description":"","dateBegin":"","dateEnd":""},{"x":90,"y":90,"id":9,"label":"Generic||system","type":"Projet","color":"rgb(42, 161, 152)","description":"","dateBegin":"","dateEnd":""},{"x":100,"y":100,"id":10,"label":"Java 8","type":"Langage","color":"rgb(203, 75, 22)","description":"","dateBegin":"","dateEnd":""},{"x":110,"y":110,"id":14,"label":"JSF 2","type":"Framework","color":"rgb(181, 137, 0)","description":"","dateBegin":"","dateEnd":""},{"x":120,"y":120,"id":12,"label":"TMA||SI métier","type":"Projet","color":"rgb(42, 161, 152)","description":"","dateBegin":"","dateEnd":""},{"x":130,"y":130,"id":13,"label":"EJB3","type":"Framework","color":"rgb(181, 137, 0)","description":"","dateBegin":"","dateEnd":""},{"x":140,"y":140,"id":11,"label":"Maven","type":"Outil","color":"rgb(133, 153, 0)","description":"","dateBegin":"","dateEnd":""},{"x":150,"y":150,"id":15,"label":"Java 5","type":"Langage","color":"rgb(203, 75, 22)","description":"","dateBegin":"","dateEnd":""},{"x":160,"y":160,"id":16,"label":"Support||utilisateur","type":"Relationnel","color":"rgb(220, 50, 47)","description":"","dateBegin":"","dateEnd":""},{"x":170,"y":170,"id":23,"label":"TMA R&D","type":"Projet","color":"rgb(42, 161, 152)","description":"","dateBegin":"","dateEnd":""},{"x":180,"y":180,"id":24,"label":"TMA||automation","type":"Projet","color":"rgb(42, 161, 152)","description":"","dateBegin":"","dateEnd":""},{"x":190,"y":190,"id":25,"label":"Workstream","type":"Outil","color":"rgb(133, 153, 0)","description":"","dateBegin":"","dateEnd":""},{"x":200,"y":200,"id":26,"label":"JIRA","type":"Outil","color":"rgb(133, 153, 0)","description":"","dateBegin":"","dateEnd":""},{"x":210,"y":210,"id":28,"label":"PL/SQL","type":"Langage","color":"rgb(203, 75, 22)","description":"","dateBegin":"","dateEnd":""},{"x":220,"y":220,"id":29,"label":"Angular.js","type":"Framework","color":"rgb(181, 137, 0)","description":"","dateBegin":"","dateEnd":""},{"x":230,"y":230,"id":30,"label":"Oracle","type":"bdd","color":"rgb(133, 153, 0)","description":"","dateBegin":"","dateEnd":""},{"x":240,"y":240,"id":44,"label":"Git","type":"Outil","color":"rgb(133, 153, 0)","description":"","dateBegin":"","dateEnd":""},{"x":250,"y":250,"id":45,"label":"SVN","type":"Outil","color":"rgb(133, 153, 0)","description":"","dateBegin":"","dateEnd":""},{"x":260,"y":260,"id":46,"label":"Javascript","type":"Langage","color":"rgb(203, 75, 22)","description":"","dateBegin":"","dateEnd":""},{"x":270,"y":270,"id":47,"label":"Master WIC","type":"Formation","color":"rgb(108, 113, 196)","description":"","dateBegin":"2011-08-31T22:00:00.000Z","dateEnd":"2013-08-31T22:00:00.000Z"},{"x":280,"y":280,"id":48,"label":"Licence||MIASS","type":"Formation","color":"rgb(108, 113, 196)","description":"","dateBegin":"2009-08-31T22:00:00.000Z","dateEnd":"2011-06-30T22:00:00.000Z"},{"x":290,"y":290,"id":49,"label":"IUT||informatique","type":"Formation","color":"rgb(108, 113, 196)","description":"","dateBegin":"2004-08-31T22:00:00.000Z","dateEnd":"2006-08-31T22:00:00.000Z"},{"x":300,"y":300,"id":51,"label":"Intelligence||artificielle","type":"Projet","color":"rgb(42, 161, 152)","description":"","dateBegin":"","dateEnd":""},{"x":310,"y":310,"id":53,"label":"Réalité||augmentée","type":"Projet","color":"rgb(42, 161, 152)","description":"","dateBegin":"","dateEnd":""},{"x":320,"y":320,"id":54,"label":"Android","type":"Langage","color":"rgb(203, 75, 22)","description":"","dateBegin":"","dateEnd":""},{"x":330,"y":330,"id":55,"label":"Globecast","type":"Client","color":"rgb(42, 161, 152)","description":"","dateBegin":"","dateEnd":""},{"x":340,"y":340,"id":56,"label":"St Micro","type":"Client","color":"rgb(42, 161, 152)","description":"","dateBegin":"","dateEnd":""}],"links":[{"source":1,"target":0},{"source":2,"target":0},{"source":3,"target":1},{"source":4,"target":3},{"source":5,"target":4},{"source":6,"target":4},{"source":7,"target":3},{"source":8,"target":3},{"source":9,"target":0},{"source":12,"target":11},{"source":15,"target":12},{"source":10,"target":9},{"source":13,"target":15},{"source":14,"target":15},{"source":24,"target":16},{"source":25,"target":24},{"source":26,"target":12},{"source":28,"target":23},{"source":30,"target":24},{"source":46,"target":23},{"source":29,"target":46},{"source":45,"target":23},{"source":44,"target":9},{"source":47,"target":2},{"source":47,"target":48},{"source":49,"target":48},{"source":51,"target":47},{"source":53,"target":48},{"source":54,"target":53},{"source":55,"target":0},{"source":12,"target":55},{"source":56,"target":2},{"source":24,"target":56},{"source":23,"target":56}]}';

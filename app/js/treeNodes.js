var _ = require('../../node_modules/underscore/underscore-min.js');
var nodeNextId = 1;
var treeNodes = [];
var links = [];
var nodes = [];
var nodesTypes = [];
var filters = {
    allowTypes: [],
    excludeNames: [],
    dateBegin: "",
    dateEnd: "",
    OriginNodes: []
}

var spineCount;
module.exports = {
    init: function(d3Nodes, d3Links) {
        nodes = d3Nodes;
        links = d3Links;
    },
    getData: function() {
        return {
            nodes: nodes,
            links: links
        };
    },
    getTreeNodes: function() {
        return treeNodes;
    },
    removeAllNodesFromTreeNodes: function() {
        treeNodes = [];
        nodeNextId = 1;
    },
    showAllNodes: function() {
        for (var i = 0; i < treeNodes.length; i++) {
            if (!_.contains(nodes, treeNodes[i]))
                nodes.push(treeNodes[i]);
        }
    },
    setFilterExcludeNames: function(names) {
        filters.allowNames = names;
    },
    setFilterDateBegin: function(dateBegin) {
        filters.dateBegin = dateBegin;
    },
    setFilterDateEnd: function(dateEnd) {
        filters.dateEnd = dateEnd;
    },
    hideType: function(type) {
        for (var i = 0; i < nodesTypes.length; i++) {
            if (nodesTypes[i].type === type)
                nodesTypes[i].activate = false;
        }
        allowTypes();
    },
    showType: function(type) {
        for (var i = 0; i < nodesTypes.length; i++) {
            if (nodesTypes[i].type === type)
                nodesTypes[i].activate = true;
        }
        allowTypes();
    },

    createNode: function() {
        return createNode(0, 0);
    },
    createNode: function(x, y) {
        var elem = {
            id: nodeNextId,
            x: x,
            y: y,
            origin: false,
            end: false,
            sources: [],
            targets: [],
            brothers: [],
            label: "label " + nodeNextId,
            type: "",
            color: "rgb(114, 147, 168)",
            description: "",
            dateBegin: "",
            dateEnd: ""
        };
        if (treeNodes.length === 0)
            elem.origin = true;
        treeNodes.push(elem);
        nodeNextId++;
        return elem;;
    },
    createLink: function(nodeS, nodeT) {
        if (nodeS === nodeT)
            throw new Error('You cannot create a link from and to the same node');

        nodeS.targets.push(nodeT);
        nodeT.sources.push(nodeS);
        try {
            computeOrigin();
        } catch (e) {
            console.error("DON'T build graph, BUILD TREE !! (or it's a very big tree with more than 1OOO nodes !!)")
            var i = nodeS.targets.indexOf(nodeT);
            if (i != -1)
                nodeS.targets.splice(nodeS.targets.indexOf(nodeT), 1);
            else
                nodeS.sources.splice(0, 1);
            i = nodeT.targets.indexOf(nodeS);
            if (i != -1)
                nodeT.targets.splice(nodeT.targets.indexOf(nodeS), 1);
            else
                nodeT.sources.splice(0, 1);
            return null;
        }

        var elem;
        if (nodeS.sources[0] === nodeT)
            elem = {
                source: nodeT,
                target: nodeS
            };
        else
            elem = {
                source: nodeS,
                target: nodeT
            };
        links.push(elem);
        return elem;
    },
    deleteNode: function(node) {
        if (node.sources.length != 0) {
            links.splice(links.indexOf({
                source: node.sources[0],
                target: node
            }), 1);
            node.sources[0].targets.splice(node.sources[0].targets.indexOf(node), 1);
        }
        for (var i = 0; i < node.targets.length; i++) {
            for (var j = links.length - 1; j >= 0; j--) {
                if (links[j].source === node && links[j].target === node.targets[i]) {
                    links.splice(j, 1);
                }
            }
            node.targets[i].sources.splice(0, 1);
        }
        nodes.splice(nodes.indexOf(node), 1);
        treeNodes.splice(treeNodes.indexOf(node), 1);


    },
    deleteLink: function(link) {
        link.target.sources.splice(0, 1);
        link.source.targets.splice(link.source.targets.indexOf(link.target), 1);
        links.splice(links.indexOf(link), 1);
    },
    setGraph: function() {
        _setGraph();
    },
    getNodesTypes: function() {
        var tempNodesTypes = [];
        for (var i = 0; i < treeNodes.length; i++) {
            if (treeNodes[i].type != "" && !_.contains(tempNodesTypes, treeNodes[i].type))
                tempNodesTypes.push({
                    type: treeNodes[i].type,
                    color: treeNodes[i].color,
                    activate: true
                });
        }
        var tempNodesTypesType = _.map(tempNodesTypes, function(e) {
            return e.type
        });

        for (j = nodesTypes.length - 1; j >= 0; j--) {
            if (!_.contains(tempNodesTypesType, nodesTypes[j].type))
                nodesTypes.splice(j, 1);
        }
        var nodesTypesType = _.map(nodesTypes, function(e) {
            return e.type
        });
        for (j = tempNodesTypes.length - 1; j >= 0; j--) {

            if (!_.contains(nodesTypesType, tempNodesTypes[j].type))
                nodesTypes.push(tempNodesTypes[j]);
        }
        return nodesTypes;
    },
    setNodeOrigin: function(node) {
        for (i in treeNodes)
            if (treeNodes[i] != node)
                treeNodes[i].origin = false;
    },
    exportData: function() {
        var data = {
            nodes: [],
            filters: nodesTypes
        };
        for (var i = 0; i < treeNodes.length; i++) {
            var sources = [];
            var targets = [];
            for (var j = 0; j < treeNodes[i].sources.length; j++) {
                sources.push(treeNodes[i].sources[j].id);
            }
            for (var j = 0; j < treeNodes[i].targets.length; j++) {
                targets.push(treeNodes[i].targets[j].id);
            }
            var tempNode = {
                id: treeNodes[i].id,
                x: 0,
                y: 0,
                origin: treeNodes[i].origin,
                sources: sources,
                targets: targets,
                label: treeNodes[i].label,
                type: treeNodes[i].type,
                color: treeNodes[i].color,
                description: treeNodes[i].description,
                dateBegin: treeNodes[i].dateBegin,
                dateEnd: treeNodes[i].dateEnd
            }
            data.nodes.push(tempNode);
        }
        return JSON.stringify(data);
    },
    importData: function(data) {
        var dataImport = JSON.parse(data);
        nodesTypes = dataImport.filters;
        allowTypes();
        for (var i = 0; i < dataImport.nodes.length; i++) {
            var tempNode = dataImport.nodes[i];
            if (nodeNextId <= tempNode.id)
                nodeNextId = tempNode.id + 1;
            if (tempNode.dateBegin != "")
                tempNode.dateBegin = new Date(tempNode.dateBegin);
            //kk
            else
                tempNode.dateBegin = "";
            if (tempNode.dateEnd != "")
                tempNode.dateEnd = new Date(tempNode.dateEnd);
            else
                tempNode.dateEnd = "";
            treeNodes.push(tempNode);
        }
        for (var i = 0; i < treeNodes.length; i++) {
            var sourceIds = _.map(treeNodes[i].sources, _.clone);
            treeNodes[i].sources = [];
            for (var j = 0; j < sourceIds.length; j++) {
                for (var k = 0; k < treeNodes.length; k++) {
                    if (treeNodes[k].id === sourceIds[j]) {
                        treeNodes[i].sources.push(treeNodes[k]);
                        break;
                    }
                }
            }
            var targetsIds = _.map(treeNodes[i].targets, _.clone);
            treeNodes[i].targets = [];
            for (var j = 0; j < targetsIds.length; j++) {
                for (var k = 0; k < treeNodes.length; k++) {
                    if (treeNodes[k].id === targetsIds[j]) {
                        treeNodes[i].targets.push(treeNodes[k]);
                        break;
                    }
                }
            }
        }
        computeOrigin();
        _setGraph();
    },
    computeEnd: function(node) {
        computeEnd(node.sources[0], node);
    },
    uncomputeEnd: function(node) {
        uncomputeEnd(node.sources[0], node);
    }
}

function _setGraph() {
    while (nodes.length > 0)
        nodes.pop();
    while (links.length > 0)
        links.pop();
    if (treeNodes.length != 0) {
        var acc = [getNodeOrigin()];
        var lastNode = computeNode(acc[0], null);
        var isVisible = (lastNode != null)
        while (acc.length != 0) {
            var node = acc.splice(0, 1)[0];
            var newAcc = computeGraph(node, lastNode, isVisible);
            isVisible = true;
            for (var i in newAcc) {
                acc.push(newAcc[i]);
            }
            if (acc.length > 0)
                lastNode = acc[0];
        }
    }
}

function computeGraph(node, lastNode, isVisible) {
    var acc = [];
    for (var i = 0; i < node.targets.length; i++) {
        var newLastNode = computeNode(node.targets[i], lastNode);
        if (lastNode != node && !isVisible && lastNode != newLastNode) {
            lastNode = newLastNode;
        }
        if (newLastNode != node.targets[i]) {
            var newAcc = computeGraph(node.targets[i], lastNode, true);
            if (lastNode === null && newAcc.length > 0)
                lastNode = newAcc[newAcc.length - 1];
            for (var j = 0; j < newAcc.length; j++) {
                acc.push(newAcc[j]);
            }
        } else {
            acc.push(newLastNode);
        }
    }
    return acc;
}

function computeNode(node, lastNode) {
    if (isShowable(node)) {
        nodes.push(node);
        if (lastNode != null) {
            links.push({
                source: lastNode,
                target: node
            });
        }
        return node;
    }
    return lastNode;
}

function isShowable(node) {

    if (node.type == "" || _.contains(filters.allowTypes, node.type))
    // if (filters.excludeNames.indexOf(node.label) === -1)
    //     if (filters.dateBegin <= node.dateBegin && filters.dateEnd >= node.dateEnd)
        return true;
    return false;
}

function computeOrigin() {
    var nodeOrigin = getNodeOrigin();
    if (nodeOrigin.length === 0) {
        //It's better if you give me an origin node
        nodeOrigin = treeNodes[0];
    }
    if (nodeOrigin.sources.length != 0) {
        nodeOrigin.targets.push(nodeOrigin.sources[0])
        nodeOrigin.sources = [];
    }
    for (var j in nodeOrigin.targets) {
        setNodeDirection(nodeOrigin.targets[j], nodeOrigin, 0);
    }

}

function setNodeDirection(node, previousNode, cpt) {
    if (cpt > 1000)
        throw new Error("Cyclic dependance")
    while (node.sources.length != 0)
        node.targets.push(node.sources.pop());

    var index;
    for (var i = 0; i < node.targets.length; i++) {
        if (node.targets[i] != previousNode)
            setNodeDirection(node.targets[i], node, ++cpt);
        else
            index = i;
    }
    node.sources.push(node.targets.splice(index, 1)[0]);
}

function getNodeOrigin() {
    for (i in treeNodes)
        if (treeNodes[i].origin)
            return treeNodes[i];
    return [];
}

function allowTypes() {
    filters.allowTypes = _.map(nodesTypes, function(e) {
        if (e.activate) return e.type;
    });
}

function computeEnd(node, previousNode) {
    node.end = false;
    var index = node.targets.indexOf(previousNode);
    if (index != -1) {
        node.brothers.push(node.targets.splice(index, 1)[0]);
        if (node.sources.length > 0)
            computeEnd(node.sources[0], node);
    }
}

function uncomputeEnd(node, previousNode) {
    if (!node.end && node.brothers.length > 0) {
        var index = node.brothers.indexOf(previousNode);
        node.targets.push(node.brothers.splice(index, 1)[0]);
        if (node.sources.length > 0)
            uncomputeEnd(node.sources[0], node);
    }
}

function countUntilOrigin(node, cpt) {
    if (_.contains(nodes, node))
        cpt++;
    if (node.sources.length > 0) {
        cpt = countUntilOrigin(node.sources[0], cpt)
    }
    return cpt;
}

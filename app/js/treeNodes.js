var nodeNextId = 0;
var treeNodes = [];
var links = [];
var nodes = [];
var filters = {
    allowTypes: [],
    excludeNames: [],
    dateBegin: "",
    dateEnd: "",
    OriginNodes: []
}
module.exports = {
    getTreeNodes: function() {
        return treeNodes;
    },
    removeAllNodesFromTreeNodes: function() {
        treeNodes = [];
        nodeNextId = 0;
    },

    setFilterAllowTypes: function(types) {
        filters.allowTypes = types;
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

    createNode: function() {
        return createNode(0, 0);
    },
    createNode: function(x, y) {
        var elem = {
            id: nodeNextId,
            x: x,
            y: y,
            origin: false,
            sources: [],
            targets: [],
            label: "label " + nodeNextId,
            type: "",
            color: "",
            description: "",
            dateBegin: "",
            dateEnd: ""
        };
        treeNodes.push(elem);
        nodeNextId++;
        return elem;;
    },
    createLink: function(nodeS, nodeT) {
        if (nodeS === nodeT)
            throw new Error('You cannot create a link from and to the same node');
        nodeS.targets.push(nodeT);
        nodeT.sources.push(nodeS);
        computeOrigin();
        return {
            source: nodeS,
            target: nodeT
        };
    },
    deleteNode: function(node) {
        if (node.origin) {
            for (i in node.sources)
                node.sources[i].sources.splice(node.sources[i].sources.indexOf(node), 1);
        } else {
            for (i in node.sources)
                node.sources[i].targets.splice(node.sources[i].targets.indexOf(node), 1);
        }
        for (i in node.targets)
            node.targets[i].sources.splice(node.targets[i].sources.indexOf(node), 1);

        treeNodes.splice(treeNodes.indexOf(node), 1);
    },
    deleteLink: function(link) {
        if (link.target.origin && link.source.origin) {
            link.source.sources.splice(link.source.sources.indexOf(link.target), 1);
            link.target.sources.splice(link.target.sources.indexOf(link.source), 1);
        } else {
            var i = link.source.sources.indexOf(link.target);
            if (i == -1) {
                link.source.targets.splice(link.source.targets.indexOf(link.target), 1);
                link.target.sources.splice(link.target.sources.indexOf(link.source), 1);
            } else {
                link.source.sources.splice(i, 1);
                link.target.targets.splice(link.target.targets.indexOf(link.source), 1);
            }
        }
    },
    getGraph: function() {
        nodes = [];
        links = [];
        var startingNodes = getStartingNodes();
        for (var i in startingNodes) {
            computeGraph(startingNodes[i], null, null, startingNodes[i]);
        }
        return {
            nodes: nodes,
            links: links
        }
    }
}

function isShowable(node) {
    if (filters.allowTypes.indexOf(node.type) != -1)
        if (filters.excludeNames.indexOf(node.label) === -1)
            if (filters.dateBegin <= node.dateBegin && filters.dateEnd >= node.dateEnd) {
                for (var i in filters.OriginNodes) {
                    if (filters.OriginNodes[i].label === node.label)
                        if (filters.OriginNodes[i].type === node.type)
                            if (filters.OriginNodes[i].dateBegin === node.dateBegin && filters.OriginNodes[i].dateEnd === node.dateEnd)
                                return false;
                }
                return true;
            }
    return false;
}

function computeGraph(node, lastShowableNode, firstShowableNode, lastOriginNode) {
    if (isShowable(node)) {
        nodes.push(node);
        if (lastShowableNode != null) {
            links.push({
                source: lastShowableNode,
                target: node
            });
        } else {
            firstShowableNode = node;
        }
        lastShowableNode = node;
    }
    for (var i in node.targets) {
        newFirstNode = computeGraph(node.targets[i], lastShowableNode, firstShowableNode, lastOriginNode);
        if (firstShowableNode != null && newFirstNode != firstShowableNode) {
            links.push({
                source: firstShowableNode,
                target: newFirstNode
            });
        }
        firstShowableNode = newFirstNode;
    }
    if (node.origin) {
    	if (lastShowableNode != node)
        	lastShowableNode = firstShowableNode;
        //lastOriginNode = node;
        for (var i in node.sources) {
            if (node.sources[i] != lastOriginNode)
                lastShowableNode = computeGraph(node.sources[i], lastShowableNode, firstShowableNode, node);
        	//return lastShowableNode;
        }
    }
    return firstShowableNode;
}

function computeOrigin() {
    var nodesOrigin = getNodesOrigin();

    for (var i in nodesOrigin) {
        var toMoveToSources = [];
        var toMoveToTargets = [];
        for (var j in nodesOrigin[i].sources) {
            if (!nodesOrigin[i].sources[j].origin)
                toMoveToTargets.push(j);
        }
        for (var j in nodesOrigin[i].targets) {
            if (nodesOrigin[i].targets[j].origin)
                toMoveToSources.push(j);
        }

        for (var j in toMoveToTargets)
            nodesOrigin[i].targets.push(nodesOrigin[i].sources.splice(toMoveToTargets[j], 1)[0]);

        for (var j in toMoveToSources)
            nodesOrigin[i].sources.push(nodesOrigin[i].targets.splice(toMoveToSources[j], 1)[0]);

        for (var j in nodesOrigin[i].targets)
            setNodeSources(nodesOrigin[i].targets[j], nodesOrigin[i]);
    }
}

function setNodeSources(node, previousNode) {
    for (var i in node.sources) {
        node.targets.push(node.sources[i]);
    }
    node.sources = [];
    var indexToRemove = -1;
    for (var i in node.targets) {
        if (node.targets[i] === previousNode) {
            node.sources.push(previousNode)
            indexToRemove = i;
        } else {
            setNodeSources(node.targets[i], node);
        }
    }
    if (indexToRemove != -1)
        node.targets.splice(indexToRemove, 1);
}

function getNodesOrigin() {
    var acc = [];
    for (i in treeNodes) {
        if (treeNodes[i].origin) {
            acc.push(treeNodes[i]);
        }
    }
    return acc;
}

function getStartingNodes() {
    var acc = [];
    var nodesOrigin = getNodesOrigin();
    var isNeeded = true;
    while (isNeeded) {
        for (var i in nodesOrigin) {
            for (var j in nodesOrigin[i].sources)
                throughBrothers(nodesOrigin[i].sources[j], nodesOrigin[i], nodesOrigin);
            acc.push(nodesOrigin.splice(nodesOrigin.indexOf(nodesOrigin[i]), 1)[0]);
            break;
        }
        if (nodesOrigin.length === 0)
            isNeeded = false;
    }
    return acc;
}

function throughBrothers(node, previousNode, nodesOrigin) {
    for (var j in node.sources) {
        if (node.sources[j] != previousNode)
            throughBrothers(node.sources[j], node, nodesOrigin)
    }
    nodesOrigin.splice(nodesOrigin.indexOf(node), 1)
}

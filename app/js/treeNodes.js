var nodeNextId = 0;
var treeNodes = [];
var links = [];
var nodes = [];
module.exports = {
    getTreeNodes: function() {
        return treeNodes;
    },
    getLinks: function() {
        return links;
    },
    getNodes: function() {
        return nodes;
    },
    removeAllNodesFromTreeNodes: function() {
        treeNodes = [];
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
    }
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

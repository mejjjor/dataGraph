var nodeNextId = 1;
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
        nodeNextId = 1;
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
            }
        return elem;
    },
    deleteNode: function(node) {
        if (node.sources.length != 0)
            node.sources[0].targets.splice(node.sources[0].targets.indexOf(node), 1);
        for (var i in node.targets)
            node.targets[i].sources = [];
        treeNodes.splice(treeNodes.indexOf(node), 1);
    },
    deleteLink: function(link) {
        link.target.sources.splice(0, 1);
        link.source.targets.splice(link.source.targets.indexOf(link.target), 1);
    },
    getGraph: function() {
        nodes = [];
        links = [];
        if (treeNodes.length != 0) {
            var acc = [getNodeOrigin()];
            var lastNode = computeNode(acc[0], null);
            var isVisible = (lastNode != null)
            while (acc.length != 0) {
                var node = acc.splice(0, 1)[0];
                var newAcc = computeGraph(node, lastNode,isVisible);
                isVisible = true;
                for (var i in newAcc) {
                    acc.push(newAcc[i]);
                }
                if (acc.length > 0)
                    lastNode = acc[0];
            }
        }
        return {
            nodes: nodes,
            links: links
        }
    }
}

function computeGraph(node, lastNode,isVisible) {
    var acc = [];
    for (var i in node.targets) {
        var newLastNode = computeNode(node.targets[i], lastNode);
        if (lastNode != node && !isVisible && lastNode != newLastNode)
            lastNode = newLastNode;
        if (newLastNode != node.targets[i]) {
            var newAcc = computeGraph(node.targets[i], lastNode,true);
            if (lastNode === null && newAcc.length > 0)
            	lastNode = newAcc[newAcc.length-1];
            for (var i in newAcc) {
                acc.push(newAcc[i]);
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
    if (filters.allowTypes.indexOf(node.type) != -1)
        if (filters.excludeNames.indexOf(node.label) === -1)
            if (filters.dateBegin <= node.dateBegin && filters.dateEnd >= node.dateEnd) {
                return true;
            }
    return false;
}

function computeOrigin() {
    var nodeOrigin = getNodeOrigin();
    if (nodeOrigin === "") {
        //It's better if you give me an origin node
        nodeOrigin = treeNodes[0];
    }
    if (nodeOrigin.sources.length != 0) {
        nodeOrigin.targets.push(nodeOrigin.sources[0])
        nodeOrigin.sources = [];
    }
    for (var j in nodeOrigin.targets) {
        setNodeDirection(nodeOrigin.targets[j], nodeOrigin);
    }

}

function setNodeDirection(node, previousNode) {
    if (node.sources[0] != previousNode) {
        node.targets.push(node.sources[0]);
        node.sources[0] = node.targets.splice(node.targets.indexOf(previousNode))[0];
    }
    for (var i in node.targets)
        setNodeDirection(node.targets[i], node)
}

function getNodeOrigin() {
    for (i in treeNodes)
        if (treeNodes[i].origin)
            return treeNodes[i];
    return "";
}

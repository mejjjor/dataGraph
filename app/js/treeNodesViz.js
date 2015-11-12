var core = require('./treeNodesCore.js');
var _ = require('../../node_modules/underscore/underscore-min.js');
var treeNodes = [];
var links = [];
var nodes = [];
var filters = {
    allowTypes: [],
    allowIds: [],
    dateBegin: "",
    dateEnd: ""
}

module.exports = {
    init: function(d3Nodes, d3Links) {
        nodes = d3Nodes;
        links = d3Links;
    },
    exportData: function() {
        return core.exportData(treeNodes, filters);
    },
    importData: function(data) {
        var dataImport = core.importData(data)
        treeNodes = dataImport.treeNodes;
        filters = dataImport.filters;
        return treeNodes;
    },
    getLinks: function() {
        return core.getLinks(treeNodes);
    },
    getNodesTypes: function() {
        return core.getNodesTypes(treeNodes);
    },
    switchType: function(type) {
        for (var i = 0; i < filters.allowTypes.length; i++) {
            if (filters.allowTypes[i].label === type) {
                filters.allowTypes[i].isActive = !filters.allowTypes[i].isActive;
                getTree();
                return !filters.allowTypes[i].isActive;
            }
        }
    },
    changeDate: function(dates) {
        filters.dateBegin = dates[0];
        filters.dateEnd = dates[1];
        getTree();
    },
    getDateFilterStart: function() {
        return filters.dateBegin;
    },
    getDateFilterEnd: function() {
        return filters.dateEnd;
    },
    getDateRange: function() {
        var min = treeNodes[0].dateBegin;
        var max = treeNodes[0].dateEnd;
        for (var i = 1; i < treeNodes.length; i++) {
            if (treeNodes[i].dateBegin != "" && (treeNodes[i].dateBegin < min || min === ""))
                min = treeNodes[i].dateBegin;
            if (treeNodes[i].dateEnd != "" && (treeNodes[i].dateEnd > max || max === ""))
                max = treeNodes[i].dateEnd;
        }
        return {
            min: min,
            max: max
        };
    }
}

function getTree() {
    while (nodes.length > 0)
        nodes.pop();
    while (links.length > 0)
        links.pop();
    var spineNodes = getSpineNodes();
    if (spineNodes.length > 0)
        computeTree(spineNodes[0], null, null);
}

function getSpineNodes() {
    var spineNodes = [];
    for (var i = 0; i < treeNodes.length; i++) {
        if (treeNodes[i].isSpine)
            spineNodes.push(treeNodes[i]);
    }
    return spineNodes;
}

function computeTree(node, previousNode, lastLink) {
    if (isIdAllow(node) && isDateAllow(node)) {
        if (node.isSpine || isTypeAllow(node)) {
            nodes.push(node);
            if (lastLink != null) {
                links.push({
                    source: node,
                    target: lastLink
                });
            }
            lastLink = node;
        }

        for (var i = 0; i < node.brothers.length; i++) {
            if (node.brothers[i] != previousNode)
                computeTree(node.brothers[i], node, lastLink);
        }
    } else {
        for (var i = 0; i < node.brothers.length; i++) {
            if (node.brothers[i] != previousNode && node.brothers[i].isSpine)
                computeTree(node.brothers[i], node, lastLink);
        }
    }
};

function isIdAllow(node) {
    //return (filters.allowIds.indexOf(node) != -1);
    return true;
}

function isTypeAllow(node) {
    for (var i = 0; i < filters.allowTypes.length; i++)
        if (filters.allowTypes[i].label === node.type)
            return filters.allowTypes[i].isActive;
}

function isDateAllow(node) {
    return ((node.dateBegin === "" || filters.dateEnd >= node.dateBegin) && (node.dateEnd === "" || filters.dateBegin <= node.dateEnd));

}
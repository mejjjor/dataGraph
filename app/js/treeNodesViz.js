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
        return core.exportData(treeNodes,filters);
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
        var index = _.map(filters.allowTypes,function(val){return val.label}).indexOf(type);
        if (index != -1)
            filters.allowTypes.splice(index, 1);
        else
            filters.allowTypes.push(type)
        getTree();
        if (index === -1)
            return false;
        return true;
    }
}

function getTree() {
    while (nodes.length > 0)
        nodes.pop();
    while (links.length > 0)
        links.pop();
    var spineNodes = getSpineNodes();
    if (spineNodes.length > 0)
        computeTree(spineNodes[0], null);
}

function getSpineNodes() {
    var spineNodes = [];
    for (var i = 0; i < treeNodes.length; i++) {
        if (treeNodes[i].isSpine)
            spineNodes.push(treeNodes[i]);
    }
    return spineNodes;
}

function computeTree(node, previousNode) {
    if (isIdAllow(node) && isDateAllow(node)) {
        if (isTypeAllow(node)) {
            nodes.push(node);
            if (previousNode != null) {
                links.push({
                    source: node,
                    target: previousNode
                });
            }
        }
        for (var i = 0; i < node.brothers.length; i++) {
            if (node.brothers[i] != previousNode)
                computeTree(node.brothers[i], node);
        }
    } else {
        return;
    }
};

function isIdAllow(node) {
    //return (filters.allowIds.indexOf(node) != -1);
    return true;
}

function isTypeAllow(node) {
    return (_.map(filters.allowTypes,function(val){return val.label}).indexOf(node.type) != -1);
}

function isDateAllow(node) {
    //return ((node.dateBegin == "" || filters.dateEnd >= node.dateBegin) && (node.dateEnd == "" || filters.dateBegin <= node.dateEnd));
    return true;
}

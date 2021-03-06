var _ = require('../../../node_modules/underscore/underscore-min.js');
module.exports = {
    exportData: function(treeNodes, filters) {
        var data = {
            treeNodes: [],
            nodeNextId: 0,
            filters: filters
        };
        for (var i = 0; i < treeNodes.length; i++) {
            if (treeNodes[i].id > data.nodeNextId)
                data.nodeNextId = treeNodes[i].id;
            var brothers = [];
            for (var j = 0; j < treeNodes[i].brothers.length; j++)
                brothers.push(treeNodes[i].brothers[j].id);

            var node = {
                id: treeNodes[i].id,
                x: Math.round(treeNodes[i].x),
                y: Math.round(treeNodes[i].y),
                isSpine: treeNodes[i].isSpine,
                brothers: brothers,
                label: treeNodes[i].label,
                type: treeNodes[i].type,
                color: treeNodes[i].color,
                description: treeNodes[i].description,
                dateBegin: treeNodes[i].dateBegin,
                dateEnd: treeNodes[i].dateEnd
            }
            data.treeNodes.push(node);
        }
        data.nodeNextId++;
        return JSON.stringify(data);
    },
    importData: function(dataImport) {
        var data = JSON.parse(dataImport);
        var treeNodes = [];

        for (var i = 0; i < data.treeNodes.length; i++) {
            if (data.treeNodes[i].dateBegin != "")
                data.treeNodes[i].dateBegin = new Date(data.treeNodes[i].dateBegin);
            else
                data.treeNodes[i].dateBegin = "";
            if (data.treeNodes[i].dateEnd != "")
                data.treeNodes[i].dateEnd = new Date(data.treeNodes[i].dateEnd);
            else
                data.treeNodes[i].dateEnd = "";
            var brothers = [];
            for (var j = 0; j < data.treeNodes[i].brothers.length; j++) {
                brothers.push(findNodeById(data.treeNodes[i].brothers[j], data.treeNodes));
            }
            data.treeNodes[i].brothers = brothers;
        }
        return data;
    },
    getLinks: function(treeNodes) {
        var nodesDone = [];
        var links = [];
        for (var i = 0; i < treeNodes.length; i++) {
            if (nodesDone.indexOf(treeNodes[i].id) === -1) {
                var result = computeNode(treeNodes[i], nodesDone, links, null);
            }
        }
        return links;
    },
    getNodesTypes: function(treeNodes) {
        var nodesTypes = [];
        for (var i = 0; i < treeNodes.length; i++) {
            if (treeNodes[i].type != "" && _.map(nodesTypes, function(val) {
                    return val.label
                }).indexOf(treeNodes[i].type) === -1) {
                nodesTypes.push({
                    label: treeNodes[i].type,
                    color: treeNodes[i].color,
                    isActive: true
                });
            }
        }
        return nodesTypes;
    },
    getSpineNodes: function(treeNodes) {
        var spineNodes = [];
        for (var i = 0; i < treeNodes.length; i++) {
            if (treeNodes[i].isSpine)
                spineNodes.push(treeNodes[i]);
        }
        return spineNodes;
    }
}

function findNodeById(id, treeNodes) {
    for (var i = 0; i < treeNodes.length; i++) {
        if (treeNodes[i].id === id)
            return treeNodes[i];
    }
}


function computeNode(node, nodesDone, links, previousNode) {
    nodesDone.push(node.id);
    for (var i = 0; i < node.brothers.length; i++) {
        if (previousNode != node.brothers[i]) {
            links.push({
                source: node,
                target: node.brothers[i]
            });
            computeNode(node.brothers[i], nodesDone, links, node);
        }
    }
    return {
        nodesDone: nodesDone,
        links: links
    };

}

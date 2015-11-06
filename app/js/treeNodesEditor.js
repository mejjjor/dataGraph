var core = require('./treeNodesCore.js');
var treeNodes = [];
var nodeNextId = 1;

module.exports = {
    removeAllNodesFromTreeNodes: function() {
        treeNodes = [];
        nodeNextId = 1;
    },
    getTreeNodes: function() {
        return treeNodes;
    },
    createNode: function(x, y) {
    	if(x === undefined)
    		x = 0;
    	if(y === undefined)
    		y = 0;
        var elem = {
            id: nodeNextId,
            x: x,
            y: y,
            isSpine: false,
            brothers: [],
            label: "label " + nodeNextId,
            type: "",
            color: "rgb(114, 147, 168)",
            description: "",
            dateBegin: "",
            dateEnd: ""
        };
        nodeNextId++;
        treeNodes.push(elem);
        return elem;
    },
    createLink: function(node1, node2) {
        if (node1 === node2)
            throw new Error('You cannot create a link from and to the same node');
        if (node1.brothers.indexOf(node2) != -1)
            throw new Error('A link already exists on same nodes');
        node1.brothers.push(node2);
        node2.brothers.push(node1);
        var elem = {
            source: node1,
            target: node2
        };
        return elem;
    },
    deleteNode: function(node) {
        var index = treeNodes.indexOf(node);
        if (index === -1)
            throw new Error('node not exists');
        for (var i = 0; i < node.brothers.length; i++) {
            node.brothers[i].brothers.splice(node.brothers[i].brothers.indexOf(node), 1);
        }
        treeNodes.splice(index, 1);
    },
    deleteLink: function(node1, node2) {
        var index1 = node1.brothers.indexOf(node2);
        var index2 = node2.brothers.indexOf(node1);
        if (index1 === -1 || index2 === -1)
            throw new Error('link not exists');
        node1.brothers.splice(index1, 1);
        node2.brothers.splice(index2, 1);
    },
    getNodesTypes: function(){
    	var nodesTypes = [];
    	for (var i=0;i<treeNodes.length;i++){
    		if (nodesTypes.indexOf(treeNodes[i].type) === -1)
    			nodesTypes.push(treeNodes[i].type);
    	}
    	return nodesTypes;
    },
    exportData: function() {
        return core.exportData(treeNodes);
    },
    importData: function(data) {
        var dataImport = core.importData(data)
        treeNodes = dataImport.treeNodes;
        nodeNextId = dataImport.nodeNextId;
    }
}

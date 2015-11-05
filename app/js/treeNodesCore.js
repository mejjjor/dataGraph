module.exports = {
    exportData: function(treeNodes) {
        var data = {
            treeNodes: [],
            nodeNextId: 0
        };
        for (var i = 0; i < treeNodes.length; i++) {
            if (treeNodes[i].id > data.nodeNextId)
                data.nodeNextId = treeNodes[i].id;
            var brothers = [];
            for (var j = 0; j < treeNodes[i].brothers.length; j++)
                brothers.push(treeNodes[i].brothers[j].id);

            var node = {
                id: treeNodes[i].id,
                x: treeNodes[i].x,
                y: treeNodes[i].y,
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
        return JSON.stringify(data);
    },
    importData: function(dataImport) {
        var data = JSON.parse(dataImport);
        var treeNodes = [];

        for (var i = 0; i < data.treeNodes.length; i++) {
            var brothers = [];
            for (var j = 0; j < data.treeNodes[i].brothers.length; j++) {
                brothers.push(findNodeById(data.treeNodes[i].brothers[j], data.treeNodes));
            }
            data.treeNodes[i].brothers = brothers;
        }
        return data;
    }

}

function findNodeById(id, treeNodes) {
    for (var i = 0; i < treeNodes.length; i++) {
        if (treeNodes[i].id === id)
            return treeNodes[i];
    }
}

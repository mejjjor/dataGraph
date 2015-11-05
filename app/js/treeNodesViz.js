var treeNodes = [];
var nodeNextId = 1;
var links = [];
var nodes = [];
var filters = {
    allowTypes: [],
    allowNames: [],
    dateBegin: "",
    dateEnd: ""
}

module.exports = {
    init: function(d3Nodes, d3Links) {
        nodes = d3Nodes;
        links = d3Links;
    },
    getTree: function(filters) {

    }
}

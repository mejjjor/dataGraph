var $ = require('../../../node_modules/jquery/dist/jquery.min.js');
var data = require('../data/dataGraph.json');
var viz = require("../viz.js");

$(document).ready(function() {
    viz.initGraph(data);
});

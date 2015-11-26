var $ = require('../../../node_modules/jquery/dist/jquery.min.js');
var data = require('../data/middle.json');
var viz = require("../viz.js");

$(document).ready(function() {
    viz.initGraph(data);
});

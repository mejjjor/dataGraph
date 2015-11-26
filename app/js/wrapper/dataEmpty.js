var $ = require('../../../node_modules/jquery/dist/jquery.min.js');
var viz = require("../viz.js");
var data;

$(document).ready(function() {
    $("#btnImportData").click(function() {
        data = document.getElementById("exchange").value;
        document.getElementById("importExport").style.display = "none";
        document.getElementById("menuImportExport").style.display = "none";
        viz.initGraph(data);
    });
});

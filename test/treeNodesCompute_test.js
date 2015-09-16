var expect = require('chai').expect;
var tree = require('../app/js/treeNodes.js');

describe("computeGraph", function() {
    before(function() {
        tree.setFilterAllowTypes(["visible", "showable"]);
        tree.setFilterExcludeNames(["hideMe", "notSee"]);
    });
    beforeEach(function() {
        tree.removeAllNodesFromTreeNodes();
    });

    it("should return empty graph if no origin", function() {
        var nodeS = tree.createNode();
        var nodeT = tree.createNode();
        tree.createLink(nodeS, nodeT);
        var graph = tree.getGraph();
        expect(graph.nodes).to.be.empty;
        expect(graph.links).to.be.empty;
    });
    it("should return empty graph if filters not match", function() {
        var nodeS = tree.createNode();
        var nodeT = tree.createNode();
        nodeS.origin = true;
        tree.createLink(nodeS, nodeT);
        var graph = tree.getGraph();
        expect(graph.nodes).to.be.empty;
        expect(graph.links).to.be.empty;
    });
    it("should return nodes: 1 / links: ", function() {
        var node1 = tree.createNode();
        var node2 = tree.createNode();
        node1.origin = true;
        node1.type = "visible";
        tree.createLink(node1, node2);
        var graph = tree.getGraph();
        expect(graph.nodes).to.contains(node1);
        expect(graph.nodes.length).to.be.equal(1);
        expect(graph.links).to.be.empty;
    });
    it("should return on 1VO-2V ", function() {
        var node1 = tree.createNode();
        var node2 = tree.createNode();
        node1.origin = true;
        node1.type = "visible";
        node2.type = "visible";
        tree.createLink(node1, node2);
        var graph = tree.getGraph();
        expect(graph.nodes).to.contains(node1);
        expect(graph.nodes).to.contains(node2);
        expect(graph.nodes.length).to.be.equal(2);
        expect(graph.links).to.contains({
            source: node1,
            target: node2
        });
        expect(graph.links.length).to.be.equal(1);
    });
    it("should return on 3V-1V0-2V ", function() {
        var node1 = tree.createNode();
        var node2 = tree.createNode();
        var node3 = tree.createNode();
        node1.origin = true;
        node1.type = "visible";
        node2.type = "visible";
        node3.type = "visible";
        tree.createLink(node1, node2);
        tree.createLink(node1, node3);
        var graph = tree.getGraph();
        expect(graph.nodes).to.contains(node1);
        expect(graph.nodes).to.contains(node2);
        expect(graph.nodes).to.contains(node3);
        expect(graph.nodes.length).to.be.equal(3);
        expect(graph.links).to.contains({
            source: node1,
            target: node2
        });
        expect(graph.links).to.contains({
            source: node1,
            target: node3
        });
        expect(graph.links.length).to.be.equal(2);
    });
    it("should return on 1V0-2V-3V ", function() {
        var node1 = tree.createNode();
        var node2 = tree.createNode();
        var node3 = tree.createNode();
        node1.origin = true;
        node1.type = "visible";
        node2.type = "visible";
        node3.type = "visible";
        tree.createLink(node1, node2);
        tree.createLink(node2, node3);
        var graph = tree.getGraph();
        expect(graph.nodes).to.contains(node1);
        expect(graph.nodes).to.contains(node2);
        expect(graph.nodes).to.contains(node3);
        expect(graph.nodes.length).to.be.equal(3);
        expect(graph.links).to.contains({
            source: node1,
            target: node2
        });
        expect(graph.links).to.contains({
            source: node2,
            target: node3
        });
        expect(graph.links.length).to.be.equal(2);
    });
    it("should return on 1V0-2H-3V ", function() {
        var node1 = tree.createNode();
        var node2 = tree.createNode();
        var node3 = tree.createNode();
        node1.origin = true;
        node1.type = "visible";
        node3.type = "visible";
        tree.createLink(node1, node2);
        tree.createLink(node2, node3);
        var graph = tree.getGraph();
        expect(graph.nodes).to.contains(node1);
        expect(graph.nodes).to.contains(node3);
        expect(graph.nodes.length).to.be.equal(2);
        expect(graph.links).to.contains({
            source: node1,
            target: node3
        });
        expect(graph.links.length).to.be.equal(1);
    });
    it("should return on 1HO-2V-3V", function() {
        var node1 = tree.createNode();
        var node2 = tree.createNode();
        var node3 = tree.createNode();
        node1.origin = true;
        node2.type = "visible";
        node3.type = "visible";
        tree.createLink(node1, node2);
        tree.createLink(node1, node3);
        var graph = tree.getGraph();
        expect(graph.nodes).to.contains(node2);
        expect(graph.nodes).to.contains(node3);
        expect(graph.nodes.length).to.be.equal(2);
        expect(graph.links).to.contains({
            source: node2,
            target: node3
        });
        expect(graph.links.length).to.be.equal(1);
    });
    it("should return on 1HO-2H-3V", function() {
        var node1 = tree.createNode();
        var node2 = tree.createNode();
        var node3 = tree.createNode();
        node1.origin = true;
        node3.type = "visible";
        tree.createLink(node1, node2);
        tree.createLink(node1, node3);
        var graph = tree.getGraph();
        expect(graph.nodes).to.contains(node3);
        expect(graph.nodes.length).to.be.equal(1);
        expect(graph.links.length).to.be.equal(0);
    });
    it("should return on 1HO-2V-3V / 1HO-4V", function() {
        var node1 = tree.createNode();
        var node2 = tree.createNode();
        var node3 = tree.createNode();
        var node4 = tree.createNode();
        node1.origin = true;
        node2.type = "visible";
        node3.type = "visible";
        node4.type = "visible";
        tree.createLink(node1, node2);
        tree.createLink(node2, node3);
        tree.createLink(node1, node4);
        var graph = tree.getGraph();
        expect(graph.nodes).to.contains(node2);
        expect(graph.nodes).to.contains(node3);
        expect(graph.nodes).to.contains(node4);
        expect(graph.nodes.length).to.be.equal(3);
        expect(graph.links).to.contains({
            source: node2,
            target: node3
        });
        expect(graph.links).to.contains({
            source: node2,
            target: node4
        });
        expect(graph.links.length).to.be.equal(2);
    });
    it("should return on 1HO-2V-3V / 1HO-4VO", function() {
        var node1 = tree.createNode();
        var node2 = tree.createNode();
        var node3 = tree.createNode();
        var node4 = tree.createNode();
        node1.origin = true;
        node4.origin = true;
        node2.type = "visible";
        node3.type = "visible";
        node4.type = "visible";
        tree.createLink(node1, node2);
        tree.createLink(node2, node3);
        tree.createLink(node1, node4);
        var graph = tree.getGraph();
        expect(graph.nodes).to.contains(node2);
        expect(graph.nodes).to.contains(node3);
        expect(graph.nodes).to.contains(node4);
        expect(graph.nodes.length).to.be.equal(3);
        expect(graph.links).to.contains({
            source: node2,
            target: node3
        });
        expect(graph.links).to.contains({
            source: node2,
            target: node4
        });
        expect(graph.links.length).to.be.equal(2);
    });
    it("should return on 1HO-2V-3V / 1HO-4VO / 4VO-5VO", function() {
        var node1 = tree.createNode();
        var node2 = tree.createNode();
        var node3 = tree.createNode();
        var node4 = tree.createNode();
        var node5 = tree.createNode();
        node1.origin = true;
        node4.origin = true;
        node5.origin = true;
        node2.type = "visible";
        node3.type = "visible";
        node4.type = "visible";
        node5.type = "visible";
        tree.createLink(node1, node2);
        tree.createLink(node2, node3);
        tree.createLink(node1, node4);
        tree.createLink(node4, node5);
        var graph = tree.getGraph();
        expect(graph.nodes).to.contains(node2);
        expect(graph.nodes).to.contains(node3);
        expect(graph.nodes).to.contains(node4);
        expect(graph.nodes).to.contains(node5);
        expect(graph.nodes.length).to.be.equal(4);
        expect(graph.links).to.contains({
            source: node2,
            target: node3
        });
        expect(graph.links).to.contains({
            source: node2,
            target: node4
        });
        expect(graph.links).to.contains({
            source: node4,
            target: node5
        });
        expect(graph.links.length).to.be.equal(3);
    });
    it("should return on 1HO-2H-3V / 1HO-4VO / 4HO-5VO", function() {
        var node1 = tree.createNode();
        var node2 = tree.createNode();
        var node3 = tree.createNode();
        var node4 = tree.createNode();
        var node5 = tree.createNode();
        node1.origin = true;
        node4.origin = true;
        node5.origin = true;
        node3.type = "visible";
        node4.type = "visible";
        node5.type = "visible";
        tree.createLink(node1, node2);
        tree.createLink(node2, node3);
        tree.createLink(node1, node4);
        tree.createLink(node4, node5);
        var graph = tree.getGraph();
        expect(graph.nodes).to.contains(node3);
        expect(graph.nodes).to.contains(node4);
        expect(graph.nodes).to.contains(node5);
        expect(graph.nodes.length).to.be.equal(3);
        expect(graph.links).to.contains({
            source: node3,
            target: node4
        });
        expect(graph.links).to.contains({
            source: node4,
            target: node5
        });
        expect(graph.links.length).to.be.equal(2);
    });
    it("should return on 1HO-2H-3H / 1HO-4VO / 4VO-5VO", function() {
        var node1 = tree.createNode();
        var node2 = tree.createNode();
        var node3 = tree.createNode();
        var node4 = tree.createNode();
        var node5 = tree.createNode();
        node1.origin = true;
        node4.origin = true;
        node5.origin = true;
        node4.type = "visible";
        node5.type = "visible";
        tree.createLink(node1, node2);
        tree.createLink(node2, node3);
        tree.createLink(node1, node4);
        tree.createLink(node4, node5);
        var graph = tree.getGraph();
        expect(graph.nodes).to.contains(node4);
        expect(graph.nodes).to.contains(node5);
        expect(graph.nodes.length).to.be.equal(2);
        expect(graph.links).to.contains({
            source: node4,
            target: node5
        });
        expect(graph.links.length).to.be.equal(1);
    });
    it("should return on 1VO-2H-3V / 1VO-4HO / 4HO-5VO", function() {
        var node1 = tree.createNode();
        var node2 = tree.createNode();
        var node3 = tree.createNode();
        var node4 = tree.createNode();
        var node5 = tree.createNode();
        node1.origin = true;
        node4.origin = true;
        node5.origin = true;
        node1.type = "visible";
        node3.type = "visible";
        node5.type = "visible";
        tree.createLink(node1, node2);
        tree.createLink(node2, node3);
        tree.createLink(node1, node4);
        tree.createLink(node4, node5);
        var graph = tree.getGraph();
        expect(graph.nodes).to.contains(node1);
        expect(graph.nodes).to.contains(node3);
        expect(graph.nodes).to.contains(node5);
        expect(graph.nodes.length).to.be.equal(3);
        expect(graph.links).to.contains({
            source: node1,
            target: node3
        });
        expect(graph.links).to.contains({
            source: node1,
            target: node5
        });
        expect(graph.links.length).to.be.equal(2);
    });
    it("should return on 1VO-2H-3V / 1VO-4VO / 2H-5V", function() {
        var node1 = tree.createNode();
        var node2 = tree.createNode();
        var node3 = tree.createNode();
        var node4 = tree.createNode();
        var node5 = tree.createNode();
        node1.origin = true;
        node4.origin = true;
        node1.type = "visible";
        node3.type = "visible";
        node4.type = "visible";
        node5.type = "visible";
        tree.createLink(node1, node2);
        tree.createLink(node2, node3);
        tree.createLink(node1, node4);
        tree.createLink(node2, node5);
        var graph = tree.getGraph();
        expect(graph.nodes).to.contains(node1);
        expect(graph.nodes).to.contains(node3);
        expect(graph.nodes).to.contains(node4);
        expect(graph.nodes).to.contains(node5);
        expect(graph.nodes.length).to.be.equal(4);
        expect(graph.links).to.contains({
            source: node1,
            target: node3
        });
        expect(graph.links).to.contains({
            source: node1,
            target: node5
        });
        expect(graph.links).to.contains({
            source: node1,
            target: node4
        });
        expect(graph.links.length).to.be.equal(3);
    });
});

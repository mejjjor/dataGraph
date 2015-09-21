var expect = require('chai').expect;
var tree = require('../app/js/treeNodes.js');

describe("computeGraph", function() {
    beforeEach(function() {
        tree.removeAllNodesFromTreeNodes();
    });

    it("should return graph with first node if no origin", function() {
        var nodeS = tree.createNode();
        var nodeT = tree.createNode();
        tree.setGraph();
        var graph = tree.getData();
        expect(graph.nodes).to.contains(nodeS);
        expect(graph.nodes.length).to.be.equal(1);
        expect(graph.links).to.be.empty;
    });
    it("should return on 1VO-2H", function() {
        var node1 = tree.createNode();
        var node2 = tree.createNode();
        node1.origin = true;
        node2.type = "hidden";
        tree.createLink(node1, node2);
        tree.setGraph();
        var graph = tree.getData();
        expect(graph.nodes).to.contains(node1);
        expect(graph.nodes.length).to.be.equal(1);
        expect(graph.links).to.be.empty;
    });
    it("1VO-2V ", function() {
        var node1 = tree.createNode();
        var node2 = tree.createNode();
        node1.origin = true;
        tree.createLink(node1, node2);
        tree.setGraph();
        var graph = tree.getData();
        expect(graph.nodes).to.contains(node1);
        expect(graph.nodes).to.contains(node2);
        expect(graph.nodes.length).to.be.equal(2);
        expect(graph.links).to.contains({
            source: node1,
            target: node2
        });
        expect(graph.links.length).to.be.equal(1);
    });
    it("3V-1V0-2V ", function() {
        var node1 = tree.createNode();
        var node2 = tree.createNode();
        var node3 = tree.createNode();
        node1.origin = true;
        tree.createLink(node1, node2);
        tree.createLink(node1, node3);
        tree.setGraph();
        var graph = tree.getData();
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
    it("1V0-2V-3V ", function() {
        var node1 = tree.createNode();
        var node2 = tree.createNode();
        var node3 = tree.createNode();
        node1.origin = true;
        tree.createLink(node1, node2);
        tree.createLink(node2, node3);
        tree.setGraph();
        var graph = tree.getData();
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
    it("1V0-2H-3V ", function() {
        var node1 = tree.createNode();
        var node2 = tree.createNode();
        var node3 = tree.createNode();
        node1.origin = true;
        node2.type = "hidden";
        tree.createLink(node1, node2);
        tree.createLink(node2, node3);
        tree.setGraph();
        var graph = tree.getData();
        expect(graph.nodes).to.contains(node1);
        expect(graph.nodes).to.contains(node3);
        expect(graph.nodes.length).to.be.equal(2);
        expect(graph.links).to.contains({
            source: node1,
            target: node3
        });
        expect(graph.links.length).to.be.equal(1);
    });
    it("1HO-2V-3V", function() {
        var node1 = tree.createNode();
        var node2 = tree.createNode();
        var node3 = tree.createNode();
        node1.origin = true;
        node1.type = "hidden";
        tree.createLink(node1, node2);
        tree.createLink(node2, node3);
        tree.setGraph();
        var graph = tree.getData();
        expect(graph.nodes).to.contains(node2);
        expect(graph.nodes).to.contains(node3);
        expect(graph.nodes.length).to.be.equal(2);
        expect(graph.links).to.contains({
            source: node2,
            target: node3
        });
        expect(graph.links.length).to.be.equal(1);
    });
    it("1HO-2H-3V", function() {
        var node1 = tree.createNode();
        var node2 = tree.createNode();
        var node3 = tree.createNode();
        node1.origin = true;
        node1.type = "hidden";
        node2.type = "hidden";
        tree.createLink(node1, node2);
        tree.createLink(node1, node3);
        tree.setGraph();
        var graph = tree.getData();
        expect(graph.nodes).to.contains(node3);
        expect(graph.nodes.length).to.be.equal(1);
        expect(graph.links.length).to.be.equal(0);
    });
    it("1HO-2V-3V / 1HO-4V", function() {
        var node1 = tree.createNode();
        var node2 = tree.createNode();
        var node3 = tree.createNode();
        var node4 = tree.createNode();
        node1.origin = true;
        node1.type = "hidden";
        tree.createLink(node1, node2);
        tree.createLink(node2, node3);
        tree.createLink(node1, node4);
        tree.setGraph();
        var graph = tree.getData();
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
    it("1HO-2V-3V / 1HO-4V", function() {
        var node1 = tree.createNode();
        var node2 = tree.createNode();
        var node3 = tree.createNode();
        var node4 = tree.createNode();
        node1.origin = true;
        node1.type = "hidden";
        tree.createLink(node1, node2);
        tree.createLink(node2, node3);
        tree.createLink(node1, node4);
        tree.setGraph();
        var graph = tree.getData();
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
    it("1HO-2V-3V / 1HO-4V / 4V-5V", function() {
        var node1 = tree.createNode();
        var node2 = tree.createNode();
        var node3 = tree.createNode();
        var node4 = tree.createNode();
        var node5 = tree.createNode();
        node1.origin = true;
        node1.type = "hidden";
        tree.createLink(node1, node2);
        tree.createLink(node2, node3);
        tree.createLink(node1, node4);
        tree.createLink(node4, node5);
        tree.setGraph();
        var graph = tree.getData();
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
    it("1HO-2H-3V / 1HO-4V / 4V-5V", function() {
        var node1 = tree.createNode();
        var node2 = tree.createNode();
        var node3 = tree.createNode();
        var node4 = tree.createNode();
        var node5 = tree.createNode();
        node1.origin = true;
        node1.type = "hidden";
        node2.type = "hidden";
        tree.createLink(node1, node2);
        tree.createLink(node2, node3);
        tree.createLink(node1, node4);
        tree.createLink(node4, node5);
        tree.setGraph();
        var graph = tree.getData();
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
    it("1HO-2H-3H / 1HO-4V / 4V-5V", function() {
        var node1 = tree.createNode();
        var node2 = tree.createNode();
        var node3 = tree.createNode();
        var node4 = tree.createNode();
        var node5 = tree.createNode();
        node1.origin = true;
        node1.type = "hidden";
        node2.type = "hidden";
        node3.type = "hidden";
        tree.createLink(node1, node2);
        tree.createLink(node2, node3);
        tree.createLink(node1, node4);
        tree.createLink(node4, node5);
        tree.setGraph();
        var graph = tree.getData();
        expect(graph.nodes).to.contains(node4);
        expect(graph.nodes).to.contains(node5);
        expect(graph.nodes.length).to.be.equal(2);
        expect(graph.links).to.contains({
            source: node4,
            target: node5
        });
        expect(graph.links.length).to.be.equal(1);
    });
    it("1VO-2H-3V / 2H-4V", function() {
        var node1 = tree.createNode();
        var node2 = tree.createNode();
        var node3 = tree.createNode();
        var node4 = tree.createNode();
        node1.origin = true;
        node2.type = "hidden";
        tree.createLink(node1, node2);
        tree.createLink(node2, node3);
        tree.createLink(node2, node4);
        tree.setGraph();
        var graph = tree.getData();
        expect(graph.nodes).to.contains(node1);
        expect(graph.nodes).to.contains(node3);
        expect(graph.nodes).to.contains(node4);
        expect(graph.nodes.length).to.be.equal(3);
        expect(graph.links).to.contains({
            source: node1,
            target: node3
        });
        // expect(graph.links).to.contains({
        //     source: node3,
        //     target: node4
        // });
        expect(graph.links.length).to.be.equal(2);
    });
    it("1VO-2H-3V / 1VO-4H / 4H-5V", function() {
        var node1 = tree.createNode();
        var node2 = tree.createNode();
        var node3 = tree.createNode();
        var node4 = tree.createNode();
        var node5 = tree.createNode();
        node1.origin = true;
        node2.type = "hidden";
        node4.type = "hidden";
        tree.createLink(node1, node2);
        tree.createLink(node2, node3);
        tree.createLink(node1, node4);
        tree.createLink(node4, node5);
        tree.setGraph();
        var graph = tree.getData();
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
    it("1VO-2H-3V / 1VO-4V / 2H-5V", function() {
        var node1 = tree.createNode();
        var node2 = tree.createNode();
        var node3 = tree.createNode();
        var node4 = tree.createNode();
        var node5 = tree.createNode();
        node1.origin = true;
        node2.type = "hidden";
        tree.createLink(node1, node2);
        tree.createLink(node2, node3);
        tree.createLink(node1, node4);
        tree.createLink(node2, node5);
        tree.setGraph();
        var graph = tree.getData();
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
    it("1HO-2V-3H / 1HO-4V / 1H-5V / 4V-6V", function() {
        var node1 = tree.createNode();
        var node2 = tree.createNode();
        var node3 = tree.createNode();
        var node4 = tree.createNode();
        var node5 = tree.createNode();
        var node6 = tree.createNode();
        node1.origin = true;
        node1.type = "hidden";
        node3.type = "hidden";
        tree.createLink(node1, node2);
        tree.createLink(node2, node3);
        tree.createLink(node1, node4);
        tree.createLink(node1, node5);
        tree.createLink(node4, node6);
        tree.setGraph();
        var graph = tree.getData();
        expect(graph.nodes).to.contains(node2);
        expect(graph.nodes).to.contains(node4);
        expect(graph.nodes).to.contains(node5);
        expect(graph.nodes).to.contains(node6);
        expect(graph.nodes.length).to.be.equal(4);
        expect(graph.links).to.contains({
            source: node2,
            target: node4
        });
        expect(graph.links).to.contains({
            source: node4,
            target: node5
        });
        expect(graph.links).to.contains({
            source: node4,
            target: node6
        });
        expect(graph.links.length).to.be.equal(3);
    });
    it("1VO-2H-3V / 1VO-4H-5V / 4H-6V / 4H-7V", function() {
        var node1 = tree.createNode();
        var node2 = tree.createNode();
        var node3 = tree.createNode();
        var node4 = tree.createNode();
        var node5 = tree.createNode();
        var node6 = tree.createNode();
        var node7 = tree.createNode();
        node1.origin = true;
        node2.type = "hidden";
        node4.type = "hidden";
        tree.createLink(node1, node2);
        tree.createLink(node2, node3);
        tree.createLink(node1, node4);
        tree.createLink(node4, node5);
        tree.createLink(node4, node6);
        tree.createLink(node4, node7);
        tree.setGraph();
        var graph = tree.getData();
        expect(graph.nodes).to.contains(node1);
        expect(graph.nodes).to.contains(node3);
        expect(graph.nodes).to.contains(node5);
        expect(graph.nodes).to.contains(node6);
        expect(graph.nodes).to.contains(node7);
        expect(graph.nodes.length).to.be.equal(5);
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
            target: node6
        });
        expect(graph.links).to.contains({
            source: node1,
            target: node7
        });
        expect(graph.links.length).to.be.equal(4);
    });
    it("1VO-2H-3V-4H-5V / 4H-6V / 1VO-7V-8V / 7V-9V / 1VO-10V-11H-12H-13V / 10V-14H-15V", function() {
        var node1 = tree.createNode();
        var node2 = tree.createNode();
        var node3 = tree.createNode();
        var node4 = tree.createNode();
        var node5 = tree.createNode();
        var node6 = tree.createNode();
        var node7 = tree.createNode();
        var node8 = tree.createNode();
        var node9 = tree.createNode();
        var node10 = tree.createNode();
        var node11 = tree.createNode();
        var node12 = tree.createNode();
        var node13 = tree.createNode();
        var node14 = tree.createNode();
        var node15 = tree.createNode();
        node1.origin = true;
        node2.type = "hidden";
        node4.type = "hidden";
        node11.type = "hidden";
        node12.type = "hidden";
        node14.type = "hidden";
        tree.createLink(node1, node2);
        tree.createLink(node2, node3);
        tree.createLink(node3, node4);
        tree.createLink(node4, node5);
        tree.createLink(node4, node6);
        tree.createLink(node1, node7);
        tree.createLink(node7, node8);
        tree.createLink(node7, node9);
        tree.createLink(node1, node10);
        tree.createLink(node10, node11);
        tree.createLink(node11, node12);
        tree.createLink(node12, node13);
        tree.createLink(node10, node14);
        tree.createLink(node14, node15);
        tree.setGraph();
        var graph = tree.getData();
        expect(graph.nodes).to.contains(node1);
        expect(graph.nodes).to.contains(node3);
        expect(graph.nodes).to.contains(node5);
        expect(graph.nodes).to.contains(node6);
        expect(graph.nodes).to.contains(node7);
        expect(graph.nodes).to.contains(node8);
        expect(graph.nodes).to.contains(node9);
        expect(graph.nodes).to.contains(node10);
        expect(graph.nodes).to.contains(node13);
        expect(graph.nodes).to.contains(node15);
        expect(graph.nodes.length).to.be.equal(10);
        expect(graph.links).to.contains({
            source: node1,
            target: node3
        });
        expect(graph.links).to.contains({
            source: node3,
            target: node5
        });
        expect(graph.links).to.contains({
            source: node3,
            target: node6
        });
        expect(graph.links).to.contains({
            source: node1,
            target: node7
        });
        expect(graph.links).to.contains({
            source: node7,
            target: node8
        });
        expect(graph.links).to.contains({
            source: node7,
            target: node9
        });
        expect(graph.links).to.contains({
            source: node1,
            target: node10
        });
        expect(graph.links).to.contains({
            source: node10,
            target: node13
        });
        expect(graph.links).to.contains({
            source: node10,
            target: node15
        });
        expect(graph.links.length).to.be.equal(9);
    });
    it("1HO-2H-3V-4H-5V / 4H-6V / 1HO-7V-8V / 7V-9V / 1HO-10V-11H-12H-13V / 10V-14H-15V", function() {
        var node1 = tree.createNode();
        var node2 = tree.createNode();
        var node3 = tree.createNode();
        var node4 = tree.createNode();
        var node5 = tree.createNode();
        var node6 = tree.createNode();
        var node7 = tree.createNode();
        var node8 = tree.createNode();
        var node9 = tree.createNode();
        var node10 = tree.createNode();
        var node11 = tree.createNode();
        var node12 = tree.createNode();
        var node13 = tree.createNode();
        var node14 = tree.createNode();
        var node15 = tree.createNode();
        node1.origin = true;
        node1.type = "hidden";
        node2.type = "hidden";
        node4.type = "hidden";
        node11.type = "hidden";
        node12.type = "hidden";
        node14.type = "hidden";
        tree.createLink(node1, node2);
        tree.createLink(node2, node3);
        tree.createLink(node3, node4);
        tree.createLink(node4, node5);
        tree.createLink(node4, node6);
        tree.createLink(node1, node7);
        tree.createLink(node7, node8);
        tree.createLink(node7, node9);
        tree.createLink(node1, node10);
        tree.createLink(node10, node11);
        tree.createLink(node11, node12);
        tree.createLink(node12, node13);
        tree.createLink(node10, node14);
        tree.createLink(node14, node15);
        tree.setGraph();
        var graph = tree.getData();
        expect(graph.nodes).to.contains(node3);
        expect(graph.nodes).to.contains(node5);
        expect(graph.nodes).to.contains(node6);
        expect(graph.nodes).to.contains(node7);
        expect(graph.nodes).to.contains(node8);
        expect(graph.nodes).to.contains(node9);
        expect(graph.nodes).to.contains(node10);
        expect(graph.nodes).to.contains(node13);
        expect(graph.nodes).to.contains(node15);
        expect(graph.nodes.length).to.be.equal(9);
        expect(graph.links).to.contains({
            source: node3,
            target: node5
        });
        expect(graph.links).to.contains({
            source: node3,
            target: node6
        });
        expect(graph.links).to.contains({
            source: node3,
            target: node7
        });
        expect(graph.links).to.contains({
            source: node7,
            target: node8
        });
        expect(graph.links).to.contains({
            source: node7,
            target: node9
        });
        expect(graph.links).to.contains({
            source: node7,
            target: node10
        });
        expect(graph.links).to.contains({
            source: node10,
            target: node13
        });
        expect(graph.links).to.contains({
            source: node10,
            target: node15
        });
        expect(graph.links.length).to.be.equal(8);
    });
});

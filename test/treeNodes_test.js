var expect = require('chai').expect;
var tree = require('../app/js/treeNodes.js');

describe("CRUD on tree", function() {
    beforeEach(function() {
        tree.removeAllNodesFromTreeNodes();
    });
    describe("Node creation", function() {
        it("should create a node", function() {
            var node = tree.createNode();
            expect(node).to.contain.all.keys('id', 'x', 'y');
        });
        it("should store node", function() {
            var node = tree.createNode();
            var treeNodes = tree.getTreeNodes();
            expect(treeNodes).to.contains(node);
            expect(treeNodes.length).to.be.equal(1);
        });
        it("should increase id", function() {
            var node1 = tree.createNode();
            var node2 = tree.createNode();
            expect(node2.id).to.be.greaterThan(node1.id);
        });
        it("should create node with position", function() {
            var node = tree.createNode(10, 20);
            expect(node.x).to.be.equal(10);
            expect(node.y).to.be.equal(20);
        });
        it("should share memory", function() {
            var node = tree.createNode();
            node.label = "Javascript";
            var treeNodes = tree.getTreeNodes();
            expect(treeNodes[0].label).to.be.equal("Javascript");
            treeNodes[0].label = "Java";
            expect(node.label).to.be.equal("Java");
        });
    });
    describe("Link creation", function() {
        it("should throw error if create a link on the same node", function() {
            var node = tree.createNode();
            expect(function() {
                tree.createLink(node, node)
            }).to.throw(Error);
        });
        it("should create a link", function() {
            var nodeS = tree.createNode();
            var nodeT = tree.createNode();
            var link = tree.createLink(nodeS, nodeT);
            expect(link).to.not.be.empty;
            expect(link.source).to.be.equal(nodeS);
            expect(link.target).to.be.equal(nodeT);
        });
        describe("Origin case : good targets and sources for each node", function() {
            it("no origin", function() {
                var nodeS = tree.createNode();
                var nodeT = tree.createNode();
                tree.createLink(nodeS, nodeT);
                expect(nodeS.sources).to.be.empty;
                expect(nodeS.targets).to.include(nodeT);
                expect(nodeS.targets.length).to.be.equal(1);
                expect(nodeT.sources).to.include(nodeS);
                expect(nodeT.sources.length).to.be.equal(1);
                expect(nodeT.targets).to.be.empty;
            });
            it("source is origin", function() {
                var nodeS = tree.createNode();
                var nodeT = tree.createNode();
                nodeS.origin = true;
                tree.createLink(nodeS, nodeT);
                expect(nodeS.sources).to.be.empty;
                expect(nodeS.targets).to.include(nodeT);
                expect(nodeS.targets.length).to.be.equal(1);
                expect(nodeT.sources).to.include(nodeS);
                expect(nodeT.sources.length).to.be.equal(1);
                expect(nodeT.targets).to.be.empty;
            });
            it("target is origin", function() {
                var nodeS = tree.createNode();
                var nodeT = tree.createNode();
                nodeT.origin = true;
                tree.createLink(nodeS, nodeT);
                expect(nodeS.sources).to.include(nodeT);
                expect(nodeS.sources.length).to.be.equal(1);
                expect(nodeS.targets).to.be.empty;
                expect(nodeT.sources).to.be.empty;
                expect(nodeT.targets).to.include(nodeS);
                expect(nodeT.targets.length).to.be.equal(1);
            });
            it("target and source are origin", function() {
                var nodeS = tree.createNode();
                var nodeT = tree.createNode();
                nodeS.origin = true;
                nodeT.origin = true;
                tree.createLink(nodeS, nodeT);
                expect(nodeS.sources).to.include(nodeT);
                expect(nodeS.sources.length).to.be.equal(1);
                expect(nodeS.targets).to.be.empty;;
                expect(nodeT.sources).to.include(nodeS);
                expect(nodeT.sources.length).to.be.equal(1);
                expect(nodeT.targets).to.be.empty;
            });
        });
    });
    describe("Node delete", function() {
        it("should delete reference from source", function() {
            var nodeS = tree.createNode();
            var nodeT = tree.createNode();
            tree.createLink(nodeS, nodeT);
            tree.deleteNode(nodeS);
            var treeNodes = tree.getTreeNodes();
            expect(treeNodes.length).to.be.equal(1);
            expect(treeNodes[0]).to.be.equal(nodeT);
            expect(nodeT.sources).to.be.empty;
            expect(nodeT.targets).to.be.empty;
        });
        it("should delete reference from target", function() {
            var nodeS = tree.createNode();
            var nodeT = tree.createNode();
            tree.createLink(nodeS, nodeT);
            tree.deleteNode(nodeT);
            var treeNodes = tree.getTreeNodes();
            expect(treeNodes.length).to.be.equal(1);
            expect(treeNodes[0]).to.be.equal(nodeS);
            expect(nodeS.sources).to.be.empty;
            expect(nodeS.targets).to.be.empty;
        });
        describe("Origin case", function() {
            it("delete origin node", function() {
                var nodeS = tree.createNode();
                var nodeT = tree.createNode();
                nodeS.origin = true;
                tree.createLink(nodeS, nodeT);
                tree.deleteNode(nodeS);
                var treeNodes = tree.getTreeNodes();
                expect(treeNodes.length).to.be.equal(1);
                expect(treeNodes[0]).to.be.equal(nodeT);
                expect(nodeT.sources).to.be.empty;
                expect(nodeT.targets).to.be.empty;
            });
            it("inverse nodeS and nodeT", function() {
                var nodeS = tree.createNode();
                var nodeT = tree.createNode();
                nodeT.origin = true;
                tree.createLink(nodeS, nodeT);
                tree.deleteNode(nodeT);
                var treeNodes = tree.getTreeNodes();
                expect(treeNodes.length).to.be.equal(1);
                expect(treeNodes[0]).to.be.equal(nodeS);
                expect(nodeS.sources).to.be.empty;
                expect(nodeS.targets).to.be.empty;
            });
            it("delete not origin node", function() {
                var nodeS = tree.createNode();
                var nodeT = tree.createNode();
                nodeT.origin = true;
                tree.createLink(nodeS, nodeT);
                tree.deleteNode(nodeS);
                var treeNodes = tree.getTreeNodes();
                expect(treeNodes.length).to.be.equal(1);
                expect(treeNodes[0]).to.be.equal(nodeT);
                expect(nodeT.sources).to.be.empty;
                expect(nodeT.targets).to.be.empty;

            });
            it("inverse nodeS and nodeT", function() {
                var nodeS = tree.createNode();
                var nodeT = tree.createNode();
                nodeS.origin = true;
                tree.createLink(nodeS, nodeT);
                tree.deleteNode(nodeT);
                var treeNodes = tree.getTreeNodes();
                expect(treeNodes.length).to.be.equal(1);
                expect(treeNodes[0]).to.be.equal(nodeS);
                expect(nodeS.sources).to.be.empty;
                expect(nodeS.targets).to.be.empty;
            });
            it("both origin node", function() {
                var nodeS = tree.createNode();
                var nodeT = tree.createNode();
                nodeS.origin = true;
                nodeT.origin = true;
                tree.createLink(nodeS, nodeT);
                tree.deleteNode(nodeT);
                var treeNodes = tree.getTreeNodes();
                expect(treeNodes.length).to.be.equal(1);
                expect(treeNodes[0]).to.be.equal(nodeS);
                expect(nodeS.sources).to.be.empty;
                expect(nodeS.targets).to.be.empty;
            });
        });
    });
    describe("link delete", function() {
        it("no origin", function() {
            var nodeS = tree.createNode();
            var nodeT = tree.createNode();
            var link = tree.createLink(nodeS, nodeT);
            tree.deleteLink(link);
            expect(nodeS.sources).to.be.empty;
            expect(nodeS.targets).to.be.empty;
            expect(nodeT.sources).to.be.empty;
            expect(nodeT.targets).to.be.empty;
        });
        it("other link on nodeS", function() {
            var nodeS = tree.createNode();
            var nodeT = tree.createNode();
            var nodeT2 = tree.createNode();
            var link = tree.createLink(nodeS, nodeT);
            var link2 = tree.createLink(nodeS, nodeT2);
            tree.deleteLink(link);
            expect(nodeS.sources).to.be.empty;
            expect(nodeS.targets.length).to.be.equal(1);
            expect(nodeS.targets).to.include(nodeT2);
            expect(nodeT.sources).to.be.empty;
            expect(nodeT.targets).to.be.empty;
        });
        it("nodeS is origin", function() {
            var nodeS = tree.createNode();
            var nodeT = tree.createNode();
            nodeS.origin = true;
            var link = tree.createLink(nodeS, nodeT);
            tree.deleteLink(link);
            expect(nodeS.sources).to.be.empty;
            expect(nodeS.targets).to.be.empty;
            expect(nodeT.sources).to.be.empty;
            expect(nodeT.targets).to.be.empty;
        });
        it("nodeT is origin", function() {
            var nodeS = tree.createNode();
            var nodeT = tree.createNode();
            nodeT.origin = true;
            var link = tree.createLink(nodeS, nodeT);
            tree.deleteLink(link);
            expect(nodeS.sources).to.be.empty;
            expect(nodeS.targets).to.be.empty;
            expect(nodeT.sources).to.be.empty;
            expect(nodeT.targets).to.be.empty;
        });
        it("both nodes are origin", function() {
            var nodeS = tree.createNode();
            var nodeT = tree.createNode();
            nodeT.origin = true;
            nodeS.origin = true;
            var link = tree.createLink(nodeS, nodeT);
            tree.deleteLink(link);
            expect(nodeS.sources).to.be.empty;
            expect(nodeS.targets).to.be.empty;
            expect(nodeT.sources).to.be.empty;
            expect(nodeT.targets).to.be.empty;
        });
    });
});

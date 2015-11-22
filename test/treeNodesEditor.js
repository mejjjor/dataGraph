var expect = require('chai').expect;
var tree = require('../app/js/treeNodesEditor.js');

describe("CRUD on tree", function() {
    beforeEach(function() {
        tree.removeAllNodesFromTreeNodes();
    });
    describe("Node creation", function() {
        it("should create a node with attribute", function() {
            var node = tree.createNode();
            expect(node).to.contain.all.keys('id', 'x', 'y');
        });
        it("should store nodes", function() {
            var node1 = tree.createNode();
            var treeNodes = tree.getTreeNodes();
            expect(treeNodes).to.contain(node1);
            expect(treeNodes.length).to.be.equal(1);
            var node2 = tree.createNode();
            treeNodes = tree.getTreeNodes();
            expect(treeNodes).to.contain(node2);
            expect(treeNodes).to.contain(node1);
            expect(treeNodes.length).to.be.equal(2);
        });
    })
    describe("node update", function() {
        it("should update values", function() {
            var node = tree.createNode();
            node.label = "a new label";
            var treeNodes = tree.getTreeNodes().slice(0);
            expect(treeNodes[0].label).to.equal("a new label");
            expect(treeNodes[0]).to.equal(node);
            node.label = "a new label again";
            expect(treeNodes[0]).to.equal(node);
            expect(treeNodes[0].label).to.equal("a new label again");
        });
    })
    describe("node delete", function() {
        it("should throw error when node nt exists", function() {
            var node = tree.createNode();
            var newNode = [];
            expect(function() {
                tree.deleteNode(newNode);
            }).to.throw(Error);
        });
        it("should delete node", function() {
            var node1 = tree.createNode();
            var node2 = tree.createNode();
            var link = tree.createLink(node1, node2);
            tree.deleteNode(node1);
            var treeNodes = tree.getTreeNodes();
            expect(treeNodes[0]).to.equal(node2);
            expect(treeNodes.length).to.equal(1);
            expect(node2.brothers.length).to.equal(0);
            tree.deleteNode(node2);
            treeNodes = tree.getTreeNodes();
            expect(treeNodes.length).to.equal(0);
            expect(function() {
                tree.deleteNode(node);
            }).to.throw(Error);
        });
    })
    describe("link creation", function() {
        it("should throw error when create link on the same node", function() {
            var node = tree.createNode();
            expect(function() {
                tree.createLink(node, node)
            }).to.throw(Error);
        });
        it("should create a link", function() {
            var node1 = tree.createNode();
            var node2 = tree.createNode();
            var link = tree.createLink(node1, node2);
            expect(link).to.contain.all.keys('source', 'target');
            expect(node1.brothers[0]).to.equal(node2);
            expect(node2.brothers[0]).to.equal(node1);
            expect(node1.brothers.length).to.equal(1);
            expect(node2.brothers.length).to.equal(1);
        });
        it("should throw error when create link already exists", function() {
            var node1 = tree.createNode();
            var node2 = tree.createNode();
            tree.createLink(node1, node2)
            expect(function() {
                tree.createLink(node1, node2)
            }).to.throw(Error);
        });
    })
    describe("link delete", function() {
        it("should delete a link", function() {
            var node1 = tree.createNode();
            var node2 = tree.createNode();
            var node3 = tree.createNode();
            var link = tree.createLink(node1, node2);
            tree.deleteLink(node1, node2);
            expect(node1.brothers.length).to.equal(0);
            expect(node2.brothers.length).to.equal(0);
            var link = tree.createLink(node1, node2);
            var link = tree.createLink(node3, node2);
            tree.deleteLink(node2, node3);
            expect(node1.brothers[0]).to.equal(node2);
            expect(node1.brothers.length).to.equal(1);
            expect(node2.brothers[0]).to.equal(node1);
            expect(node2.brothers.length).to.equal(1);
        });
        it("should throw error when create link already exists", function() {
            var node1 = tree.createNode();
            var node2 = tree.createNode();
            tree.createLink(node1, node2)
            expect(function() {
                tree.createLink(node1, node2)
            }).to.throw(Error);
        });
    })
    describe("export - import", function() {
        it("should export and import data", function() {
            var node1 = tree.createNode();
            var node2 = tree.createNode();
            var link = tree.createLink(node1, node2);
            var treeNodes = tree.getTreeNodes();
            expect(treeNodes[0]).to.equal(node1);
            expect(treeNodes[1]).to.equal(node2);
            var string = tree.exportData();
            tree.removeAllNodesFromTreeNodes();
            expect(tree.getTreeNodes().length).to.equal(0);
            tree.importData(string);

            treeNodes = tree.getTreeNodes();
            expect(treeNodes[0].id).to.equal(node1.id);
            expect(treeNodes[1].id).to.equal(node2.id);
            expect(treeNodes.length).to.equal(2);
            expect(treeNodes[0].brothers[0]).to.equal(treeNodes[1]);
            expect(treeNodes[0].brothers.length).to.equal(1);
            expect(treeNodes[1].brothers[0]).to.equal(treeNodes[0]);
            expect(treeNodes[1].brothers.length).to.equal(1);
        });
        it("should keep max id", function() {
            var node1 = tree.createNode();
            var node2 = tree.createNode();
            var link = tree.createLink(node1, node2);
            var string = tree.exportData();
            var node3 = tree.createNode();
            tree.removeAllNodesFromTreeNodes();
            tree.importData(string);

            var node4 = tree.createNode();
            expect(node4.id).to.equal(3);
        });
        it("should return all links", function() {
            var node1 = tree.createNode();
            var node2 = tree.createNode();
            var node3 = tree.createNode();
            var link = tree.createLink(node1, node2);
            var link = tree.createLink(node1, node3);
            var string = tree.exportData();
            tree.removeAllNodesFromTreeNodes();
            expect(tree.getTreeNodes().length).to.equal(0);
            tree.importData(string);
            var links = tree.getLinks();
            expect(links.length).to.equal(2);
            expect(links).to.contains({source:node1,target:node2});
            expect(links).to.contains({source:node1,target:node3});

        });
    })
})

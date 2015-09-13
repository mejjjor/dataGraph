var expect = require('chai').expect;
require('../app/js/main.js');
var data_simple = require('data_set/data_simple.json')
describe('import data',function(){
	it('should add nodes and links put in the import form', function(){
		document.getElementById("exchange").value = JSON.stringify(data_simple);
		expect(nodes).to.be.equal([]);
	});
});


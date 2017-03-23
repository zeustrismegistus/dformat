const Code = require('code');
const Lab = require('lab');
const lab = exports.lab = Lab.script();

const describe = lab.describe;
const it = lab.it;
const before = lab.before;
const after = lab.after;
const expect = Code.expect;

var jsmeta = require('d__jsmeta');
var dformat = require('./../dformat.js');


describe('using dformat', () => {

	var builder;

    before((done) => {
        done();
    });

    after((done) => {
        done();
    });


	it('serializes simple stuff', (done) => {
	
		var testObj = {
			propA : 'A',
			propB : 'B',
			testFn : function testFn_fake(a,b,c,d){

				//do nothing
				var rv = a + b +c +d;
				return rv;
			}
		};
		testObj["testFn2"] = function testFn2_fake() 
		{ 
			//do nothing
		};

		var TestObjTester = 
		{
			test :  function(obj)
			{
				expect(obj.propA).to.equal('A');
				expect(obj.propB).to.equal('B');
				expect(jsmeta.hasFunctionArgNames(obj.testFn, ['a','b','c','d'])).to.equal(true);
				expect(obj.testFn('a1','b1','c1','d1')).to.equal('a1b1c1d1');
				expect(jsmeta.hasMembers(obj, 'testFn2')).to.equal(true);
			}
		};
		TestObjTester.test(testObj);

		//serialize it
		var data = dformat.serialize(testObj);
		var target = dformat.deserialize(data);
		
		TestObjTester.test(target);
		
		//test 2
		var jsonTestObj =		{
		  name: "zeus",
		  location : "olympus",
		  friends :[ 
		  {
			name : "hera",
			age : "how dare you ask?"
		  }]
		};
		var data2 = dformat.serialize(jsonTestObj)
		
		done();
    });	
	
	it('serializes more complicated stuff', (done) => {
	
		var testObj = {
			propA : 'A',
			propB : 'B',
			testFn : function testFn_fake(a,b,c,d){

				//do nothing
				var rv = a + b +c +d;
				return rv;
			}
		};
		testObj["testFn2"] = function testFn2_fake() 
		{ 
			//do nothing
		};
		var testObj2 = {a:'a',b:'b',c:'c', o: testObj}
		var topArr = [testObj, testObj2];
		
		var TestObjTester = 
		{
			test :  function(obj)
			{
				expect(obj.propA).to.equal('A');
				expect(obj.propB).to.equal('B');
				expect(jsmeta.hasFunctionArgNames(obj.testFn, ['a','b','c','d'])).to.equal(true);
				expect(obj.testFn('a1','b1','c1','d1')).to.equal('a1b1c1d1');
				expect(jsmeta.hasMembers(obj, 'testFn2')).to.equal(true);
			}
		};
		
		//serialize it
		var data = dformat.serialize(topArr);
		var target = dformat.deserialize(data);
		
		TestObjTester.test(target[1].o);
		
		
		done();
    });	
});

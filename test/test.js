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
	
		var date = new Date();
		
		var testObj = {
			propBoolean : true,
			propNumber : 33.3,
			propDate : date,
			propArray : [1,2,3,[4,5,6]],
			propString : 'yo',
			testFn : function testFn_fake(a,b,c,d){

				//do nothing
				var rv = a + b +c +d;
				return rv;
			},
			propEmpty : {},
			propSymbol : Symbol("yo"),
			propCircular : {things:[testObj, testObj]},
			propNull : null,
			propUndefined : undefined,
			propContainerChain : {top:[{top:[{top:'top'}]}]}
		};
		testObj["testFn2"] = function testFn2_fake() 
		{ 
			//do nothing
		};

		var TestObjTester = 
		{
			test :  function(obj)
			{
				expect(obj.propBoolean).to.equal(true);
				expect(obj.propNumber).to.equal(33.3);
				expect(obj.propDate).to.equal(date);
				expect(obj.propArray[0]).to.equal(1);
				expect(obj.propArray[1]).to.equal(2);
				expect(obj.propArray[2]).to.equal(3);
				expect(obj.propArray[3][0]).to.equal(4);
				expect(obj.propArray[3][1]).to.equal(5);
				expect(obj.propArray[3][2]).to.equal(6);
				expect(obj.propString).to.equal('yo');
				
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
	
	
	it('serializes cyclical graphs', (done) => {
	
		var date = new Date();
		
		var testObj = {
			propBoolean : true,
			propNumber : 33.3,
			propDate : date,
			propArray : [1,2,3,[4,5,6]],
			propString : 'yo',
			testFn : function testFn_fake(a,b,c,d){

				//do nothing
				var rv = a + b +c +d;
				return rv;
			}
		}
		;
		testObj.propObj = {parent:testObj};
		
		var TestObjTester = 
		{
			test :  function(obj)
			{
				expect(obj.propBoolean).to.equal(true);
				expect(obj.propNumber).to.equal(33.3);
				expect(obj.propDate).to.equal(date);
				expect(obj.propArray[0]).to.equal(1);
				expect(obj.propArray[1]).to.equal(2);
				expect(obj.propArray[2]).to.equal(3);
				expect(obj.propArray[3][0]).to.equal(4);
				expect(obj.propArray[3][1]).to.equal(5);
				expect(obj.propArray[3][2]).to.equal(6);
				expect(obj.propString).to.equal('yo');
				
				expect(jsmeta.hasFunctionArgNames(obj.testFn, ['a','b','c','d'])).to.equal(true);
				expect(obj.testFn('a1','b1','c1','d1')).to.equal('a1b1c1d1');
				expect(testObj.propObj.parent).to.equal(testObj);
			}
		};
		TestObjTester.test(testObj);

		//serialize it
		var data = dformat.serialize(testObj);
		var target = dformat.deserialize(data);
		
		TestObjTester.test(target);

		
		done();
    });	
});

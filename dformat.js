(function () {

	const jsmeta = require("d__jsmeta");
	const validators = jsmeta.validators;
	
	/*
		first line of the file:
			number of objects
		
		each line is prefixed with length information about how to parse the line
		[P,I,T,V,N]
			where:
				P is the parent id 
				I is the length of .id (only objects and arrays will set this) 
				T is the length of .type
				V is the length of .value
				N is the length of .name, if there is one

		
		these values are parsed into :
		{
			type : "undefined" |  "boolean" | "number" | "string" | "symbol" | "function" | "null" | "date" | "array"  | "empty" | "object"  
			value : the primitive value, or the id if .type === array or object
			name : the member name if it's a member
		}	
		
		eg.
		{
		  name: "zeus",
		  location : "olympus",
		  friends :[ 
		  {
			name : "hera",
			age : "how dare you ask?"
		  }]
		}
		
		encodes to:
		3__EOL__
		[0,1,6,0,0]|1|object||__EOL__
		[1,0,6,4,4]1||string|zeus|name__EOL__
		[1,0,6,7,8]1||string|olympus|location__EOL__
		[1,0,5,1,7]1||array|2|friends__EOL__
		[0,1,5,0,0]|2|array||__EOL__
		[1,0,6,1,0]2||object|3|__EOL__
		[0,1,6,0,0]|3|object||__EOL__
		[1,0,6,4,4]3||string|hera|name__EOL__
		[1,0,6,17,3]3||string|how dare you ask?|age
		
	*/
	
	//models....................................
	function Model()
	{
		//standard properties
		this.type = null;
		this.value = null;
		this.name = null;
		this.id = null;
		this.instance = null;
		this.parentModel = null;
		this.childModels = [];
		
		this.hydrateFromValue = function(val, registry)
		{
			this.instance = val;
			setTypeValueFromInstance(this);
		
			/* $lab:coverage:off$ */
			if(!(this.type === "object" || this.type === "array"))
				throw new Error("invalid recursion");
			/* $lab:coverage:on$ */
			
			var id = registry.push(this);
			this.id = id.toString();
			
			//handle the models of object and arrays as if they are containers of other objects
			if(this.type === "object")
			{
				for(var p in val)
				{
					var item = val[p];
					var itemModel = new Model();
					itemModel.instance = item;
					setTypeValueFromInstance(itemModel);
					itemModel.parentModel = this;
					itemModel.name = p;
					this.childModels.push(itemModel);
					
					//if we've registered this model set the value to the id of the registered model
					if(itemModel.type === "object" || itemModel.type === "array")
					{
						//do we have this node in the registry?
						var regModel = findNodeByInstance(registry, item);
						
						//we don't have a model, so we have to recurse, and append to the registry
						if(!regModel)
						{
							var objModel = new Model();
							objModel.hydrateFromValue(item, registry);
							regModel = objModel;
						}					
						
						itemModel.value = regModel.id;
					}
				}
			}
			else 
			{
				/* $lab:coverage:off$ */
				if(this.type !== "array")
					throw new Error("array expected");
				/* $lab:coverage:on$ */
					
				for(var i=0; i<val.length;i++)
				{
					var item = val[i];
					var itemModel = new Model();
					itemModel.instance = item;
					setTypeValueFromInstance(itemModel);
					itemModel.parentModel = this;
					this.childModels.push(itemModel);
					
					//if we've registered this model set the value to the id of the registered model
					if(itemModel.type === "object" || itemModel.type === "array")
					{
						//do we have this node in the registry?
						var regModel = findNodeByInstance(registry, item);
						
						//we don't have a model, so we have to recurse, and append to the registry
						if(!regModel)
						{
							var objModel = new Model();
							objModel.hydrateFromValue(item, registry);
							regModel = objModel;
						}					
						
						itemModel.value = regModel.id;
					}					
				}
			}
			
		}
		
		this.hydrateFromState = function(registry)
		{
			setInstanceFromTypeValue(this);
			
			//we only worry about children if we're a parent (ie. an object or an array)
			/* $lab:coverage:off$ */
			if(!this.id)
			{
				throw new Error("id expected");
			}
			/* $lab:coverage:on$ */
		
			//at this point we assume the model graph is wired together correctly, but the model.instance values are not wired up
			for(var i=0; i < this.childModels.length; i++)
			{
				var childModel = this.childModels[i];
				setInstanceFromTypeValue(childModel);
				
				//if it's a node, look up the value
				if(childModel.type === "object" || childModel.type === "array")
				{
					var objModel = findNodeById(registry, childModel.value);
					
					/* $lab:coverage:off$ */
					if(!objModel)
						throw new Error("object expected");
					/* $lab:coverage:on$ */
					
					//if we haven't set instance yet on it, do so
					if(!objModel.instance)
						objModel.hydrateFromState(registry);	//recurse
					
					childModel.instance = objModel.instance;
				}				
				
				//wire up the instances
				if(this.type === "object")
				{
					this.instance[childModel.name] = childModel.instance;
				}
				else 
				{
					/* $lab:coverage:off$ */
					if(this.type !== "array")
						throw new Error("expected array");
					/* $lab:coverage:on$ */
					
					this.instance.push(childModel.instance);
				}
			}	
		
			
		}
		
		//helper functions
		function findNodeById(registry, id)
		{
			/*
			if(!id)
				return null;
			*/
			
			for(var i=0; i< registry.length; i++)
				if(registry[i].id === id)
					return registry[i];
			
			/* $lab:coverage:off$ */			
			return null;
			/* $lab:coverage:on$ */
		}
		function findNodeByInstance(registry, instance)
		{
			/*
			if(!instance)
				return null;
			*/
			
			for(var i=0; i< registry.length; i++)
				if(registry[i].instance === instance)
					return registry[i];
			
			/* $lab:coverage:off$ */			
			return null;
			/* $lab:coverage:on$ */
		}
		
		//hydrates type and value properties from a value
		function setTypeValueFromInstance(node)
		{
			var val = node.instance;
			if(val === undefined)
			{	
				node.type = "undefined";
				node.value = "undefined";
			}
			else if(val === null)
			{
				node.type = "null";
				node.value = "null";
			}
			else
			{
				var valType = typeof val;

				if(valType === "boolean")
				{
					node.type = "boolean";
					node.value = val.toString();
				}
				else if (valType === "number")
				{
					node.type = "number";
					node.value = val.toString();
				}
				else if (valType === "string")
				{
					node.type = "string";
					node.value = val;
				}
				else if (valType === "symbol")
				{
					node.type = "symbol";
					node.value =  val.toString();
				}
				else if(valType === "function")
				{
					node.type = "function";
					node.value =  val.toString();
				}
				else if(val instanceof Date)
				{
					node.type = "date";
					node.value = val.getTime().toString();  
				}
				else if(val instanceof Array)
				{
					node.type = "array";
				}
				else if(jsmeta.isEmpty(val))
				{
					node.type = "empty";
					node.value = "empty";
				}
				else
				{
					node.type = "object";
				}
			}	
		};

		//does the reverse of setTypeValue
		function setInstanceFromTypeValue(node)
		{
			if(node.type == "undefined")
			{	
				node.instance = undefined;
			}
			else if(node.type === "boolean")
			{
				node.instance = Boolean(node.value);
			}
			else if (node.type === "number")
			{
				node.instance = Number(node.value);
			}
			else if (node.type === "string")
			{
				node.instance = node.value;
			}
			else if (node.type === "symbol")
			{
				node.instance = Symbol(node.value);
			}
			else if(node.type === "function")
			{
				var fn;
				eval("fn = " + node.value);
				node.instance = fn;
			}
			else if(node.type === "null")
			{
				node.instance = null;
			}
			else if(node.type === "date")
			{
				node.instance = new Date(Number(node.value))
			}
			else if(node.type === "array")
			{
				node.instance = [];
			}
			else if(node.type === "empty")
			{
				node.instance = {};
			}
			else if(node.type === "object")
			{
				node.instance = {};
			}			
			else
			{
				/* $lab:coverage:off$ */
				throw new Error("can't set instance");
				/* $lab:coverage:on$ */
			}		
		}
		
	}

	function ModelFormatter()
	{
		//publics
		this.serialize = function(obj)
		{
			jsmeta.validators.validateNotNullOrUndefined(obj);
			var registry = [];
			
			var rootModel = new Model();
			rootModel.hydrateFromValue(obj, registry); //build the models
			
			var reportLines = [];
			reportLines.push(registry.length);
			
			for(var i=0; i<registry.length; i++)
			{
				var model = registry[i];
				
				reportLines.push(getLine(model));
				for(var j=0; j<model.childModels.length; j++)
				{
					var itemModel = model.childModels[j];
					reportLines.push(getLine(itemModel));
				}
			}
			return reportLines.join("__EOL__\r\n");
		};
		
		this.deserialize = function(data)
		{
			var lines = data.split("__EOL__\r\n");
			var length = lines.shift();
			
			//parse the lines
			var parsedLines = [];
			for(var i=0; i< lines.length; i++)
				parsedLines.push(parseLine(lines[i]));
			
			//build the registry of stubs
			var registry = [];
			for(var i=0; i<parsedLines.length; i++)
			{
				var line = parsedLines[i];
				if(!line.id)
					continue;
				
				var model = new Model();
				model.type = line.type;
				model.id = line.id;
				
				registry.push(model);
			}
			
			//hydrate the models
			for(var i=0; i<parsedLines.length; i++)
			{
				var line = parsedLines[i];
				if(line.id)
					continue;
				
				var model = new Model();
				model.type = line.type;
				model.id = line.id;
				model.name = line.name;
				model.value = line.value;
				
				/* $lab:coverage:off$ */
				if(!line.parentId)
					throw new Error("parent expected");
				/* $lab:coverage:on$ */
					
				var parentModel = findNodeById(registry, line.parentId);
				model.parentModel = parentModel;
				parentModel.childModels.push(model);
			
			}
			
			//get the root model
			var rootModel = registry[0];
			
			//wire it
			rootModel.hydrateFromState(registry);
			
			//return it
			return rootModel.instance;
		};
		
		//helpers
		function findNodeById(registry, id)
		{
			/*
			if(!id)
				return null;
			*/
			
			for(var i=0; i< registry.length; i++)
				if(registry[i].id === id)
					return registry[i];
				
			/* $lab:coverage:off$ */	
			return null;
			/* $lab:coverage:on$ */
		}
		//[P,I,T,V,N]	
		function getLine(model)
		{
			var parentId = "";
			if(model.parentModel)
				parentId = model.parentModel.id;
		
			var type = model.type;
			var name = model.name || "";
			var value =  model.value || "" ;
			var id = model.id || "";
			
			var prefix = "[" + [parentId.length, id.length, type.length, value.length, name.length].join(",") + "]";
			var data = [parentId, id, type, value, name].join("|");

			return prefix + data;
		}
		function parseLine(line)
		{
			/* $lab:coverage:off$ */
			if(!line.startsWith("["))
				throw "invalid line";
			/* $lab:coverage:on$ */
				
			var dataIdx1 = line.indexOf("]");
			var suffix = line.substring(1, dataIdx1);
			var suffixArr = suffix.split(",");
			suffixArr = suffixArr.map((x)=>{return parseInt(x);});
			
			var parentId = "" + line.substr(dataIdx1 + 1, suffixArr[0]);
			var id = "" + line.substr(dataIdx1 + 1 + suffixArr[0] + 1, suffixArr[1]);
			var type = "" + line.substr(dataIdx1 + 1 + suffixArr[0] + suffixArr[1] + 2, suffixArr[2]);
			var value = "" + line.substr(dataIdx1 + 1+ suffixArr[0] + suffixArr[1] + suffixArr[2] + 3, suffixArr[3]);
			var name = "" + line.substr(dataIdx1 + 1+ suffixArr[0] + suffixArr[1] + suffixArr[2] + suffixArr[3] + 4, suffixArr[4]);
			
			return {parentId : parentId, id:id, type: type, value: value, name: name};
		}
		
	}

	//wire up the exports
	var serializer = new ModelFormatter();
	
	/* $lab:coverage:off$ */
	// Node.js
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = serializer;
    }
    // AMD / RequireJS
    else if (typeof define !== 'undefined' && define.amd) {
        define([], function () {
            return serializer;
        });
    }
    // included directly via <script> tag
    else {
        this.serializer = serializer;
    }
	/* $lab:coverage:on$ */
})();
	

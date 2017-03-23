# dformat
Yet another data format.  

	- normalizes data avoiding pyramid of doom; has visually inspectable format 

	- is easily indexed

	- presents data in a consistent idiom; has inherent anti-corruption checks with exact parsing instructions.


	

usage:

		var dformat = require('d__format.js');
		dformat.serialize(...);
		dformat.deserialize(...);

design:

Objects are converted into an intermediate meta form that models the object/properties as nested nodes.  "Container models" of object and array are given id values.  All models are given parentId values.  Each property is broken out as a Type/Value/Name tuple, with graph location indicated by the parentId/id tuple.  

layout:

		first line of the file: 
			number of objects
		
		
		each line is prefixed with length information about how to parse the line ie. [P,I,T,V,N]
		
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
		
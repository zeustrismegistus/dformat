# dformat
yet another data format.  this one: normalizes data avoiding pyramid of doom; has visually inspectable format; is easily indexed; presents data in a consistent idiom; has inherent anti-corruption checks with exact parsing instructions


		first line of the file:
			number of objects
		
		each line is prefixed with length information about how to parse the line
		[P,T,V,N]
			where:
				P is the parent id
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
		[P,T,V,N]			
		[1,1,1,0]0|object|1||
		[1,5,4,4]1|string|zeus|name
		[1,5,7,8]1|string|olympus|location
		[1,5,1,7]1|array|2|friends
		[1,1,1,0]1|array|2||
		[1,1,1,0]2|object|3||
		[1,5,4,4]3|string|hera|name
		[1,5,17,3]3|string|age|how dare you ask?
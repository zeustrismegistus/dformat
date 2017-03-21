# dformat
yet another data format.  this one: normalizes data avoiding pyramid of doom; has visually inspectable format; is easily indexed; presents data in a consistent idiom; has inherent anti-corruption checks with exact parsing instructions


first line of the file:
  
    number of objects

first line of every object:
    
    O{object no.}T{type.length}:typeL{memberCount.length}:memberCount

member lines:
  
    M{memberName.length}:memberNameT{memberType.length}:memberTypeV{memberValue.length}:{memberValue}
  
array member lines (these immediately follow the member line that declares them):
  
    T{arrayItemType.length}:arrayItemTypeV{arrayItemValue.length}:{arrayItemValue}


    Eg.

    2
    O1T6:objectL1:4
    M4:nameT6:stringV4:zeus
    M3:ageT6:undefinedV9:undefined  
    M8:locationT6:stringV7:olympus
    M7:friendsT5:arrayV1:1
    T6:stringV1:2
    O2T6:objectL1:2
    M4:nameT6:stringV4:hera
    M3:ageT6:stringV17:how dare you ask?  

    encodes the equivalent of 

    {
      name: "zeus",
      location : "olympus",
      friends : 
      {
        name : "hera",
        age : "how dare you ask?"
      }
    }


types must be one of the following:
  
    undefined, boolean, number, string, symbol, function, null, date, array, empty, object  
  
member values that are of type "object", will have a value that is their object id/sequence in the encoding.  
    

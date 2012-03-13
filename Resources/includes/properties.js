// Initialize default values for all properties used in the app.
// This also serves as a list of all the properties used.
//
// The general concept is that all these properties get set on app
// launch, so that there is one central location that defines them.
(function() {
  var properties = new Array()
  
  properties.push({
    type:'string', 
    name:'weather2AccessCode',
    value:'ZivNvqdskN'
  });
  
  // Get the count of all properties so that this doesn't
  // have to happen for every property in the for loop.
  var propertiesCount = properties.length;
  
  // Store all values.
  for (var i = 0; i < propertiesCount; i++) {
    var obj = properties[i];
    var success = false;
    switch (obj.type) {
      case 'string':  Ti.App.Properties.setString(obj.name, obj.value); success = true; break;
      case 'int':     Ti.App.Properties.setInt(obj.name, obj.value); success = true; break;
      case 'bool':    Ti.App.Properties.setBool(obj.name, obj.value); success = true; break;
      case 'double':  Ti.App.Properties.setDouble(obj.name, obj.value); success = true; break;
      case 'list':    Ti.App.Properties.setList(obj.name, obj.value); success = true; break;
    }
    if (success === true) {
      Ti.API.log('Stored ' + obj.name + ' value: ' + obj.value);
    }
  }
})();

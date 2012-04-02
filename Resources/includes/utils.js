var Utils = {};

(function() {
  // Define default label builder.
  Utils.FahrenheitToCelcius = function(a) {
    return Math.round((a - 32) * (5/9));
  }
  
  
  /* Server Functions */
  function ServerCall(params,callback,progress){
    // Create an instance of Titanium.Network.HTTPClient.
    var xhr = Ti.Network.createHTTPClient();
    
    // Define a default timeout, unless it gets overriden
    // by a parameter passed to this function.
    var timeOut = params.timeout;
    if(!timeOut){
      timeOut = 5000;
    }
    xhr.setTimeout(timeOut);

    // this.responseText holds the raw text return of the message (used for text/JSON)
    // this.responseXML holds any returned XML (including SOAP)
    // this.responseData holds any returned binary data
    xhr.onload = function(){
      Ti.API.info('XHR: onload()');
      
      // Determine if the HTTP status returns a successful request.
      var httpStatus = this.status;
      if (httpStatus == 200) {
        Ti.API.info('XHR: httpStatus = 200');
        
        // In case the server doesn't respond the data we want, still return something.
        if (this.responseText == 'Unable to find any matching weather location to the query submitted!') {
          callback();
          return;
        }
        
        // For successful responses, parse the raw JSON into an object.
        var json = JSON.parse(this.responseText);
        
        // Nullify the xhr object.
        xhr = null;
        
        // Log the returned data.
        Ti.API.info('XHR data load successful.');
        Ti.API.info(JSON.stringify(json));
        
        // Execute the callback function with the return data and return.
        callback(json);
        return;
      }
      // If the request was unsuccesful, still execute the callback
      // function, but don't pass any data back.
      else {
        callback();
        return;
      }
    }

    // This function is called when an error occurs, including a timeout.
    xhr.onerror = function(e) {
      Ti.API.debug('XHR Error: ' + e.error);
      Ti.API.debug('The HTTP request status was: ' + this.status);
      alert('There was a problem with your HTTP request: ' + e.error);
    };

    // Construct the Weather2 URL.
    // @see http://www.myweather2.com/developer/apis.aspx?uref=becda844-8299-4bf6-899b-d771a92b9dbf
    var latitude = params.latitude;
    var longitude = params.longitude;
    var url = 'http://www.myweather2.com/developer/forecast.ashx?uac=' + Ti.App.Properties.getString('weather2AccessCode') + '&output=json&temp_unit=f&query=' + latitude + ',' + longitude;
    Ti.API.info('Weather2 URL: ' + url);
    
    // Start the data connection.
    xhr.open('GET', url);
    xhr.send();
  }
  
  
  // ----------------- Server calls -----------------
  Utils.Server = {};
  
  Utils.Server.GetWeatherData = function(params, callback){
    ServerCall({
      latitude:params.latitude,
      longitude:params.longitude
    }, callback);
  };  
})();
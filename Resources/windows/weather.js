W.Weather = function() {
  var win = Ti.UI.createWindow({
    backgroundColor:'#509fd6',
    backgroundImage:Ti.Filesystem.resourcesDirectory + '/images/window_weather_bg.png'    
  });
  
  // Update the location.
  Location.updateLocation();

  /**
   * React to the location update event.
   */
  Ti.App.addEventListener('location_update', function() {
    Ti.API.info('Recorded a location update');

    if (Location.currentCoordsAvailable) {
      Ti.API.info('Coordinates are available. Attempt to get the temperature');
      
      // @see http://www.myweather2.com/developer/apis.aspx?uref=becda844-8299-4bf6-899b-d771a92b9dbf
      var url = 'http://www.myweather2.com/developer/forecast.ashx?uac=' + Ti.App.Properties.getString('weather2AccessCode') + '&output=json&temp_unit=c&query=' + Location.currentCoords.latitude + ',' + Location.currentCoords.longitude;
      Ti.API.info('Weather2 URL: ' + url);
      
      var xhr = Ti.Network.createHTTPClient({
        onload: function(e) {
          // This function is called when data is returned from the server and available for use
          // this.responseText holds the raw text return of the message (used for text/JSON)
          // this.responseXML holds any returned XML (including SOAP)
          // this.responseData holds any returned binary data
          var httpStatus = this.status;
          if (httpStatus == 200) {
            Ti.API.info('HTTP Request was successful');
            Ti.API.info(this.responseText);
            Ti.API.info(JSON.parse(this.responseText));
          }
        },
        onerror: function(e) {
          // this function is called when an error occurs, including a timeout.
          Ti.API.debug(e.error);
          alert('There was a problem with your HTTP request: ' + e.error);
          Ti.API.debug('The HTTP request status was: ' + this.status);
        },
        ondatastream: function(e) {
          // This function is called as data is downloaded
          Ti.API.debug('HTTP request is downloading data.')
        },
        timeout: 5000 // set in milliseconds
      });
      xhr.open('GET', url);
      xhr.send();      
    }    
  });
  
  return win;
}
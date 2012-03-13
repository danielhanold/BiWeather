W.Weather = function() {
  var win = Ti.UI.createWindow({
    backgroundColor:'#509fd6',
    backgroundImage:Ti.Filesystem.resourcesDirectory + '/images/window_weather_bg.png',
  });

  var activityIndicator = Ti.UI.createActivityIndicator({
    bottom:10, 
    height:50,
    width:210,
    style:Titanium.UI.iPhone.ActivityIndicatorStyle.PLAIN,
    color:'white',
    message:'Detecting Location ...',
    font:{fontFamily:'Helvetica Neue', fontSize:15,fontWeight:'bold'}
  });
  win.add(activityIndicator);
  activityIndicator.show();
  
  // Update the location.
  Location.updateLocation();

  /**
   * React to the weather update event.
   */
  Ti.App.addEventListener('weather_update', function(data) {
    Ti.API.info(data.weather);
    var viewCurrentWeather = Ti.UI.createView({
      backgroundColor:'white',
      width:'90%',
      top:10,
      height:100,
    });
    var labelLocation = Ti.UI.createLabel({
      text:Location.currentLocation.city,
      top:5,
      left:5,
      font:{fontFamily:'Helvetica Neue', fontSize:15,fontWeight:'bold'},
      color:'black',
      width:'auto',
      height:'auto'
    });
    
    var tempFahrenheit = data.weather.curren_weather[0].temp;
    var labelTempFahrenheit = Ti.UI.createLabel({
      text:tempFahrenheit + 'F',
      top:5,
      right:5,
      font:{fontFamily:'Helvetica Neue', fontSize:15,fontWeight:'bold'},
      color:'black',
      width:'auto',
      height:'auto'      
    }); 
    viewCurrentWeather.add(labelLocation);
    viewCurrentWeather.add(labelTempFahrenheit);
    
    
    win.add(viewCurrentWeather);    
  });

  /**
   * React to the location update event.
   */
  Ti.App.addEventListener('location_update', function() {
    Ti.API.info('Recorded a location update');

    if (Location.currentCoordsAvailable) {
      Ti.API.info('Coordinates are available. Attempt to get the temperature');
      activityIndicator.setMessage('Getting weather information ...');
      
      // @see http://www.myweather2.com/developer/apis.aspx?uref=becda844-8299-4bf6-899b-d771a92b9dbf
      var url = 'http://www.myweather2.com/developer/forecast.ashx?uac=' + Ti.App.Properties.getString('weather2AccessCode') + '&output=json&temp_unit=f&query=' + Location.currentCoords.latitude + ',' + Location.currentCoords.longitude;
      Ti.API.info('Weather2 URL: ' + url);
      
      var xhr = Ti.Network.createHTTPClient({
        onload: function(e) {
          // This function is called when data is returned from the server and available for use
          // this.responseText holds the raw text return of the message (used for text/JSON)
          // this.responseXML holds any returned XML (including SOAP)
          // this.responseData holds any returned binary data
          var httpStatus = this.status;
          if (httpStatus == 200) {
            Ti.API.info('Weather data was found.');
            Ti.App.fireEvent('weather_update', JSON.parse(this.responseText)); 
            
            // Hide the activity indicator and show a basic label instead.
            activityIndicator.hide();
            var finishMessage = Ti.UI.createLabel({
              bottom:10,
              height:50,
              width:210,
              color:'white',
              font:{fontFamily:'Helvetica Neue', fontSize:15,fontWeight:'bold'},
              text:'Found your weather.',
              textAlign:Titanium.UI.TEXT_ALIGNMENT_CENTER
            });
            win.add(finishMessage);
            setTimeout(function() {
              win.remove(finishMessage);
            },3000);            
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
W.Weather = function() {
  var win = Ti.UI.createWindow({
    backgroundColor:'#509fd6',
    backgroundImage:Ti.Filesystem.resourcesDirectory + 'images/window_weather_bg.png',
  });
  
  var headline = Ti.UI.createImageView({
    top:20,
    width:270,
    height:33,
    image:Ti.Filesystem.resourcesDirectory + 'images/window_weather_headline.png',
  });
  
  Ti.API.info(Ti.Filesystem.resourcesDirectory + 'images/window_weather_headline.png');
  
  win.add(headline);

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
      width:'85%',
      top:70,
      height:100,
      borderRadius:5,
      backgroundColor:'#4d8bb5',
      borderColor:'#386482'
    });
    var labelLocation = UI.Label({
      text:'Current weather in ' + Location.currentLocation.city + ':',
      top:0,
      left:5,
      font:{fontFamily:'Helvetica Neue', fontSize:16,fontWeight:'normal'}
    });
    var labelWeatherText = UI.Label({
      text:data.weather.curren_weather[0].weather_text,
      top:20,
      left:5,
      font:{fontFamily:'Helvetica Neue', fontSize:14,fontWeight:'normal'},
    });
    
    var tempFahrenheit = data.weather.curren_weather[0].temp;
    var labelTempFahrenheit = UI.Label({
      text:tempFahrenheit + '°F',
      bottom:0,
      right:100,
      font:{fontFamily:'Helvetica Neue', fontSize:35,fontWeight:'bold'},
  
    });
    var labelTempCelcius = UI.Label({
      text:UTILS.FahrenheitToCelcius(tempFahrenheit) + '°C',
      bottom:0,
      right:5,
      font:{fontFamily:'Helvetica Neue', fontSize:35,fontWeight:'bold'},
    });
    
    var viewCurrentHighLow = Ti.UI.createView({
      width:'85%',
      top:175,
      height:20,
      borderRadius:3,
      backgroundColor:'#2075a6'
    });
    var tempLowFahrenheit = data.weather.forecast[0].night_min_temp;
    var tempHighFahrenheit = data.weather.forecast[0].day_max_temp;
    var labelTodayLow = UI.Label({
      text:'Low: ' + tempLowFahrenheit + '°F  |  ' + UTILS.FahrenheitToCelcius(tempLowFahrenheit) + '°C',
      left:4,
      top:2,
      font:{fontFamily:'Helvetica Neue', fontSize: 12, fontWeight:'normal'},
    });
    var labelTodayHigh = UI.Label({
      text:'High: ' + tempHighFahrenheit + '°F  |  ' + UTILS.FahrenheitToCelcius(tempHighFahrenheit) + '°C',
      right:4,
      top:2,
      font:{fontFamily:'Helvetica Neue', fontSize: 12, fontWeight:'normal'},
    });    
    viewCurrentHighLow.add(labelTodayLow);
    viewCurrentHighLow.add(labelTodayHigh);
    
    viewCurrentWeather.add(labelLocation);
    viewCurrentWeather.add(labelWeatherText);
    viewCurrentWeather.add(labelTempFahrenheit);
    viewCurrentWeather.add(labelTempCelcius);
    
    win.add(viewCurrentWeather);
    win.add(viewCurrentHighLow);    
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
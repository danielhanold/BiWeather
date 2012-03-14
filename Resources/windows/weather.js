W.Weather = function() {
  var win = Ti.UI.createWindow({
    backgroundColor:'#509fd6',
    backgroundImage:Ti.Filesystem.resourcesDirectory + 'images/window_weather_bg.png',
  });
  
  // Create the headline.
  var headline = Ti.UI.createImageView({
    top:20,
    width:270,
    height:33,
    image:Ti.Filesystem.resourcesDirectory + 'images/window_weather_headline.png',
  });
  win.add(headline);  
    
  // Create an activity indicator.
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
  // Show the spinner.
  activityIndicator.show();
  
  var buttonRefresh = Ti.UI.createButton({
    title:'Refresh Weather',
    bottom:10,
    width:200,
    height:44,
    backgroundImage:'images/buttons/button-grey.png',
    color:'black',
    font:{fontFamily:'Helvetica Neue', fontSize:16, fontWeight:'bold'}
  });
  win.add(buttonRefresh);
  buttonRefresh.hide();

  // Add a view for the current weather.
  var viewCurrentWeather = Ti.UI.createView({
    width:'85%',
    top:70,
    height:100,
    borderRadius:5,
    backgroundColor:'#4d8bb5',
    borderColor:'#386482'
  });
  var labelLocation = UI.Label({
    text:'Weather data not availble.',
    top:0,
    left:5,
    font:{fontFamily:'Helvetica Neue', fontSize:16,fontWeight:'normal'}
  });
  var labelWeatherText = UI.Label({
    top:20,
    left:5,
    font:{fontFamily:'Helvetica Neue', fontSize:14,fontWeight:'normal'},
  });
  var labelTempFahrenheit = UI.Label({
    bottom:0,
    right:100,
    font:{fontFamily:'Helvetica Neue', fontSize:35,fontWeight:'bold'},

  });
  var labelTempCelcius = UI.Label({
    bottom:0,
    right:5,
    font:{fontFamily:'Helvetica Neue', fontSize:35,fontWeight:'bold'},
  });
  viewCurrentWeather.add(labelLocation);
  viewCurrentWeather.add(labelWeatherText);
  viewCurrentWeather.add(labelTempFahrenheit);
  viewCurrentWeather.add(labelTempCelcius);    

  // Add a view for the daily high / low.
  var viewCurrentHighLow = Ti.UI.createView({
    width:'85%',
    top:175,
    height:20,
    borderRadius:3,
    backgroundColor:'#2075a6'
  });
  var labelTodayLow = UI.Label({
    left:4,
    top:2,
    font:{fontFamily:'Helvetica Neue', fontSize: 12, fontWeight:'normal'},
  });
  var labelTodayHigh = UI.Label({
    right:4,
    top:2,
    font:{fontFamily:'Helvetica Neue', fontSize: 12, fontWeight:'normal'},
  });    
  viewCurrentHighLow.add(labelTodayLow);
  viewCurrentHighLow.add(labelTodayHigh);
   
  // Update the location.
  Location.updateLocation();

  /**
   * React to the weather update event.
   */
  Ti.App.addEventListener('weather_update', function(data) {
    //Ti.API.info(data.weather);

    // Update the labels.
    var tempFahrenheit = data.weather.curren_weather[0].temp;    
    var tempLowFahrenheit = data.weather.forecast[0].night_min_temp;
    var tempHighFahrenheit = data.weather.forecast[0].day_max_temp;
    var currentCity = (Location.currentLocationAvailable) ? Location.currentLocation.city : 'your location';
    labelLocation.setText('Current weather in ' + currentCity + ':');
    labelWeatherText.setText(data.weather.curren_weather[0].weather_text);
    labelTempFahrenheit.setText(tempFahrenheit + '°F');
    labelTempCelcius.setText(UTILS.FahrenheitToCelcius(tempFahrenheit) + '°C');
    labelTodayLow.setText('Low: ' + tempLowFahrenheit + '°F  |  ' + UTILS.FahrenheitToCelcius(tempLowFahrenheit) + '°C');
    labelTodayHigh.setText('High: ' + tempHighFahrenheit + '°F  |  ' + UTILS.FahrenheitToCelcius(tempHighFahrenheit) + '°C');
    
    // Add all elements to the page.
    win.add(viewCurrentWeather);
    win.add(viewCurrentHighLow);
  });

  // React when the app is resuming.
  Ti.App.addEventListener('resume', function(e) {
    Ti.API.info('App was resumed. Get the location again.');
    
    buttonRefresh.hide();
    
    // Remove the current elements from the window
    // so they can be added again.
    win.remove(viewCurrentWeather);
    win.remove(viewCurrentHighLow);
    
    // Change the text on the spinner.
    activityIndicator.setMessage('Updating your location ...');
    activityIndicator.show();
     
    // Update the location.
    Location.updateLocation();
  });
  
  /**
   * Add an event listener for the refresh button.
   */
  buttonRefresh.addEventListener('click', function(e) {
    Ti.API.info('Refresh button is clicked.');
    
    buttonRefresh.hide();
    
    // Remove the current elements from the window
    // so they can be added again.
    win.remove(viewCurrentWeather);
    win.remove(viewCurrentHighLow);
    
    // Change the text on the spinner.
    activityIndicator.setMessage('Updating your location ...');
    activityIndicator.show();
     
    // Update the location.
    Location.updateLocation();    
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
              buttonRefresh.show();
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
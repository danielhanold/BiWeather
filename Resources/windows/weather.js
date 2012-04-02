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
    top:3,
    left:8,
    font:{fontFamily:'Helvetica Neue', fontSize:16,fontWeight:'normal'}
  });
  var labelWeatherText = UI.Label({
    top:23,
    left:8,
    font:{fontFamily:'Helvetica Neue', fontSize:15,fontWeight:'normal'},
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
  var imageViewIcon = Ti.UI.createImageView({
    left:8,
    bottom:7,
    backgroundColor:'white'
  });
  viewCurrentWeather.add(labelLocation);
  viewCurrentWeather.add(labelWeatherText);
  viewCurrentWeather.add(labelTempFahrenheit);
  viewCurrentWeather.add(labelTempCelcius);
  viewCurrentWeather.add(imageViewIcon);    

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
   
  // Update the location when the window gets loaded for the first time.
  Location.updateLocation();

  /**
   * Update the weather data.
   */
  var updateWeatherDisplay = function(data) {
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
    },2000);

    // If server call was succesfull, update display.
    if (data) {
      //Ti.API.info(data.weather);
      
      // Update the labels.
      var tempFahrenheit = data.weather.curren_weather[0].temp;    
      var tempLowFahrenheit = data.weather.forecast[0].night_min_temp;
      var tempHighFahrenheit = data.weather.forecast[0].day_max_temp;
      var currentCity = (Location.currentLocationAvailable) ? Location.currentLocation.city : 'your location';
      labelLocation.setText('Current weather in ' + currentCity + ':');
      labelWeatherText.setText(data.weather.curren_weather[0].weather_text);
      labelTempFahrenheit.setText(tempFahrenheit + '°F');
      labelTempCelcius.setText(Utils.FahrenheitToCelcius(tempFahrenheit) + '°C');
      labelTodayLow.setText('Low: ' + tempLowFahrenheit + '°F  |  ' + Utils.FahrenheitToCelcius(tempLowFahrenheit) + '°C');
      labelTodayHigh.setText('High: ' + tempHighFahrenheit + '°F  |  ' + Utils.FahrenheitToCelcius(tempHighFahrenheit) + '°C');
      
      // Determine the weather icon image.
      var db = DB.Open();
      var weatherCode = data.weather.curren_weather[0].weather_code; 
      var query = 'SELECT * FROM weather2 WHERE weather_code = ?';
      var row = db.execute(query, weatherCode);
      
      // If later than 7pm, use the night icon, otherwise use the day icon.
      var date = new Date();
      var currentHour = date.getHours();
      var fieldName = (currentHour >= 19) ? 'icon_night' : 'icon_day';
      var iconName = row.fieldByName(fieldName);
      var imageFile = Ti.Filesystem.getFile('images/weather2_icons/' + iconName);
      var imageBlob = imageFile.read();
      Ti.API.info('Displaying this icon: ' + iconName);
      db.close();
      
      // Set the correct icon.
      imageViewIcon.setWidth(imageBlob.width);
      imageViewIcon.setHeight(imageBlob.height);
      imageViewIcon.setImage(imageBlob);
         
      // Add all elements to the page.
      win.add(viewCurrentWeather);
      win.add(viewCurrentHighLow);      
    }
    // If callback was unsuccessful, display an error message.
    else {
      Ti.API.info('Weather data could not be retrieved from the server.');
      alert('Weather data could not be updated.');
    }    
  };
  
  // Function to update the location display.
  var updateLocationDisplay = function() {
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
  }
  
  // React when the app is resuming.
  Ti.App.addEventListener('resume', function(e) {
    Ti.API.info('App was resumed. Get the location again.');
    updateLocationDisplay();
  });
  
  /**
   * Add an event listener for the refresh button.
   */
  buttonRefresh.addEventListener('click', function(e) {
    Ti.API.info('Refresh button is clicked.');
    updateLocationDisplay();
  });  

  /**
   * React to the location update event.
   */
  Ti.App.addEventListener('location_update', function() {
    Ti.API.info('Recorded a location update');

    if (Location.currentCoordsAvailable) {
      Ti.API.info('Coordinates are available. Attempt to get the temperature');
      activityIndicator.setMessage('Getting weather information ...');
      
      // Define a server call with a callback function.
      Utils.Server.GetWeatherData({
        latitude:Location.currentCoords.latitude,
        longitude:Location.currentCoords.longitude        
      }, updateWeatherDisplay);
    }    
  });  

  return win;
}
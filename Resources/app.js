// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

// Initialize app variables.
Ti.include('includes/properties.js');

// Load all windows.
Ti.include('windows.js');

var win = W.Weather();
win.open();


/**
 * When this window gets opened for the first
 * time, attempt to detect the location.
 */
Ti.Geolocation.purpose = '';
if (Ti.Geolocation.locationServicesEnabled) {
  Ti.API.debug('Location services are enabled');
  
  // Get the current location.
  Ti.Geolocation.getCurrentPosition(function(e) {
    if (e.error) {
      Ti.API.error('Error detected: ' + e.error);
    }
    else {
      // Fire an application-wide event so that
      // other elements can react to this.
      Ti.App.fireEvent('location_recorded', e.coords);
    }
  });
} else {
  alert('Please enable location services');
}


/**
 * React to the location update event.
 */
Ti.App.addEventListener('location_recorded', function(coords) {
  Ti.API.info('Recorded a location update');
  Ti.API.info(coords);
  
  if (coords.latitude && coords.longitude) {
    // @see http://www.myweather2.com/developer/apis.aspx?uref=becda844-8299-4bf6-899b-d771a92b9dbf
    var url = 'http://www.myweather2.com/developer/forecast.ashx?uac=ZivNvqdskN&output=json&temp_unit=c&query=' + coords.latitude + ',' + coords.longitude;
    Ti.API.info('URL: ' + url);
    
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
  
  // If the accuracy is better than ACCURACY_HUNDRED_METERS,
  // attempt to reverse-geocode the coordinates.
  if (coords.accuracy <= Ti.Geolocation.ACCURACY_HUNDRED_METERS) {
    Ti.Geolocation.reverseGeocoder(coords.latitude, coords.longitude, function(e) {
      Ti.API.info('Attempting to reverse-geocode location');
      if (e.success) {
        Ti.API.info(JSON.stringify(e.places[0].address));
        Ti.API.info('Full Address from reverse: ' + JSON.stringify(e.places[0]));             
      }
      else {
        Ti.API.info('Reverse-geocoding failed.');
      }
    });      
  }
});


/*
 * Geolocation features.
 */
// Set a global Location object.
var Location = {
  currentCoords:{},
  currentCoordsAvailable:false,
  currentLocation:{},
  currentLocationAvailable:false
};

(function() {
  Ti.Geolocation.purpose = 'Show you the weather for your current location';
  Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_BEST;
  
  Location.updateLocation = function() {
    if (Ti.Geolocation.locationServicesEnabled) {
      Ti.API.info('Location services are enabled');
      
      // Get the current location.
      Ti.Geolocation.getCurrentPosition(function(e) {
        if (e.error) {
          Ti.API.error('Error detected: ' + e.error);
          Location.currentCordsAvailable = false;
        }
        else {
          Ti.API.info('Location detected.');
          Location.currentCoords = e.coords;
          Location.currentCoordsAvailable = true;
          // If the accuracy is better than ACCURACY_HUNDRED_METERS,
          // attempt to reverse-geocode the coordinates.
          Ti.API.info('Accuracy: ' + e.coords.accuracy);
          if (e.coords.accuracy <= Ti.Geolocation.ACCURACY_HUNDRED_METERS) {
            Ti.Geolocation.reverseGeocoder(e.coords.latitude, e.coords.longitude, function(e) {
              Ti.API.info('Attempting to reverse-geocode location');
              if (e.success) {
                Ti.API.info('Full Address from reverse: ' + JSON.stringify(e.places[0]));
                Location.currentLocation = e.places[0];
                Location.currentLocationAvailable = true;
                
                // Trigger a global app event once all Location variables are updated.
                Ti.App.fireEvent('location_update', true);                             
              }
              else {
                Ti.API.info('Reverse-geocoding failed.');
                Location.currentLocationAvailable = false;
                
                // Trigger a global app event once all Location variables are updated.
                Ti.App.fireEvent('location_update', false);                
              }
            });
          }
          // The above reverse-geocoding only triggers if the location is 
          // good enough. Otherwise, still trigger the location update event.
          else {
            Ti.App.fireEvent('location_update', false);             
          }          
        }
      });
    } else {
      alert('Please enable location services');
    }    
  }
})();
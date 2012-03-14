// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

// Initialize app variables.
Ti.include('includes/properties.js');
Ti.include('includes/geolocation.js');
Ti.include('includes/ui.js');
Ti.include('includes/utils.js');
Ti.include('includes/database.js');

// Load all windows.
Ti.include('windows.js');

var win = W.Weather();
win.open();


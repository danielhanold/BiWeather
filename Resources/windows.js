// Define the W namespace as a global object for windows.
var W = {};

function refreshWindows() {
  Ti.include('windows/weather.js');
}

// Refresh all windows.
refreshWindows();

var UTILS = {};

(function() {
  // Define default label builder.
  UTILS.FahrenheitToCelcius = function(a) {
    return Math.round((a - 32) * (5/9));
  }
})();
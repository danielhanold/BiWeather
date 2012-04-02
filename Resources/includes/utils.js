var Utils = {};

(function() {
  // Define default label builder.
  Utils.FahrenheitToCelcius = function(a) {
    return Math.round((a - 32) * (5/9));
  }
})();
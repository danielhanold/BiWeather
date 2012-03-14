/**
 * Database Functions.
 */
// Create a global database object.
var DB = {};

(function() {
  DB.Open = function() {
    var db = Ti.Database.install('/databases/weather2.sqlite', 'weather');
    return db;
  }
})();

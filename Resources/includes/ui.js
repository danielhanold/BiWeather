var UI = {};

(function() {
  // Define default label builder.
  UI.Label = function(a) {
    a = a || {};
    a.font = a.font || {fontFamily:'Helvetica Neue', fontSize:16, fontWeight:'normal'};
    a.color = a.color || 'white';
    a.width = a.width || 'auto';
    a.height = a.height || 'auto';
    return Ti.UI.createLabel(a);
  }
})();
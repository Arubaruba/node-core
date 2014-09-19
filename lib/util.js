exports.requiredProperties = function(options, requiredOptions, componentName) {
  var missingOptions = [];
  for (var i = 0; i < requiredOptions.length; i++) {
    if (!options[requiredOptions[i]]) missingOptions.push(requiredOptions[i]);
  }
  if (missingOptions.length > 0) throw (componentName + ' missing options: ' + missingOptions.join(', '));
};

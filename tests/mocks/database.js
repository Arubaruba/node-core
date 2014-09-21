var data = {};

exports.set = function(name, value, callback) {
  data[name] = value;
  callback();
};

exports.get = function(name, callback) {
  callback(null, data[name]);
};



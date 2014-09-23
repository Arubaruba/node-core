var data = {};

exports.put = function(name, value, callback) {
  data[name] = value;
  callback();
};

exports.get = function(name, callback) {
  callback(null, data[name]);
};



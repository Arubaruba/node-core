var http = require('http');
var core = require('../../index');
var db = require('../mocks/database');

var serverOptions = {
  port: 3039, db: db
};

exports.route = core.route;
exports.init = function (callback) {
  core.init(serverOptions, callback);
};
exports.request = function (options, callback) {
  options.port = serverOptions.port;
  options.host = 'localhost';
  return http.request(options, callback);
};


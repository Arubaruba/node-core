var http = require('http');
var core = require('../../index');
var db = require('../mocks/database');

var portIterator = 7343;

module.exports = function () {
  var helper = this;
  this.route = core.route;
  this.port = portIterator++;
  this.init = function (callback) {
    core.init({port: helper.port, db: db}, callback);
  };
  this.request = function (options, callback) {
    options.port = helper.port;
    options.host = 'localhost';
    return http.request(options, callback);
  };
};

var http = require('http');
var util = require('./lib/util');
var router = require('./lib/router');
var cluster = require('./lib/cluster');
var session = require('./lib/session/session');

exports.route = router.root;

exports.init = function (options, callback) {
  util.requiredProperties(options, ['db', 'port'], 'Core');

  function startServer() {
    http.createServer(function (request, response) {
//      var session = session(request, response, options.db);
      router.init(request, response, session);
    }).listen(options.port);
    if (callback) callback();
  }

  if (options.production) {
    // This will spawn a process for each CPU and automatically restart these processes when they fail
    cluster.initClusters(startServer);
  } else {
    // Clusters make debugging difficult. They will not be used for development.
    startServer();
  }
};

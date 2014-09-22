var http = require('http');
var util = require('./lib/util');
var Route = require('./lib/route');
var cluster = require('./lib/cluster');
var session = require('./lib/session/session');

var route = new Route('*', function(request, response, session, router) {
  router.next(function() {
    response.statusCode = 404;
    response.end('404 Error - Page not found');
  });
});

exports.init = function (options, callback) {
  util.requiredProperties(options, ['db', 'port'], 'Core');

  function startServer() {
    var server = http.createServer(function (request, response) {
      session(request, response, options, function (err, session) {
        route.follow(request, response, session);
      });
    }).listen(options.port);
    if (callback) callback(server);
  }

  if (options.production) {
    // This will spawn a process for each CPU and automatically restart these processes when they fail
    cluster.initClusters(startServer);
  } else {
    // Clusters make debugging difficult. They will not be used for development.
    startServer();
  }
};

exports.route = route;

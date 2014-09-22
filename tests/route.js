var httpHelper = require('./helpers/http');

exports['Paths'] = function (test) {
  test.expect(1);

  var http = new httpHelper();
  var url = '/test/a/b';

  http.init(function () {
    http.route.handle(url, function (request, response) {
      test.ok(true, 'paths');
      test.done();
      response.end();
    });

    http.request({path: url}).end();
  });
};
exports['Barrier Paths'] = function (test) {
  var http = new httpHelper();

  http.init(function () {
    http.route.handle('/barrier', function (request, response) {
      response.end('barrier');
    });

    http.route.handle('/barrier/secret', function (request, response) {
      test.ok(false, 'Secret path ');
      response.end();
    });

    http.request({path: '/barrier/secret'}, function() {
      test.done();
    }).end();
  });
};

exports['Dynamic Paths'] = function (test) {
  var http = new httpHelper();
  var id = 310;

  http.init(function () {
    http.route.handle('/test/:id', function (request, response, session, route) {
      test.equal(route.dynamicSegements.id, id, 'Dynamic segment value read correctly');
      response.end();
    });

    http.request({path: '/test/' + id}, function() {
      test.done();
    }).end();
  });
};

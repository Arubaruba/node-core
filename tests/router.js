var router = require('../lib/router');
// A test helper for all router tests
function routerTest(url, call) {
  var http = require('./mocks/http')();
  http.request.url = url;
  call(router);

  router.init(http.request, http.response, {});
}

exports['Paths'] = function (test) {
  var url = '/test/a/b';
  routerTest(url, function (router) {
    router.root.handle(url, function () {
      test.ok(true, 'paths');
      test.done();
    });
  });
};
exports['Barrier Paths'] = function (test) {
  routerTest('/barrier/secret', function (router) {
    router.root.handle('/barrier', function (request, response) {
      test.ok(true, 'Barrier Reached');
      response.end();

    }).handle('/secret', function () {
      test.ok(false, 'Secret path ');
    });
  });
  test.done();
};
exports['Dynamic Paths'] = function (test) {
  var id = 310;
  routerTest('/test/' + id, function (router) {
    router.root.handle('/test/:id', function (request, response, session, dynamicPaths) {
      test.ok(dynamicPaths.id == id);
      test.done();
    });
  });
};

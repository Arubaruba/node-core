var httpHelper = require('./helpers/http');

exports['GET'] = function (test) {
  httpHelper.route.handle('/', function (request, response, session) {
    test.equal(session.GET.test, '1234', 'Get parameters read correctly')
    test.done();
    response.end('ok');
  });
  httpHelper.init(function () {
    httpHelper.request({path: '/?test=1234'}).end();
  });
};
//
//exports['Cookies'] = function (test) {
//
//  var cookieName = 'chocolate-chip';
//  var cookieValue = 'tasty';
//
//  httpHelper.route.handle('/setCookie', function (request, response, session) {
//    session.setCookie(cookieName, cookieValue);
//    response.end();
//  });
//  httpHelper.route.handle('/checkCookie', function (request, response, session) {
//    test.equals(request.cookies[cookieName], cookieValue, 'Cookies can be created and read');
//    test.done();
//    response.end();
//  });
//  httpHelper.init(function () {
//    httpHelper.request({path: '/setCookie'}).end(function() {
//      httpHelper.request({path: '/checkCookie'}).end();
//    });
//  });
//};

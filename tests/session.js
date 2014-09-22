var httpHelper = require('./helpers/http');

exports['GET'] = function (test) {
  test.expect(1);

  var http = new httpHelper();

  http.init(function () {
    http.route.handle('/GetTest', function (request, response, session) {
      test.equal(session.GET.test, '1234', 'Get parameters read correctly');
      test.done();
      response.end();
    });

    http.request({path: '/GetTest?test=1234'}).end();
  });
};

exports['Cookies'] = function (test) {
  test.expect(1);

  var http = new httpHelper();

  var cookieName = 'chocolate-chip';
  var cookieValue = '13  ';

  http.init(function () {
    http.route.handle('/setCookie', function (request, response, session) {
      var inFiveSeconds = new Date();
      inFiveSeconds.setSeconds(inFiveSeconds.getSeconds() + 5);
      session.setCookie(cookieName, cookieValue, {Expires: inFiveSeconds.toUTCString()});
      response.end();
    });

    http.route.handle('/checkCookie', function (request, response, session) {
      test.equals(session.cookies[cookieName], cookieValue, 'Cookies can be created and read');
      test.done();
      response.end();
    });

    http.request({path: '/setCookie'}, function (response) {
      var sessionToken = response.headers['session-token'];
      http.request({path: '/checkCookie?token=' + sessionToken, headers: {'Cookie': response.headers['set-cookie'][0].split('; ')[0]}}).end();
    }).end();
  });
};

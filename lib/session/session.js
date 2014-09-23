var crypto = require('crypto');
var url = require('url');
var async = require('async');
var cookies = require('./cookies');

module.exports = function (request, response, options, finalCallback) {

  var db = options.db;
  var cookieDefaults = (options.cookieDefaults) ? options.cookieDefaults : {};

  var GET = url.parse(request.url, true).query;
  var sessionToken = GET.token;

  db.get('sessions/' + sessionToken, function (err, savedData) {
    if (savedData) {
      init(savedData);
    } else {
      savedData = {
        created: new Date()
      };
      async.parallel([
        function (callback) {
          crypto.randomBytes(64, function (err, result) {
            sessionToken = result.toString('base64').replace(/\W/g, '');
            response.setHeader('Session-Token', sessionToken);
            callback();
          });
        },
        function (callback) {
          crypto.randomBytes(32, function (err, result) {
            savedData.privateKey = result.toString('base64').replace(/\W/g, '');
            callback();
          });
        }
      ], function () {
        init(savedData);
      });
    }
  });

  function init(savedData) {
    savedData.lastActivity = new Date();
    db.put('sessions/' + sessionToken, savedData, function () {

      var session = {
        GET: GET,
        savedData: savedData,
        db: db
      };

      cookies(request, response, savedData.privateKey, cookieDefaults, function (err, cookies, setCookie) {
        session.cookies = cookies;
        session.setCookie = setCookie;
        finalCallback(null, session);
      });
    });
  }
};
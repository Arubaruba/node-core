var crypto = require('crypto');
var url = require('url');
var async = require('async');
var cookies = require('./cookies');

module.exports = function (request, response, options, finalCallback) {

  var db = options.db;
  var cookieDefaults = (options.cookieDefaults) ? options.cookieDefaults : {};

  var GET = url.parse(request.url, true).query;
  var sessionToken = GET.token;

  db.get('sessions/' + sessionToken, function (err, store) {
    if (store) {
      init(store);
    } else {
      store = {
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
            store.privateKey = result.toString('base64').replace(/\W/g, '');
            callback();
          });
        }
      ], function () {
        init(store);
      });
    }
  });

  function init(store) {
    store.lastActivity = new Date();
    db.set('sessions/' + sessionToken, store, function () {

      var session = {
        GET: GET,
        store: store
      };

      cookies(request, response, store.privateKey, cookieDefaults, function (err, cookies, setCookie) {
        session.cookies = cookies;
        session.setCookie = setCookie;
        finalCallback(null, session);
      });
    });
  }
};
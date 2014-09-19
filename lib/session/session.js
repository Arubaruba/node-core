var crypto = require('crypto');
var url = require('url');
var cookies = require('./cookies');

module.exports = function (request, response, db, callback) {

  var session = {
    GET: url.parse(request.url),
    values: {}
  };

  function saveSession(callback) {
    db.set('sessions/' + session.token, function (err) {

    });
  }

  db.get('sessions/' + url.parse(request.url).token, function (err, sessionValues) {
    if (sessionValues) {
      session.values = sessionValues;
      session.values.requestCount++;

      callback(null, session);
    } else {
      session.created = new Date();
      session.values.requestCount = 0;
      crypto.randomBytes(256, function (err, randomBytes) {
        session.token = randomBytes.toString('base64');
        cookies(request, response, function (err, signingToken, cookies) {
          session.cookies = cookies;
          session.signingToken = signingToken;
          callback(null, session);
        });
      });
    }
  });
};
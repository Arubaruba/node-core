var crypto = require('crypto');

module.exports = function (request, response, callback) {

  var cipher = 'aes256';

  crypto.randomBytes(256, function (err, randomBytes) {
    var signingToken = randomBytes.toString('base64');

    callback(null, {
      set: function (name, value, options) {

      },
      get: function (name) {

      }
    });
  });
};
var crypto = require('crypto');
var async = require('async');


module.exports = function (request, response, privateKey, cookieDefaults, callback) {

  var requestCookies = {};
  var responseCookies = [];

  function getHmac(value, callback) {
    var hmac = crypto.createHmac('RSA-SHA256', privateKey);
    hmac.setEncoding('base64');

    hmac.on('data', function (data) {
      callback(null, data.replace(/\W/g, ''));
    });
    hmac.on('error', function (err) {
      callback(err);
    });

    hmac.write(value);
    hmac.end();
  }

  var requestCookieHeaders = (request.headers.cookie) ? request.headers.cookie.split('; ') : [];

  async.each(requestCookieHeaders, function (cookie, callback) {
    var cookieParts = cookie.split('=');
    if (cookieParts.length != 2) {
      callback('Invalid cookie string');
    } else {
      var valueParts = cookieParts[1].split('.');
      if (valueParts.length != 2) {
        callback('Invalid cookie value string');
      } else {
        var name = cookieParts[0];
        var value = valueParts[0];
        var suppliedHmac = valueParts[1];

        getHmac(name + value, function (err, actualHmac) {
          if (suppliedHmac != actualHmac) {
            callback('Invalid Cookie Hmac - Cookies have been tampered with');
          } else {
            requestCookies[decodeURIComponent(name)] = decodeURIComponent(value);
            callback(null);
          }
        });
      }
    }
  }, function (err) {
    if (err) console.error(err);

    callback(null, requestCookies, function (name, value, suppliedOptions) {
      var options = cookieDefaults;
      for (var option in suppliedOptions) {
        options[option] = cookieDefaults[option];
      }
      responseCookies.push({name: name, value: value, options: options});
    });
  });

  response.on('end', function (stream) {
    stream.pause();

    async.map(responseCookies, function (cookie, callback) {
      var encodedName = encodeURIComponent(cookie.name);
      var encodedValue = encodeURIComponent(cookie.value);

      var headerComponents = [];

      for (var option in options) {
        var optionName = encodeURIComponent(option);
        var optionValue = encodeURIComponent(options[option]);
        if (optionValue === true) {
          headerComponents.push(optionValue);
        } else {
          headerComponents.push(optionName + '=' + optionValue);
        }
      }

      getHmac(encodedName + encodedValue, function (err, hmac) {
        callback(null, encodedName + '=' + encodedValue + '.' + hmac + '; ' + headerComponents.join('; '));
      });
    }, function (err, results) {
      if (err) {
        console.error(err);
      } else {
        response.setHeader('Set-Cookie', results);
      }
      stream.resume();
    });
  });
};
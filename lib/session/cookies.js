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

  // name, value, callback
  // name, value, options, callback
  function setCookie() {
    var name, value, options = cookieDefaults, callback;
    if (arguments[3]) {
      name = arguments[0];
      value = arguments[1];
      for (var option in arguments[2]) {
        options[option] = arguments[2][option];
      }
      callback = arguments[3];
    } else if (arguments[2]) {
      name = arguments[0];
      value = arguments[1];
      callback = arguments[2];
    } else {
      throw('setCookie requires either: name, value, callback || name, value, options, callback')
    }

    var encodedName = encodeURIComponent(name);
    var encodedValue = encodeURIComponent(value);

    var headerComponents = [];

    for (var option in options) {
      var optionName = option;
      var optionValue = options[option];
      if (optionValue === true) {
        headerComponents.push(optionValue);
        // If the value has this function it is a Date Object; Convert it to a UTC String
      } else if (optionValue.toUTCString) {
        optionValue = optionValue.toUTCString();
      } else {
        headerComponents.push(optionName + '=' + optionValue);
      }
    }

    getHmac(encodedName + encodedValue, function (err, hmac) {
      var cookieHeaders = response.getHeader('Set-Cookie');
      if (!cookieHeaders) cookieHeaders = [];
      cookieHeaders.push(encodedName + '=' + encodedValue + '.' + hmac + ((headerComponents.length == 0) ? '' : '; ' + headerComponents.join('; ')));
      response.setHeader('Set-Cookie', cookieHeaders);
      callback(err);
    });
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

    callback(null, requestCookies, setCookie);
  });
};
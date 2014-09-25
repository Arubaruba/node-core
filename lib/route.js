var urlUtils = require('url');

var dynamicSegmentRegex = /(?:\:)[^/]*/g;
var wildcardRegex = /\*/g;

var Route = function (url, call) {
  var route = this;
  this.regex = new RegExp('^' +
    (url.replace(dynamicSegmentRegex, '([^/]+)').replace(wildcardRegex, '.*')) + '$');

  var dynamicSegmentNames = url.match(dynamicSegmentRegex);
  this.dynamicSegmentNames = (!dynamicSegmentNames) ? [] : dynamicSegmentNames.map(function (segmentName) {
    // remove the ":" from each segment name
    return segmentName.substring(1);
  });
  this.follow = function (request, response, session) {
    var parsedUrl = urlUtils.parse(request.url);
    var match = route.regex.exec(parsedUrl.pathname);

    if (match) {
      var dynamicSegments = {};
      for (var i = 0, ii = route.dynamicSegmentNames.length; i < ii; i++) {
        dynamicSegments[route.dynamicSegmentNames[i]] = match[i + 1];
      }

      var router = {
        pathname: parsedUrl.pathname,
        query: parsedUrl.query,
        dynamicSegements: dynamicSegments,
        next: function (onError) {
          if (!route.subRoutes.some(function (subRoute) {
            return subRoute.follow(request, response, session, router);
          })) {
            if (onError) {
              onError();
            }
          }
        }
      };

      if (call) {
        call(request, response, session, router);
      } else {
        router.next();
      }
      return true;
    } else {
      return false;
    }
  };
  this.subRoutes = [];
  this.handle = function (definedUrl, call) {
    var subRoute = new Route(url + definedUrl, call);
    this.subRoutes.push(subRoute);
    return subRoute;
  };
};

module.exports = Route;
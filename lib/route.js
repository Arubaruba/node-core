var urlUtils = require('url');

var dynamicSegmentRegex = /(?:\:)[^/]*/g;
var wildcardRegex = /\*/g;

var Route = function (url, call) {
  var route = this;
  this.regex = new RegExp(url
    .replace(dynamicSegmentRegex, '([^/]+)')
    .replace(wildcardRegex, '[^/]*'));

  var dynamicSegmentNames = url.match(dynamicSegmentRegex);
  this.dynamicSegmentNames = (!dynamicSegmentNames) ? [] : dynamicSegmentNames.map(function(segmentName) {
    // remove the ":" from each segment name
    return segmentName.substring(1);
  });
  this.follow = function (request, response, session) {
    var match = route.regex.exec(urlUtils.parse(request.url).pathname);

    if (match) {
      var dynamicSegments = {};
      for (var i = 0, ii = route.dynamicSegmentNames.length; i < ii; i++) {
        dynamicSegments[route.dynamicSegmentNames[i]] = match[i + 1];
      }

      var router = {
        dynamicSegements: dynamicSegments,
        next: function(onError) {
          if (!route.subRoutes.some(function(subRoute) {
            return subRoute.follow(request, response, session, router);
          })) {
            onError();
          }
        }
      };

      call(request, response, session, router);
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

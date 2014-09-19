var routes = {};

var Route = function (url) {
  this.handle = function (urlAddition, callback) {
    var childUrl = url + urlAddition;
    if (routes[childUrl]) {
      throw('Route for ' + childUrl + ' already defined.');
    } else {
      routes[childUrl] = callback;
      return new Route(childUrl);
    }
  }
};

exports.root = new Route('');

exports.init = function (request, response, session) {
  // Prevent further segments from being executed once a segment has already ended the response
  var responseEnded = false;
  response.on('end', function () {
    responseEnded = true;
  });

  for (var route in routes) {
    if (!responseEnded) {
      var correctRoute = true;

      var definedSegments = route.split('/');
      var requestSegments = request.url.split('/');
      var dynamicSegmentValues = {};

      for (var i = 0, ii = definedSegments.length; i < ii; i++) {
        var definedSegment = definedSegments[i];
        var requestSegment = requestSegments[i];
        // A segment must either be dynamic ...
        if (definedSegment[0] == ':') {
          dynamicSegmentValues[definedSegment.substring(1)] = requestSegment;
        // or it must match the defined segment exactly
        } else if (definedSegment != requestSegment) {
          correctRoute = false;
          break;
        }
      }
      if (correctRoute) {
        routes[route](request, response, session, dynamicSegmentValues);
      }
    }
  }
}
;

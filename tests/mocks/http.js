module.exports = function () {
  var result = {
    request: {},
    response: {
      events: {},
      on: function (event, call) {
        result.response.events[event] = call;
      },
      end: function () {
        result.response.events['end']();
      }
    }
  };
  return result;
};

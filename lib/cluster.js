var cluster = require('cluster');
var os = require('os');

exports.initClusters = function (callback) {

  var workers = process.env.WORKERS || os.cpus().length;

  if (cluster.isMaster) {
    console.log('Creating %s workers (one for each cpu)', workers);

    for (var i = 0; i < workers; i++) {
      var worker = cluster.fork().process;
      console.log('Worker created with pid %s', worker.pid);
    }

    cluster.on('exit', function (worker) {
      console.log('worker with pid %s died, creating another', worker.process.pid);
      cluster.fork();
    });
  } else {
    callback();
  }
};

process.on('uncaughtException', function(err) {
  console.error(new Date());
  console.error(err.stack);
  process.exit(1);
});
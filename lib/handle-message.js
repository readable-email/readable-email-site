'use strict';

var cp = require('child_process');
var fs = require('fs');
var Promise = require('promise');

var pool = [];
var queue = [];

function addWorker() {
  pool.push(cp.fork(require.resolve('./handle-message-worker.js')));
}
addWorker();
addWorker();
addWorker();
addWorker();

module.exports = handleMessage;
function handleMessage(message) {
  return (new Promise(function (resolve) {
    if (pool.length) resolve(pool.pop());
    else queue.push(resolve);
  })).then(function (worker) {
    return (new Promise(function (resolve, reject) {
      setTimeout(function () { reject(new Error('Timed out on ' + message._id)); }, 5000);
      worker.once('message', resolve);
      worker.send(message);
    })).then(function (message) {
      if (queue.length) queue.pop()(worker);
      else pool.push(worker);
      return message;
    }, function (err) {
      fs.writeFileSync(__dirname + '/failed.md', message.body);
      worker.kill();
      addWorker();
      throw err;
    });
  });
}

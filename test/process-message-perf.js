'use strict';

var fs = require('fs');

var processor = require('../lib/process-message.js');

var directory = __dirname + '/process-message-perf/';
fs.readdirSync(directory).forEach(function (file) {
  var start = Date.now();
  processor.processMessage(fs.readFileSync(directory + file, 'utf8'));
  console.dir(Date.now() - start);
});

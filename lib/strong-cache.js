'use strict';

var assert = require('assert');
var knox = require('knox');
var Promise = require('promise');

if (!process.env.BUCKET) {
  console.error('Missing required environment variable BUCKET');
  process.exit(1);
}

var client = knox.createClient({
  key: process.env.BUCKET.split('/')[0],
  secret: process.env.BUCKET.split('/')[1],
  bucket: process.env.BUCKET.split('/')[2]
});
module.exports = {
  putBuffer: function (path, body) {
    assert(typeof path === 'string' && path.length, 'Path must be a non-empty string');
    assert(Buffer.isBuffer(body), 'Body must be a buffer');
    return new Promise(function (resolve, reject) {
      client.putBuffer(body, path, {}, function (err, res) {
        if (err) reject(err);
        else resolve(res);
      });
    });
  },
  getStream: function (path) {
    assert(typeof path === 'string' && path.length, 'Path must be a non-empty string');
    return new Promise(function (resolve, reject) {
      client.getFile(path, function (err, res) {
        if (err) return reject(err);
        else resolve(res);
      });
    });
  }
};

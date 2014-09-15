'use strict';

var crypto = require('crypto');
var processor = require('./process-message');


function handleMessage(message) {
  var hash = crypto.createHash('md5').update(message.from.email.toLowerCase().trim()).digest('hex');

  message.from = {
    name: message.from.name,
    email: message.from.email,
    hash: hash,
    avatar: 'https://secure.gravatar.com/avatar/' + hash + '?s=200&d=mm',
    profile: 'http://www.gravatar.com/' + hash
  };

  message.edited = processor.renderMessage(message.edited || processor.processMessage(message.body));

  return message;
}

process.on('message', function(m) {
  process.send(handleMessage(m));
});

'use strict';

var qs = require('querystring');
var crypto = require('crypto');
var Promise = require('promise');
var moment = require('moment');
var ms = require('ms');
var request = require('then-request');
var express = require('express');
var lusca = require('lusca');
var less = require('less-file');
var browserify = require('browserify-middleware');
var passport = require('passport');
var GitHubStrategy = require('passport-github').Strategy;
var jade = require('jade');
var favicon = require('serve-favicon');
var connect = require('readable-lists-api');
var processor = require('./lib/process-message.js');
// var stripe = require('./lib/stripe.js');
var version = require('./package.json').version;


var db = connect(process.env.DATABASE, process.env.BUCKET);
var app = express();

app.locals.asset = staticPath;
function staticPath(path) {
  return '/static/' + version + (path[0] === '/' ? '' : '/') + path;
}
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');


app.use(favicon(__dirname + '/favicon.ico'));
app.use(staticPath('/style'), less(__dirname + '/style/index.less'));
app.get(staticPath('/client/listing.js'), browserify(__dirname + '/client/listing.js'));
app.get(staticPath('/client/topic.js'), browserify(__dirname + '/client/topic.js'));
app.get(staticPath('/client/sponsor.js'), browserify(__dirname + '/client/sponsor.js'));


/*
passport.serializeUser(function (user, done) {
  done(null, user.id);
});
passport.deserializeUser(function (id, done) {
  return Promise.resolve(stripe.getCustomerById(id)).nodeify(done);
});
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID || '28627d32a6318f773fd3',
  clientSecret: process.env.GITHUB_CLIENT_SECRET || '6baddae5b8ea007f43f0312be1afc07eb2ea19d0',
  scope: 'user:email'
}, function (accessToken, refreshToken, profile, done) {
  request('https://api.github.com/user/emails?access_token=' + accessToken, {
    headers: { 'user-agent': 'esdiscuss.org', 'Accept': 'application/vnd.github.v3' }
  }).then(function (res) {
    var email = JSON.parse(res.getBody().toString()).filter(function (e) { return e.primary && e.verified })[0];
    if (email) email = email.email;
    if (!email) throw new Error('Your primary e-mail must be verified.');
    return stripe.getCustomerByEmail(email).then(function (customer) {
      if (customer) return customer;
      return stripe.addCustomer({email: email});
    });
  }).nodeify(done);
}));
*/

app.use(require('body-parser').urlencoded({extended: true}));
app.use(require('body-parser').json());
app.use(require('cookie-session')({
  keys: [process.env.COOKIE_SECRET || 'adfkasjast'],
  signed: true
}));
app.use(lusca.xframe('DENY'));
app.use(lusca.xssProtection());
app.use(function (req, res, next) {
  req.session._csrfSecret = req.session.csrfSecret;
  next();
});
app.use(lusca.csrf());
app.use(function (req, res, next) {
  req.session.csrfSecret = req.session._csrfSecret;
  next();
});
/*
app.use(passport.initialize());
app.use(passport.session());
*/

app.use(function (req, res, next) {
  res.locals.path = req.path;
  res.locals.url = req.url;
  res.locals.user = req.user;
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
});
app.get('/', function (req, res, next) {
  db.getLists().done(function (lists) {
    res.render('home.jade', {lists: lists});
  }, next);
});
app.get('/premium', function (req, res, next) {
  res.render('layout.jade');
});
app.post('/premium', function (req, res, next) {
  db.addPremiumBeta(req.body.email);
  res.redirect('/premium/subscribed');
});
app.get('/premium/subscribed', function (req, res, next) {
  res.render('premium-subscribed.jade');
});
app.get('/login', function (req, res, next) {
  res.render('login.jade', {returnAddress: req.query.return});
});
/*
app.get('/login/github', function (req, res, next) {
  passport.authenticate('github', {
    callbackURL: '/login/github?return=' + encodeURIComponent(req.query.return)
  }, function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.redirect('/login?return=' + encodeURIComponent(req.query.return)); }
    req.logIn(user, function (err) {
      if (err) { return next(err); }
      res.redirect(req.query.return || '/');
    });
  })(req, res, next);
});
app.get('/logout', function (req, res, next) {
  req.logOut();
  res.redirect(req.query.return || '/');
});
app.get('/account', function (req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/login/github?return=' + encodeURIComponent(req.url));
  }
  res.render('account.jade');
});
app.get('/account/sponsor', function (req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/login/github?return=' + encodeURIComponent(req.url));
  }
  res.render('sponsor.jade', {
    listId: req.query.list,
    returnAddress: req.query.return,
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY
  });
});
app.post('/account/sponsor', function (req, res, next) {
  if (!req.isAuthenticated()) {
    return res.send(403);
  }
  stripe.sponsor(req.user.id, req.body).done(function () {
    res.json('added');
  }, next);
});
app.get('/account/sponsor/:sponsorship/edit', function (req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/login/github?return=' + encodeURIComponent(req.url));
  }
  stripe.getSubscription(req.user.id, req.params.sponsorship).done(function (subscription) {
    res.render('sponsor-edit.jade', {
      sponsorship: subscription,
      STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY
    });
  }, next);
});
*/

app.all('/list/:list*', function (req, res, next) {
  db.getList(req.params.list).then(function (list) {
    req.list = list;
    res.locals.list = list;
    if (!req.list) return next();
    return []; // stripe.getAllSponsorships();
  }).then(function (sponsorships) {
    if (!req.list) return next();
    req.sponsorships = [];
    res.locals.sponsorships = req.sponsorships;
    for (var i = 0; i < sponsorships.length; i++) {
      if (sponsorships[i].list === req.list._id) {
        req.sponsorships.push(sponsorships[i]);
      }
    }
  }).done(function () {
    next();
  }, next);
});
app.get('/list/:list', function (req, res, next) {
  if (!req.list) return next();
  var page = +(req.query.page || 0);
  var numberPerPage = +(req.query['number-per-page'] || 40);

  var query = JSON.parse(JSON.stringify(req.query));
  query.page = page + 1;
  var nextPage = req.path + '?' + qs.stringify(query);
  query.page = page - 1;
  var previousPage = req.path + '?' + qs.stringify(query);
  db.getPage(req.list.source, page, numberPerPage).done(function (topics) {
    if (topics.length === 0) return next();
    topics.forEach(function (topic) {
      topic.start = moment(topic.start);
      topic.end = moment(topic.end);
    });
    res.render('listing.jade', {
      topics: topics,
      page: page,
      first: topics.first,
      last: topics.last,
      nextPage: nextPage,
      previousPage: previousPage
    });
  }, next);
});
app.get('/list/:list/topic/:topic', function (req, res, next) {
  if (!req.list) return next();
  db.getTopic(req.list.source, req.params.topic).then(function (topic) {
    if (!topic) return next();
    return db.getMessages(topic.subjectToken).then(function (messages) {
      if (messages.length === 0) return next();
      var visibleMessages = messages.map(function (message) {
        var hash = crypto.createHash('md5').update(message.from.email.toLowerCase().trim()).digest('hex');

        message.from = {
          name: message.from.name,
          email: message.from.email,
          hash: hash,
          avatar: 'https://secure.gravatar.com/avatar/' + hash + '?s=200&d=mm',
          profile: 'http://www.gravatar.com/' + hash
        };

        message.date = moment(message.date);

        message.edited = processor.renderMessage(message.edited || processor.processMessage(message.body));

        return message;
      });
      res.render('topic.jade', {
        topic: topic,
        messages: visibleMessages,
        hiddenMessages: messages.length - visibleMessages.length
      });
    });
  }).done(null, next);
});

app.listen(process.env.PORT || 3000);

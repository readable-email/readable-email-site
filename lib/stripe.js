'use strict';

var Promise = require('promise');
var ms = require('ms');
var stripe = require('stripe')(process.env.STRIPE);

var sponsorships = getAllSponsorships();


exports.getCustomerByEmail = getCustomerByEmail;
function getCustomerByEmail(email) {
  function gotData(data) {
    var customers = data.data;
    for (var i = 0; i < customers.length; i++) {
      if (customers[i].email === email) {
        return customers[i];
      }
    }
    if (!data.has_more) return null;
    return stripe.customers.list({starting_after: customers[customers.length - 1].id}).then(gotData);
  }
  return stripe.customers.list({}).then(gotData);
}

exports.getCustomerById = getCustomerById;
function getCustomerById(id) {
  return stripe.customers.retrieve(id);
}

exports.createCustomer = function (customer) {
  return stripe.customers.create(customer);
};

exports.sponsor = function (customerId, opts) {
  var args = {
    plan: 'sponsorship',
    metadata: {name: opts.name, list: opts.list, url: opts.url}
  };
  if (opts.isNew) {
    args.card = opts.card;
  }
  return stripe.customers.createSubscription(customerId, args).then(function () {
    return sponsorships = getAllSponsorships();
  });
};

exports.getSubscription = function (customerId, subscriptionId) {
  return stripe.customers.retrieveSubscription(customerId, subscriptionId);
};
exports.getAllSponsorships = function () {
  return sponsorships;
};
function updateSponsorships(){
  getAllSponsorships().then(function (s) {
    sponsorships = s;
  }, function () {
  }).done(function () {
    setTimeout(updateSponsorships, ms('10 minutes'));
  });
}
updateSponsorships();

function getAllSponsorships() {
  var start = Date.now();
  var results = [];
  function gotSubscriptions(data) {
    var subscriptions = data.data;
    var next = data.has_more && subscriptions[subscriptions.length - 1].id;
    var customer = data.has_more && subscriptions[subscriptions.length - 1].customer;
    subscriptions.forEach(function (subscription) {
      results.push(subscription.metadata);
    });
    if (next) {
      return stripe.customers.listSubscriptions(customer, {starting_after: next}).then(gotSubscriptions);
    }
  }
  function gotCustomers(data) {
    var customers = data.data;
    var next = data.has_more && customers[customers.length - 1].id;
    return Promise.all(customers.map(function (customer) {
      return gotSubscriptions(customer.subscriptions);
    })).then(function () {
      if (next) {
        return stripe.customers.list({starting_after: next}).then(gotCustomers);
      }
    });
  }
  return stripe.customers.list({}).then(gotCustomers).then(function () {
    console.dir(ms(Date.now() - start));
    return results;
  });
};

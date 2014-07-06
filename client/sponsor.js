'use strict';

var request = require('then-request');
var ClassList = require("class-list");

var savedCard = document.querySelector('[name="card"]');
var number = document.querySelector('[name="card_number"]');
var cvc = document.querySelector('[name="card_cvc"]');
var expiry = document.querySelector('[name="card_expiry"]');
var sponsorName = document.querySelector('[name="sponsor_name"]');

function clearErrors() {
  var errorHelp = document.querySelectorAll('.has-error span.help-block');
  for (var i = 0; i < errorHelp.length; i++) {
    errorHelp[i].parentNode.removeChild(errorHelp[i]);
  }
  var errored = document.getElementsByClassName('has-error');
  for (var i = 0; i < errored.length; i++) {
    ClassList(errored[i]).remove('has-error');
  }
  var alert = document.getElementsByClassName('alert-danger')[0];
  if (alert) {
    alert.parentNode.removeChild(alert);
  }
}
function setError(input, helpText) {
  var span = document.createElement('span');
  span.setAttribute('class', 'help-block');
  span.textContent = helpText;
  input.parentNode.appendChild(span);
  while (!ClassList(input).contains('form-group')) {
    input = input.parentNode;
  }
  ClassList(input).add('has-error');
}

if (savedCard) {
  savedCard.addEventListener('change', function () {
    var newCardForm = $('#new-card-form');
    newCardForm.collapse(savedCard.value === 'new-card' ? 'show' : 'hide');
  }, false);
}

var paymentForm = document.getElementById('payment-form');

var inputs = [
  savedCard,
  number,
  cvc,
  expiry,
  sponsorName,
  document.querySelector('input[type="submit"]'),
  paymentForm
];

var enabled = true;
paymentForm.addEventListener('submit', function (e) {
  e.preventDefault();
  if (!enabled) return;
  clearErrors();
  disable();
  if (savedCard && savedCard.value !== 'new-card') {
    gotCard(savedCard.value, false);
  } else {
    Stripe.card.createToken({
      number: number.value,
      cvc: cvc.value,
      exp_month: expiry.value.split('/')[0].trim(),
      exp_year: (expiry.value.split('/')[1] || '').trim()
    }, function (status, response) {
      if (response.error) {
        switch (response.error.param) {
          case 'number':
            setError(number, response.error.message);
            break;
          case 'exp_month':
          case 'exp_year':
            setError(expiry, response.error.message);
            break;
          case 'cvc':
            setError(cvc, response.error.message);
            break;
          default:
            var err = document.createElement('div');
            err.setAttribute('class', 'alert alert-danger');
            err.textContent = response.error.message;
            paymentForm.appendChild(err);
            console.error(response.error);
            break;
        }
        enable();
      } else {
        gotCard(response.id, true);
      }
    });
  }
}, false);

function disable() {
  enabled = false;
  for (var i = 0; i < inputs.length; i++) {
    inputs[i].setAttribute('disabled', 'disabled');
  }
}
function enable() {
  enabled = true;
  for (var i = 0; i < inputs.length; i++) {
    inputs[i].removeAttribute('disabled');
  }
}
function gotCard(id, isNew) {
  request('/account/sponsor', {
    body: JSON.stringify({
      list: listId,
      card: id,
      isNew: isNew,
      name: sponsorName.value
    }),
    headers: {'content-type': 'application/json'},
    method: 'POST'
  }).then(function (res) {
    return res.getBody();
  }).done(function () {
    location.assign(returnAddress || ('/' + listId));
  }, function (err) {
    console.log(err);
    enable();
  });
}

'use strict';

const isAuthenticated = require('express-module-membership/passport/authorization-middleware').isAuthenticated;

const mw = require('./middleware');

module.exports = [
  [ '/api/faqs', 'get', [ mw.formatQuery, mw.paginate, mw.find ]],
  [ '/api/faqs', 'post', [ isAuthenticated, mw.create ]],
  [ '/api/faqs/:id', 'get', [ mw.findById ]],
  [ '/api/faqs/:id', 'put', [ isAuthenticated, mw.put ]],
  [ '/api/faqs/:id', 'patch', [ isAuthenticated, mw.patch ]],
  [ '/api/faqs/:id', 'delete', [ isAuthenticated, mw.remove ]]
];

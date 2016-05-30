'use strict';

const mongoose = require('mongoose');

const mw = {
  formatQuery: require('warepot/format-query'),
  paginate: require('warepot/paginate')
};

const Faq = require('./model');

function create(req, res, next) {
  Faq.create(req.body, function (err, faq) {
    if (err) return next(err);

    res.status(201).json(faq);
  });
}

function find(req, res, next) {
  req.query = req.user ? req.query : _.defaults({ datePublished: { $ne: null } }, req.query);

  const page = Math.max(0, req.query.page) || 0;
  const perPage = Math.max(0, req.query.limit) || res.locals.perPage;

  const query = Faq.find(_.omit(req.query, 'limit', 'sort', 'page'),
    null,
    { sort: req.query.sort || '-dateCreated', lean: true });

  if (perPage)
    query.limit(perPage).skip(perPage * page);

  query.exec(function (err, faqs) {
    res.locals.faqs = faqs;
    next(err);
  });
}

function findById(req, res, next) {
  if (req.params.id === 'new') return next();
  const query = {};

  query[mongoose.Types.ObjectId.isValid(req.params.id) ? '_id' : '_hid'] = req.params.id;

  return Faq.findOne(query, function (err, faq) {
    if (err) return next(err);
    res.locals.faq = faq;
    next();
  });
}

function getAll(req, res, next) {
  if (!req.user)
    return getPublished(req, res, next);

  Faq.find().exec(function (err, faqs) {
    if (err) return next(err);

    res.locals.faqs = faqs;
    next();
  });
}

function getPublished(req, res, next) {
  Faq.find({ datePublished: { $ne: null } }).exec(function (err, faqs) {
    if (err) return next(err);

    res.locals.faqs = faqs;
    next();
  });
}

function patch(req, res, next) {
  const query = {};

  query[mongoose.Types.ObjectId.isValid(req.params.id) ? '_id' : '_hid'] = req.params.id;

  Faq.findOne(query, function (err, faq) {
    delete req.body._id;
    delete req.body.__v;

    _.extend(faq, req.body);

    return faq.save(function (err) {
      if (err) return next(err);

      return res.status(200).json(faq);
    });
  });
}

function put(req, res, next) {
  const query = {};

  query[mongoose.Types.ObjectId.isValid(req.params.id) ? '_id' : '_hid'] = req.params.id;

  Faq.findOne(query, function (err, faq) {
    _.difference(_.keys(faq.toObject()), _.keys(req.body)).forEach(function (key) {
      faq[key] = undefined;
    });

    _.extend(faq, _.omit(req.body, '_id', '__v'));

    return faq.save(function (err) {
      if (err) return next(err);

      return res.status(200).json(faq);
    });
  });
}

function remove(req, res, next) {
  return Faq.findById(req.params.id, function (err, faq) {
    if (err) return next(err);

    return faq.remove(function (err) {
      if (err) return next(err);
      return res.sendStatus(200);
    });
  });
}

module.exports = {
  create,
  find,
  findById,
  formatQuery: mw.formatQuery([ 'limit', 'sort', 'page' ]),
  getAll,
  getPublished,
  paginate: mw.paginate(Faq, 20),
  patch,
  put,
  remove,
};

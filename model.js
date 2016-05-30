'use strict';

const mongoose = require('mongoose');
const _ = require('lodash');

const config = require('./config');

const schema = {
  question: { type: String, required: true },
  answer: { type: String, required: true }
};

if (config.languages) {
  const question = schema.question;
  const answer = schema.answer;
  schema.question = {};
  schema.answer = {};
  _.forEach(config.languages, (value) => {
    schema.question[value.iso] = question;
    schema.answer[value.iso] = answer;
  });
}

const FaqSchema = new mongoose.Schema(schema);

FaqSchema.plugin(require('mongopot/plugins/base'));

module.exports = mongoose.model('Faq', FaqSchema);

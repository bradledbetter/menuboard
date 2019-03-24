'use strict';

/**
 * Removes forbidden characters from a string
 * @param {string} str string to sanitize
 * @return {string} sanitized version
 */
function sanitizeString(str) {
  return str.replace(/[<>]+/g, '');
}

/**
 * Mainly removes HTML tags
 * @param {object} model the model to pass through sanitizers
 * @return {object} sanitized version
 */
function sanitizeModel(model) {
  const obj = JSON.parse(JSON.stringify(model));
  const traverse = require('traverse');
  return traverse(obj).map(function(value) {
    if (typeof value === 'string') {
      return sanitizeString(value);
    }

    return value;
  });
}

module.exports = {
  sanitizeString,
  sanitizeModel
}

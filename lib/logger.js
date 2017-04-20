/**
 * Export chalk as the primary module interface.
 */
module.exports = require('chalk');

/**
 * Export a write method to actually output to the console.
 */
module.exports.write = function () {
  const messages = Array.prototype.slice.call(arguments);
  console.log(messages.join('\n'));
};


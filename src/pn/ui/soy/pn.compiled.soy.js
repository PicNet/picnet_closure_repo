// This file was automatically generated from pn.soy.
// Please don't edit this file by hand.

goog.provide('pn.ui.soy');

goog.require('soy');
goog.require('soy.StringBuilder');


/**
 * @param {Object.<string, *>=} opt_data
 * @param {soy.StringBuilder=} opt_sb
 * @return {string}
 * @notypecheck
 */
pn.ui.soy.edit = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class=\'details-container ', soy.$$escapeHtml(opt_data.specId), '\'>', (opt_data.title) ? '<div class=\'edit-head\'><div class=\'edit-title\'>' + soy.$$escapeHtml(opt_data.title) + '</div><div class=\'commands-container\'></div></div>' : '<div class=\'commands-container\'></div>', '</div>');
  return opt_sb ? '' : output.toString();
};


/**
 * @param {Object.<string, *>=} opt_data
 * @param {soy.StringBuilder=} opt_sb
 * @return {string}
 * @notypecheck
 */
pn.ui.soy.grid = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class=\'grid-parent ', soy.$$escapeHtml(opt_data.specId), '\'>', (opt_data.hasData) ? '<div class=\'grid-no-data\' style=\'display:none\'>No matches found.</div><div class=\'grid-container\' style=\'width:100%;\'></div>' : '<div class=\'grid-no-data\'>No data found.</div>', '</div>');
  return opt_sb ? '' : output.toString();
};

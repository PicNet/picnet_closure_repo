
goog.require('goog.debug.Console');
goog.require('goog.debug.LogManager');
goog.require('goog.log');
goog.require('goog.log.Logger');
goog.require('goog.object');
goog.require('pn');

goog.provide('pn.log');


/** @type {boolean} */
pn.log.OFF = true;


/**
 * @private
 * @type {boolean}
 */
pn.log.isExclusive_ = false;


/**
 * @private
 * @type {boolean}
 */
pn.log.isInitialised_ = false;


/**
 * @private
 * Initialised the log utilities.  This is done lazily internally.
 */
pn.log.initialise_ = function() {
  pn.ass(!pn.log.isInitialised_);
  pn.log.isInitialised_ = true;

  new goog.debug.Console().setCapturing(true);
  goog.debug.LogManager.getRoot().setLevel(goog.debug.Logger.Level.OFF);
};


/**
 * Displays the current stack trace if the browser supports it.
 */
pn.log.trace = function() {
  if (!window['console'] || !window['console']['trace']) return;
  window['console']['trace']();
};


/**
 * @param {...*} var_args Displays a message to the console.
 */
pn.log.log = function(var_args) {
  if (!window['console'] || !window['console']['log']) return;
  window['console']['log'].apply(window['console'], arguments);
};


/**
 * @param {...*} var_args Displays a warning to the console.
 */
pn.log.warn = function(var_args) {
  if (!window['console'] || !window['console']['warn']) {
    pn.log.log.apply(null, arguments);
    return;
  }
  window['console']['warn'].apply(window['console'], arguments);
};


/**
 * @param {string} name The name of the logger to create.
 * @param {boolean=} opt_exclusive Wether to turn off all other loggers.
 * @return {!goog.debug.Logger} The logger create with the specified name.
 */
pn.log.getLogger = function(name, opt_exclusive) {
  if (!pn.log.isInitialised_) { pn.log.initialise_(); }

  if (pn.log.OFF || pn.log.isExclusive_) {
    return pn.log.getLoggerImpl_(name,
        goog.debug.Logger.Level.OFF); }

  if (opt_exclusive) {
    pn.log.isExclusive_ = true;
    goog.object.forEach(goog.debug.LogManager.getLoggers(), function(l) {
      l.setLevel(goog.debug.Logger.Level.OFF);
    });
  }
  return pn.log.getLoggerImpl_(name,
      goog.debug.Logger.Level.ALL);
};


/**
 * A convenience logging method for types that do not need to initialise their
 *    own logger.
 * @param {string} msg The string message.
 * @param {Error=} opt_exception An exception associated with the message.
 */
pn.log.info = function(msg, opt_exception) {
  pn.log.deflogger_.info.apply(pn.log.deflogger_, arguments);
};


/**
 * @private
 * @param {string} name The name of the logger.
 * @param {goog.debug.Logger.Level} level The level to allow logging at.
 * @return {!goog.debug.Logger} The logger created.
 */
pn.log.getLoggerImpl_ = function(name, level) {
  var log = goog.log.getLogger(name);
  log.setLevel(level);
  return log;
};


/**
 * @private
 * @type {!goog.debug.Logger}
 */
pn.log.deflogger_ = pn.log.getLogger('pn.log');

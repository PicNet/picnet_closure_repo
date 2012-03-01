;
goog.require('goog.debug');
goog.require('goog.debug.Console');
goog.require('goog.debug.FancyWindow');
goog.require('goog.debug.LogManager');
goog.require('goog.debug.Logger');
goog.require('goog.object');

goog.provide('pn.LogUtils');


/**
 * @private
 * @const
 * @type {boolean}
 */
pn.LogUtils.OFF_ = false;


/**
 * @private
 * @type {boolean}
 */
pn.LogUtils.isExclusive_ = false;


/**
 * Initialised the log utilities
 */
pn.LogUtils.initialise = function() {
  new goog.debug.Console().setCapturing(true);
  // var ie7window = new goog.debug.FancyWindow('IE7 Logger');
  // ie7window.setEnabled(true);
  // ie7window.init();

  goog.debug.LogManager.getRoot().setLevel(goog.debug.Logger.Level.OFF);
};


/**
 * @param {string} name The name of the logger to create.
 * @param {boolean=} opt_exclusive Wether to turn off all other loggers.
 * @return {!goog.debug.Logger} The logger create with the specified name.
 */
pn.LogUtils.getLogger = function(name, opt_exclusive) {
  if (pn.LogUtils.OFF_ || pn.LogUtils.isExclusive_) {
    return pn.LogUtils.getLoggerImpl_(name,
        goog.debug.Logger.Level.OFF); }

  if (opt_exclusive) {
    pn.LogUtils.isExclusive_ = true;
    goog.object.forEach(goog.debug.LogManager.getLoggers(), function(l) {
      l.setLevel(goog.debug.Logger.Level.OFF);
    });
  }
  return pn.LogUtils.getLoggerImpl_(name,
      goog.debug.Logger.Level.ALL);
};


/**
 * @private
 * @param {string} name The name of the logger.
 * @param {goog.debug.Logger.Level} level The level to allow logging at.
 * @return {!goog.debug.Logger} The logger created.
 */
pn.LogUtils.getLoggerImpl_ = function(name, level) {
  var log = goog.debug.Logger.getLogger(name);
  log.setLevel(level);
  return log;
};

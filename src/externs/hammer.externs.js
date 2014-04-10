
/** 
 * @param {Element} el 
 * @param {Object=} opt_opts 
 * @return {!HammerInst} 
 */
var Hammer = function(el, opt_opts) {};

/**
 * @constructor
 * @param {Element} el
 * @param {Object=} opt_opts
 */
var HammerInst = function(el, opt_opts) {};

/** @param {string} ev @param {function(HammerEvent):undefined} cb */
HammerInst.prototype.on = function(ev, cb) {};

/** @param {string} ev @param {function(HammerEvent):undefined} cb */
HammerInst.prototype.off = function(ev, cb) {};

/** @param {string} type @param {Object} data */
HammerInst.prototype.trigger = function(type, data) {};

/** @constructor */
var HammerEvent = function() {};
HammerEvent.prototype.preventDefault = function() {};
HammerEvent.prototype.stopPropagation = function() {};

/** @type {HammerEventGesture} */
HammerEvent.prototype.gesture = null;

/** @constructor */
var HammerEventGesture = function() {};
HammerEventGesture.prototype.preventDefault = function() {};
HammerEventGesture.prototype.stopPropagation = function() {};
HammerEventGesture.prototype.stopDetect = function() {};
HammerEventGesture.prototype.srcEvent = {
  preventDefault: function() {}
};

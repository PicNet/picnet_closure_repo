
goog.provide('pn.ui.MobDefaultRenderer');

goog.require('pn.ui.IDefaultRenderer');

/**
 * TODO: Implement
 * @constructor
 * @implements {pn.ui.IDefaultRenderer}
 */
pn.ui.MobDefaultRenderer = function() {};

/** @override */
pn.ui.MobDefaultRenderer.prototype.getDefaultRenderer = 
    function(spec, opt_readonly) {
  
  return new pn.ui.edit.ComplexRenderer();
};



goog.provide('pn.ui.KeyShortcutMgr');

goog.require('goog.ui.KeyboardShortcutHandler');

/**
 * @constructor
 * @extends {goog.Disposable}
 */
pn.ui.KeyShortcutMgr = function() {
  goog.Disposable.call(this);

  /** @type {!goog.ui.KeyboardShortcutHandler} */
  this.shortcuts_ = new goog.ui.KeyboardShortcutHandler(document);
  this.registerDisposable(this.shortcuts_);

  
  /**
   * @private
   * @type {!Object.<function(string):undefined>}
   */
  this.callbacks_ = {};  
};
goog.inherits(pn.ui.KeyShortcutMgr, goog.Disposable);

pn.ui.KeyShortcutMgr.prototype.register = function(id, shortcut, callback) {
  this.sortcuts_.registerShortcut_(id, shortcut);
  this.callbacks_[id] = callback;
};

pn.ui.KeyShortcutMgr.prototype.unregister = function(id) {
  this.sortcuts_.unregisterShortcut_(id);
  delete this.callbacks_[id];
};

pn.ui.KeyShortcutMgr.prototype.enable = function(id, enabled) {
  
};
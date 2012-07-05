
goog.provide('pn.ui.KeyShortcutMgr');

goog.require('goog.ui.KeyboardShortcutHandler');
goog.require('goog.events.EventHandler');

/**
 * @constructor
 * @extends {goog.Disposable}
 */
pn.ui.KeyShortcutMgr = function() {
  goog.Disposable.call(this);

  /** 
   * @private
   * @type {!goog.ui.KeyboardShortcutHandler} 
   */
  this.shortcuts_ = new goog.ui.KeyboardShortcutHandler(document);
  this.registerDisposable(this.shortcuts_);

  /** 
   * @private
   * @type {!goog.events.EventHandler} 
   */
  this.eh_ = new goog.events.EventHandler(this);
  var eventType = goog.ui.KeyboardShortcutHandler.EventType.SHORTCUT_TRIGGERED;  
  this.eh_.listen(this.shortcuts_, eventType, this.handleShortcut_);
  this.registerDisposable(this.eh_);

  /**
   * @private
   * @type {!Object.<function():undefined>}
   */
  this.callbacks_ = {};  

  /**
   * @private
   * @type {!Object.<!Array.<string>>}
   */
  this.idShortcuts_ = {};  
};
goog.inherits(pn.ui.KeyShortcutMgr, goog.Disposable);

/**
 * @param {string} id The ID of the shortcut to register.  This ID is unique
 *    and can only be registered once.
 * @param {string} shortcuts A comma sepearated list of key sequences to
 *    register against the given ID.
 * @param {function():undefined} callback The callback to call when the given
 *    sequence is fired.
 */
pn.ui.KeyShortcutMgr.prototype.register = function(id, shortcuts, callback) {
  if (this.callbacks_[id]) 
    throw new Error('The specified id: ' + id + ' is already registered.');
  this.callbacks_[id] = callback;
  this.idShortcuts_[id] = [];

  goog.array.forEach(shortcuts.split(','), function(sc) {
    this.shortcuts_.registerShortcut(id, sc);    
    this.idShortcuts_[id].push(sc);
  }, this);  
};

/** @param {string} id The ID of the shortcut to deregister. */
pn.ui.KeyShortcutMgr.prototype.unregister = function(id) {
  goog.asserts.assert(this.idShortcuts_[id]);

  var shortcuts = this.idShortcuts_[id];
  goog.array.forEach(
      shortcuts, this.shortcuts_.unregisterShortcut, this.shortcuts_);
  delete this.callbacks_[id];
  delete this.shortcuts_[id];
  delete this.idShortcuts_[id];
};

/**
 * @param {string} id The ID of the shortcut to enable/disable.
 * @param {boolean} enable Wether to enable or disable the ID.
 */
pn.ui.KeyShortcutMgr.prototype.setEnabled = function(id, enable) {
  goog.asserts.assert(this.callbacks_[id]);

  this.callbacks_[id].disabled = !enable;
};

/** @param {boolean} enable Wether to enable or disable all shortcuts. */
pn.ui.KeyShortcutMgr.prototype.setAllEnabled = function(enable) {
  goog.object.forEach(this.callbacks_, function(cb) { cb.disabled = !enable; });  
};

/**
 * @private
 * @param {!goog.events.Event} event The event fired by the 
 *    goog.ui.KeyboardShortcutHandler containing the ID (indentifier) of the 
 *    registered shortcut pressed.
 */
pn.ui.KeyShortcutMgr.prototype.handleShortcut_ = function(event) {
  var id = event.identifier;
  var callback = this.callbacks_[id];
  if (!callback || callback.disabled) return;
  callback();
};

/** @override */
pn.ui.KeyShortcutMgr.prototype.disposeInternal = function() {
  pn.ui.KeyShortcutMgr.superClass_.disposeInternal.call(this);

  this.callbacks_ = {};
  this.idShortcuts_ = {};
};

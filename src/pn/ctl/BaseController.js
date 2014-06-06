goog.provide('pn.ctl.BaseController');

goog.require('pn.ctl.FieldsValidator');
goog.require('pn.ui.BaseControl');
goog.require('pn.ui.GestureFilter');
goog.require('pn.ui.MessagePanel');



/**
 * @constructor
 * @extends {pn.ui.BaseControl}
 * @param {!Element} el The element (view) for this controller.
 */
pn.ctl.BaseController = function(el) {
  pn.ui.BaseControl.call(this, el);

  /**
   * @protected
   * @type {goog.debug.Logger}
   */
  this.log = pn.log.getLogger(el.id || 'pn.ctl.UnknownController');

  /** @private @type {!pn.ctl.Director} */
  this.director_;

  /** @private @type {!pn.data.Storage} */
  this.storage_;

  /** @private @type {!pn.app.Router} */
  this.router_;

  /** @private @type {!pn.ui.MessagePanel} */
  this.msg_;

  /** @type {!pn.ctl.FieldsValidator} */
  this.validator = new pn.ctl.FieldsValidator(this);
  this.registerDisposable(this.validator);

  /** @type {boolean} */
  this.hasshown = false;
};
goog.inherits(pn.ctl.BaseController, pn.ui.BaseControl);


/**
 * @param {!pn.ctl.Director} director The director to use for
 *   showing dialogs.
 * @param {!pn.data.Storage} storage A local storage interface.
 * @param {!pn.app.Router} router The request router.
 * @param {!pn.ui.MessagePanel} msg The message panel.
 */
pn.ctl.BaseController.prototype.initialise =
    function(director, storage, router, msg) {
  pn.assInst(director, pn.ctl.Director);
  pn.assInst(storage, pn.data.Storage);
  pn.assInst(router, pn.app.Router);
  pn.assInst(msg, pn.ui.MessagePanel);

  this.director_ = director;
  this.storage_ = storage;
  this.router_ = router;
  this.msg_ = msg;
};


/** @return {boolean} Return false to cancel this transition. */
pn.ctl.BaseController.prototype.showing = function() { return true; };


/** Called once this controller is shown */
pn.ctl.BaseController.prototype.shown = function() {
  this.hasshown = true;
  if (!goog.userAgent.WINDOWS) // Dont move fields around on the desktop.
    this.listenTo(this.el, goog.events.EventType.CLICK, this.focus_);
};


/**
 * This hack moves the screen up to ensure the input field is at the top of the
 *    page.  This lets the soft keyboard show without obscuring the field.
 *    This now takes into account our fixed header by not moving the field
 *    to the very top of the page but rather 60 pixels less.
 * @private @param {!goog.events.Event} e The focus event.
 */
pn.ctl.BaseController.prototype.focus_ = function(e) {
  pn.assInst(e, goog.events.Event);
  var el = e.target,
      isinput = el instanceof HTMLInputElement ||
          el instanceof HTMLTextAreaElement;
  if (!isinput ||
      !!el.getAttribute('readonly') ||
      !!el.getAttribute('disabled')) return;

  goog.Timer.callOnce(function() {
    var pages = pn.dom.get('pages'),
        etop = el.getBoundingClientRect().top + pages.scrollTop;
    pages.scrollTop = etop - 60;
  }, 500, this);
};


/** @return {boolean} Return false to cancel this transition. */
pn.ctl.BaseController.prototype.hiding = function() {
  if (!this.hasshown) { throw new Error('Controller: ' + this.el.id +
      ' is hiding but appearts not to have been shown.  Ensure that ' +
      'shown and hid always call superClass_.show/hid'); }
  return true;
};


/**
 * Called once this controller is hid.  No need to dispose here as an explicit
 *    call to dispose follows the call to hid().
 */
pn.ctl.BaseController.prototype.hid = goog.nullFunction;

///////////////////////////////////////////////////////////////////////////////
/// PROTECTED HELPERS
///////////////////////////////////////////////////////////////////////////////


/**
 * @protected
 * Helper to access the Router.navigate method.
 * @param {string} path The path to navigate to, including history token.
 */
pn.ctl.BaseController.prototype.nav = function(path) {
  this.router_.navigate(path);
};

///////////////////////////////////////////////////////////////////////////////
// DOM / UI
///////////////////////////////////////////////////////////////////////////////


/**
 * @param {string} id The ID of element to remember from last time rememberSet
 *    was called.  This ID is in the standard format.
 */
pn.ctl.BaseController.prototype.remember = function(id) {
  var el = this.getel(id);
  el.value = this.localstore(el.id) || '';
};


/**
 * @param {string} id The ID of element to remember. This is done by remembering
 *    the current control's value. This ID is in the standard format.
 */
pn.ctl.BaseController.prototype.rememberSet = function(id) {
  var el = this.getel(id);
  this.localstore(el.id, el.value);
};


/**
 * Gets or sets something in the local storage.  The object stored will be
 *    serialised to JSON before storing.
 * @param {string} id The id of the object to store.  This must be unique
 *    accross the entire system or else the previous item will be overriden.
 * @param {*=} opt_val If specified this will be stored in the local storage.
 * @return {*} The value stored in local storage under the given id.
 */
pn.ctl.BaseController.prototype.localstore = function(id, opt_val) {
  if (goog.isDef(opt_val)) {
    this.storage_.save({'key': id, 'data': opt_val}, goog.nullFunction);
  } else {
    this.storage_.get(id, function(v) { opt_val = !!v ? v['data'] : null; });
  }
  return opt_val;
};


/**
 * @param {string} id The id of the Dialog to show
 * @param {Function=} opt_cb The callback on close.
 * @param {...*} var_args Any additional arguments to pass to the dialog
 *    constructor.
 */
pn.ctl.BaseController.prototype.dialog = function(id, opt_cb, var_args) {
  pn.assStr(id);
  pn.ass(!opt_cb || goog.isFunction(opt_cb));

  var args = pn.toarr(arguments);
  if (goog.isFunction(args[1])) args[1] = args[1].pnbind(this);
  args.unshift(false);
  this.director_.showDialog.apply(this.director_, args);
};


/**
 * @param {string|Array.<string>} fieldOrErrors The field to display the error
 *    message to or the error message or messages to display.
 * @param {(string|Array.<string>)=} opt_errors The error message or messages
 *    to display.
 */
pn.ctl.BaseController.prototype.error = function(fieldOrErrors, opt_errors) {
  this.showmsg('error', fieldOrErrors, opt_errors);
};


/**
 * @param {string|Array.<string>} fieldOrWarns The field to display the warning
 *    message to or the warning message or messages to display.
 * @param {(string|Array.<string>)=} opt_warns The warning message or messages
 *    to display.
 */
pn.ctl.BaseController.prototype.warning = function(fieldOrWarns, opt_warns) {
  this.showmsg('warning', fieldOrWarns, opt_warns);
};


/**
 * @param {string|Array.<string>} fieldOrMessages The field to display the
 *    message to or the message or messages to display.
 * @param {(string|Array.<string>)=} opt_msgs The message or messages
 *    to display.
 */
pn.ctl.BaseController.prototype.message = function(fieldOrMessages, opt_msgs) {
  this.showmsg('message', fieldOrMessages, opt_msgs);
};


/**
 * @param {string} type The type of message (error, warning, message).
 * @param {string|Array.<string>} fldOrMsg The field to display the
 *    message to or the message or messages to display.
 * @param {(string|Array.<string>)=} opt_msgs The message or messages
 *    to display.
 */
pn.ctl.BaseController.prototype.showmsg = function(type, fldOrMsg, opt_msgs) {
  var field = !!opt_msgs ? /** @type {string} */ (fldOrMsg) : '',
      messages = !!opt_msgs ?
          /** @type {string|Array.<string>} */ (opt_msgs) : fldOrMsg;

  pn.assStr(type);
  pn.assStr(field);
  pn.ass(goog.isString(messages) || goog.isArray(messages));

  var single = goog.isString(messages),
      m = this.msg_,
      action =
          type === 'message' ? (single ? m.showMessage : m.showMessages) :
          type === 'warning' ? (single ? m.showWarning : m.showWarnings) :
          type === 'error' ? (single ? m.showError : m.showErrors) : null;

  action.call(m, messages);
};

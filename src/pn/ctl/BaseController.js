goog.provide('pn.ctl.BaseController');

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

  this.setback_();
};


/** @private Replaces {ID} in back button if there */
pn.ctl.BaseController.prototype.setback_ = function() {
  var bb = goog.dom.getElementByClass('back-button', this.el);
  var href = !bb ? null : bb.href.toLowerCase();
  if (!href || href.indexOf('{id}') < 0 || href.indexOf('test') >= 0) return;
  var id = document.location.href.split('/').pnlast().split('?')[0];
  var numid = parseInt(id, 10);
  if (id !== numid.toString()) throw new Error('Expected the last step in ' +
      'path to be a numerical ID for the back button');
  bb.href = href.replace(/\{id\}/, id);
};


/** @return {boolean} Return false to cancel this transition. */
pn.ctl.BaseController.prototype.showing = function() { return true; };


/** Called once this controller is shown */
pn.ctl.BaseController.prototype.shown = goog.nullFunction;


/** @return {boolean} Return false to cancel this transition. */
pn.ctl.BaseController.prototype.hiding = function() { return true; };


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
  if (goog.isFunction(arguments[1])) arguments[1] = arguments[1].pnbind(this);
  this.director_.showDialog.apply(this.director_, arguments);
};


/**
 * @protected
 * Goes through and validates that all 'required' elements have values.
 * @return {boolean} Wether the current arguments are valid (i.e. filled in).
 */
pn.ctl.BaseController.prototype.validateAllRequired = function() {
  var required = goog.dom.getElementsByClass('required', this.el);
  return this.validateRequired.apply(this, required);
};


/**
 * @protected
 * @param {...(string|Element)} var_args The ids to check for valid content.
 * @return {boolean} Wether the current arguments are valid (i.e. filled in).
 */
pn.ctl.BaseController.prototype.validateRequired = function(var_args) {
  if (!arguments.length) return true;
  var hasval = function(e) {
    var val = !!e.getValue ? e.getValue() : e.value;
    return !!val;
  };
  var getvalel = function(e) {
    if (!!e.getValue || e.hasAttribute('value') ||
        e instanceof HTMLInputElement ||
        e instanceof HTMLSelectElement ||
        e instanceof HTMLTextAreaElement) { return e; }
    return pn.toarr(e.children).pnfind(getvalel);
  };

  var orig = pn.toarr(arguments),
      origels = orig.pnmap(
          function(e) { return goog.isString(e) ? this.getel(e) : e;}, this),
      valels = origels.pnmap(getvalel),
      errors = [];
  valels.pnforEach(function(valel, i) {
    var el = origels[i];
    if (!el.id || !valel || hasval(valel) || !this.isshown(valel)) return;
    var name = valel.placeholder || valel.name || pn.toarr(el.children).
            pnfilter(function(e) { return e instanceof HTMLLabelElement; }).
            pnmap(function(l) { return l.innerHTML; })[0];
    if (!name) {
      throw new Error('Field: ' + valel.id +
          ' does not have a name, placeholder or label child.  This is' +
          ' required when using the BaseController validation helpers');
    }

    errors.push('<span class="error-message-field-name">' +
        name + '</span> is required.');
  }, this);
  if (errors.length) this.error(errors);
  return !errors.length;
};


/**
 * @param {string|Array.<string>} errors The error message or messages to
 *    display.
 */
pn.ctl.BaseController.prototype.error = function(errors) {
  pn.ass(goog.isString(errors) || goog.isArray(errors));
  if (goog.isString(errors)) { this.msg_.showError(errors); }
  else { this.msg_.showErrors(errors); }
};


/**
 * @protected
 * @param {string|Array.<string>} warning The error message or messages to
 *    display.
 */
pn.ctl.BaseController.prototype.warning = function(warning) {
  pn.ass(goog.isString(warning) || goog.isArray(warning));
  if (goog.isString(warning)) { this.msg_.showWarning(warning); }
  else { this.msg_.showWarnings(warning); }
};


/**
 * @protected
 * @param {string|Array.<string>} messages The message or messages to display.
 */
pn.ctl.BaseController.prototype.message = function(messages) {
  pn.ass(goog.isString(messages) || goog.isArray(messages));
  if (goog.isString(messages)) { this.msg_.showMessage(messages); }
  else { this.msg_.showMessages(messages); }
};

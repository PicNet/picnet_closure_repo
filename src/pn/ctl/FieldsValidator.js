;
goog.provide('pn.ctl.FieldsValidator');



/**
 * New field validation structure:
 *
 * + Every input field requires its matching error field, for instance:
 * <div id="page-datecontrol" type="datetime"></div>
 * <span style="display:none" class="field-message"
 *        id="page-datecontrol-message"></span>
 * + This is required on soy and spark even JS if creating DOM dynamic.
 *
 * + In the controller in shown method add all fields to be validated
 *    (which is usually all input fields) to the validator. The
 *    validator (this.validator) is created for you in BaseController.
 *
 * this.validator.add(['field-id-1', 'field-id-2'], this.validateField_);
 *
 * + Before submit of form, re validate all fields by calling:
 *
 * if (!this.validator.isvalid()) return; // Exit if not valid
 *
 * + The validateField_ method taskes a field ID and should return errors for
 *    that field:
 *        // private
 *        // param {string} field The specific field to validate.
 *        // return {{type:string,message:string}|string|null} Errors if any
 *        //    for the specified field.
 *
 * + Returns null for no error on specified field
 * + Return object {type: 'error', message: 'Error Message'} for all errors.
 *      Valid types are: 'message', 'warning', 'error'
 * + Shortcut for returning errors, return a string.
 *
 * + You can force the validator to validate a field.
 *
 *    this.validator.validate('field')
 *
 * + You can pass additional args to validate, these arguments will be passed
 *    to your validateField method.
 * + This enables multi-field validation
 *
 * @constructor
 * @param {!pn.ctl.BaseController} ctl The controller.
 * @extends {goog.Disposable}
 */
pn.ctl.FieldsValidator = function(ctl) {
  pn.assInst(ctl, pn.ctl.BaseController);

  goog.Disposable.call(this);

  /** @private @const @type {!pn.ctl.BaseController} */
  this.ctl_ = ctl;

  /** @private @type {!Object.<!function(string):
      (null|string|{message: string, type: string})>} */
  this.validators_ = {};
};
goog.inherits(pn.ctl.FieldsValidator, goog.Disposable);


/**
 * @param {string|Array.<string>} field The field(s) to add a validation
 *    listener to.  This field must have a corresponding id-message field
 *    used to display messages and warnings.
 * @param {!function(string):(null|string|{message: string, type: string})}
 *    validator A validator function that takes the field ID and returns an
 *    error object which can be null if no error or must contain a type and
 *    message.  The type is either (message, warning, error).
 */
pn.ctl.FieldsValidator.prototype.add = function(field, validator) {
  if (goog.isArray(field)) {
    field.pnforEach(function(f) { this.add(f, validator); }, this);
    return;
  }

  pn.ass(field);
  pn.assFun(validator);

  var fields = /** @type {string} */ (field),
      el = this.ctl_.getel(fields),
      mel = this.ctl_.getel(fields + '-message');
  if (!mel) throw new Error('FieldsValidator.add only supports fields with ' +
      'corresponding ID-message elements');
  pn.dom.show(mel, false);

  this.validators_[fields] = validator.pnbind(this.ctl_);
  this.ctl_.onchange(el, goog.bind(function() {
    var impl = this.validators_[fields];
    if (!impl) return;
    this.show_(fields, impl(fields));
  }, this));
};


/**
 * @param {string} field The field(s) to remove validation listener from.
 */
pn.ctl.FieldsValidator.prototype.remove = function(field) {
  pn.assStr(field);
  delete this.validators_[field];
};


/**
 * @param {string} field The field to validate
 * @param {...*} var_args Any other optional args to pass to the validator
 *    function.
 */
pn.ctl.FieldsValidator.prototype.validate = function(field, var_args) {
  this.show_(field, this.validators_[field].apply(this, arguments));
};


/** Clears all shown field error, warnings and messages */
pn.ctl.FieldsValidator.prototype.clearAll = function() {
  goog.object.getKeys(this.validators_).pnforEach(this.clear, this);
};


/** @param {string} field The field to clear and hide */
pn.ctl.FieldsValidator.prototype.clear = function(field) {
  this.show_(field, null);
};


/**
 * Validates all registered fields and returns wether there are no errors.
 * @param {boolean=} opt_show Wether to display the messages this defaults
 *    to true.
 * @return {boolean} Wether there are any errors being shown by any field.
 */
pn.ctl.FieldsValidator.prototype.isvalid = function(opt_show) {
  var all = this.all(opt_show);
  return !all.pnfind(function(msg) { return msg.type === 'error'; });
};


/**
 * Validates all registered fields.
 * @param {boolean=} opt_show Wether to display the messages this defaults
 *    to true.
 * @return {!Array.<{type:string,message:string}>} The errors on the current UI.
 */
pn.ctl.FieldsValidator.prototype.all = function(opt_show) {
  var errors = goog.object.getKeys(this.validators_).pnmap(function(field) {
    var msg = this.validators_[field](field);
    if (!msg) msg = null;
    if (goog.isString(msg)) msg = { type: 'error', message: msg };
    return { field: field, msg: msg };
  }, this).pnfilter(function(err) { return !!err.msg; });

  if (opt_show !== false) {
    goog.object.getKeys(this.validators_).pnforEach(this.clear, this);
    errors.pnforEach(function(err) { this.show_(err.field, err.msg); }, this);
  }
  return errors.pnmap(function(err) { return err.msg; });
};


/**
 * @private
 * @param {string} field The field to show.
 * @param {(null|string|{message: string, type: string})} msg The message to
 *    display on the field or null to hide.
 */
pn.ctl.FieldsValidator.prototype.show_ = function(field, msg) {
  var mel = this.ctl_.getel(field + '-message'),
      css = goog.dom.classes.enable,
      types = ['message', 'warning', 'error'];

  if (!!msg) {
    if (goog.isString(msg)) msg = {type: 'error', message: msg};
    pn.ass(types.pncontains(msg.type));
    pn.assStr(msg.message);
  }

  types.pnforEach(function(t) { css(mel, t, !!msg && t === msg.type); });
  mel.innerHTML = !!msg ? msg.message : '';
  pn.dom.show(mel, !!msg);
  if (!!msg) this.ctl_.showmsg(msg.type, msg.message);
};


/** @override */
pn.ctl.FieldsValidator.prototype.disposeInternal = function() {
  this.clearAll();
  delete this.validators_;

  pn.ctl.FieldsValidator.superClass_.disposeInternal.call(this);
};

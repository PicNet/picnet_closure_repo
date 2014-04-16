;
goog.provide('pn.ctl.FieldsValidator');



/**
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
      {type:string,message:string}|null>} */
  this.validators_ = {};
};


/**
 * @param {string} field The field to add a validation listener to.  This field
 *    must have a corresponding id-message field used to display messages
 *    and warnings.
 * @param {!function(string):{type:string,message:string}|null} validator A
 *    validator function that takes the field ID and returns an error object
 *    which can be null if no error or must contain a type and message.  The
 *    type is either (message, warning, error).
 */
pn.ctl.FieldsValidator.prototype.add = function(field, validator) {
  pn.assStr(field);
  pn.assFun(validator);

  var el = this.ctl_.getel(field),
      mel = this.ctl_.getel(field + '-message');
  if (!mel) throw new Error('FieldsValidator.add only supports fields with ' +
      'corresponding ID-message elements');

  this.validators_[field] = validator;
  this.ctl_.onchange(el, goog.bind(function() {
    this.show_(field, validator(field));
  }, this));
};


/** @param {string} field The field to clear and hide */
pn.ctl.FieldsValidator.prototype.clear = function(field) {
  this.show_(field, null);
};


/**
 * Validates all registered fields.
 * @param {boolean=} opt_show Wether to display the messages.
 * @return {!Array.<{type:string,message:string}>} The errors on the current UI.
 */
pn.ctl.FieldsValidator.prototype.all = function(opt_show) {
  var errors = goog.object.getKeys(this.validators_).pnmap(function(field) {
    var msg = this.validators_[field](field);
    return {field: field, msg: msg};
  }, this).pnfilter(function(err) { return !!err.msg; });
  if (opt_show === true) {
    errors.pnforEach(function(err) { this.show_(err.field, err.msg); }, this);
  }
  return errors.pnmap(function(err) { return err.msg; });
};


/**
 * @private
 * @param {string} field The field to show.
 * @param {{type:string,message:string}|null} msg The message to display on
 *    the field or null to hide.
 */
pn.ctl.FieldsValidator.prototype.show_ = function(field, msg) {
  var mel = this.ctl_.getel(field + '-message'),
      css = goog.dom.classes.enable,
      types = ['message', 'warning', 'error'];
  pn.ass(!msg || (types.pncontains(msg.type) && goog.isString(msg.message)));

  types.pnforEach(function(t) { css(mel, t, !!msg && t === msg.type); });
  mel.innerHTML = !!msg ? msg.message : '';
  pn.dom.show(mel, !!msg);
  if (!!msg) this.ctl_.showmsg(msg.type, msg.message);
};


/** @override */
pn.ctl.FieldsValidator.prototype.disposeInternal = function() {
  pn.ctl.FieldsValidator.superClass_.disposeInternal.call(this);

  delete this.validators_;
};

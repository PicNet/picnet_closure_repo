
goog.provide('pn.ui.InputDatePicker');

goog.require('goog.array');
goog.require('goog.date.Date');
goog.require('goog.dom');
goog.require('goog.events.Event');
goog.require('goog.events.EventType');
goog.require('goog.i18n.DateTimeFormat');
goog.require('goog.ui.Component');
goog.require('goog.ui.DatePicker');
goog.require('goog.ui.DatePicker.Events');
goog.require('goog.ui.InputDatePicker');
goog.require('goog.ui.LabelInput');



/**
 * @param {goog.i18n.DateTimeFormat=} opt_dtf A formatter instance
 *     used to format the date picker's date for display in the input element.
 * @param {goog.i18n.DateTimeParse=} opt_dtp A parser instance used
 *     to parse the input element's string as a date to set the picker.
 * @param {string=} opt_label Optional text to show as the label.
 * @extends {goog.ui.Component}
 * @constructor
 */
pn.ui.InputDatePicker = function(opt_dtf, opt_dtp, opt_label) {
  goog.ui.Component.call(this);

  /**
   * The text to show as the label.
   * @type {string}
   * @private
   */
  this.label_ = opt_label || '';

  /**
   * @type {goog.i18n.DateTimeFormat}
   * @private
   */
  this.dateTimeFormatter_ = opt_dtf || pn.date.dateFormat;

  /**
   * @type {goog.i18n.DateTimeParse}
   * @private
   */
  this.dateTimeParser_ = opt_dtp || pn.date.dateParser;

  /**
   * @type {goog.ui.LabelInput}
   * @private
   */
  this.fieldLabelInput_ = new goog.ui.LabelInput(this.label_);
  this.registerDisposable(this.fieldLabelInput_);

  /**
  * @type {goog.ui.InputDatePicker}
  * @private
  */
  this.idp_ = new goog.ui.InputDatePicker(
      this.dateTimeFormatter_, this.dateTimeParser_);
  this.registerDisposable(this.idp_);
};
goog.inherits(pn.ui.InputDatePicker, goog.ui.Component);


/** @param {goog.date.Date?} date The date to set in the control. */
pn.ui.InputDatePicker.prototype.setDate = function(date) {
  this.idp_.setDate(date);
};


/**
* Returns the selected date, if any.  Compares the dates from the date picker
* and the input field, causing them to be synced if different.
* @return {number} The selected date in millis.
*/
pn.ui.InputDatePicker.prototype.getValue = function() {
  var d = this.idp_.getDate();
  if (d) d = new goog.date.Date(d.getYear(), d.getMonth(), d.getDate());
  return d ? d.getTime() : 0;
};


/** @return {goog.ui.LabelInput} The label input control. */
pn.ui.InputDatePicker.prototype.getInput = function() {
  return this.fieldLabelInput_;
};


/** @inheritDoc */
pn.ui.InputDatePicker.prototype.decorateInternal = function(element) {
  this.setElementInternal(element);

  this.fieldLabelInput_.render(element);

  this.idp_.getDatePicker().setShowWeekNum(false);
  this.idp_.decorate(this.fieldLabelInput_.getElement());
};


/** @inheritDoc */
pn.ui.InputDatePicker.prototype.enterDocument = function() {
  pn.ui.InputDatePicker.superClass_.enterDocument.call(this);

  this.getHandler().listen(this.idp_,
      goog.ui.DatePicker.Events.CHANGE, this.onDateChanged_);

  this.getHandler().listen(this.fieldLabelInput_.getElement(),
      goog.events.EventType.CHANGE, this.onDateChanged_);
};


/**
 * @private
 * Called when the date is changed.
 */
pn.ui.InputDatePicker.prototype.onDateChanged_ = function() {
  var event = new goog.events.Event(goog.events.EventType.CHANGE, this);
  this.dispatchEvent(event);
};

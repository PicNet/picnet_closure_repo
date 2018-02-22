
goog.provide('pn.ui.DateRangePicker');

goog.require('goog.array');
goog.require('goog.date.Date');
goog.require('goog.dom');
goog.require('goog.dom.DomHelper');
goog.require('goog.events.Event');
goog.require('goog.events.EventType');
goog.require('goog.i18n.DateTimeFormat');
goog.require('goog.positioning.AnchoredPosition');
goog.require('goog.positioning.Corner');
goog.require('goog.style');
goog.require('goog.ui.Component');
goog.require('goog.ui.DatePicker');
goog.require('goog.ui.DatePicker.Events');
goog.require('goog.ui.Popup');
goog.require('goog.ui.PopupBase.EventType');



/**
 * @param {goog.ui.DatePicker=} opt_datePickerFrom Optional DatePicker.  This
 *     enables the use of a custom date-picker instance.
 * @param {goog.ui.DatePicker=} opt_datePickerTo Optional DatePicker.  This
 *     enables the use of a custom date-picker instance.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @param {goog.i18n.DateTimeFormat=} opt_dateFormat Optional date time format
 *    object used to format dates in the range label.
 * @extends {goog.ui.Component}
 * @constructor
 */
pn.ui.DateRangePicker = function(opt_datePickerFrom, opt_datePickerTo, 
    opt_domHelper, opt_dateFormat) {
  goog.ui.Component.call(this, opt_domHelper);

  /**
   * The text to display on the label when no dates are selected.
   * @private
   * @type {string}
   */
  this.emptyText_ = 'Select Date Range';

  /**
   * Wether to display the from and to labels on top of the date pickers.
   * @private
   * @type {boolean}
   */
  this.showFromAndToLabels_ = false;

  /**
   * Instance of goog.ui.Popup used to manage the behavior of the date picker.
   * @private
   * @type {goog.ui.Popup}
   */
  this.popup_ = null;

  /**
   * @private
   * @type {Element}
   */
  this.lastTarget_ = null;

  /**
   * @private
   * @type {Element}
   */
  this.label_;

  /**
   * @private
   * @type {Element}
   */
  this.popupButton_;

  /**
   * @private
   * @type {Element}
   */
  this.clearRangeButton_;

  /**
   * @private
   * @type {Element}
   */
  this.popupConent_;

  /**
   * Instance of a date picker control.
   * @private
   * @type {goog.ui.DatePicker}
   */
  this.datePickerFrom_ = opt_datePickerFrom || new goog.ui.DatePicker();
  this.datePickerFrom_.setDate(null);
  this.registerDisposable(this.datePickerFrom_);

  /**
   * Instance of a date picker control.
   * @private
   * @type {goog.ui.DatePicker}
   */
  this.datePickerTo_ = opt_datePickerTo || new goog.ui.DatePicker();
  this.datePickerTo_.setDate(null);
  this.registerDisposable(this.datePickerTo_);

  /**
   * The date format to use on the range label
   * @private
   * @type {goog.i18n.DateTimeFormat|undefined}
   */
  this.dateFormat_ = opt_dateFormat;
};
goog.inherits(pn.ui.DateRangePicker, goog.ui.Component);


/**
 * Sets the first day of week
 *
 * @param {number} wday Week day, 0 = Monday, 6 = Sunday.
 */
pn.ui.DateRangePicker.prototype.setFirstWeekday = function(wday) {
  this.datePickerFrom_.setFirstWeekday(wday);
  this.datePickerTo_.setFirstWeekday(wday);
};


/** @override */
pn.ui.DateRangePicker.prototype.createDom = function() {
  pn.ui.DateRangePicker.superClass_.createDom.call(this);
  this.getElement().className = goog.getCssName('picnet-daterangepicker');
};


/** @override */
pn.ui.DateRangePicker.prototype.enterDocument = function() {
  pn.ui.DateRangePicker.superClass_.enterDocument.call(this);

  var el = this.getElement();

  this.label_ = goog.dom.createDom('div',
      goog.getCssName('picnet-daterangepicker-label'), 'Select Date Range');
  goog.dom.appendChild(el, this.label_);

  this.popupButton_ = goog.dom.createDom('div',
      goog.getCssName('picnet-daterangepicker-button'), 'V');
  goog.dom.appendChild(el, this.popupButton_);

  this.clearRangeButton_ = goog.dom.createDom('div',
      goog.getCssName('picnet-daterangepicker-clearbutton'), 'X');
  goog.dom.appendChild(el, this.clearRangeButton_);

  goog.dom.appendChild(el, goog.dom.createDom('br'));

  this.popupConent_ = goog.dom.createDom('div');
  goog.dom.appendChild(el, this.popupConent_);

  this.popup_ = new goog.ui.Popup(this.popupConent_);
  pn.dom.show(this.popupConent_, false);
  this.registerDisposable(this.popup_);

  var fromContainer = goog.dom.createDom('div',
      goog.getCssName('picnet-daterangepicker-fromto-cont'));
  goog.dom.appendChild(this.popupConent_, fromContainer);
  var fromLabel = goog.dom.createDom('div',
      goog.getCssName('picnet-daterangepicker-fromto-label'),
      'From:');
  goog.dom.appendChild(fromContainer, fromLabel);
  this.datePickerFrom_.decorate(fromContainer);

  var toContainer = goog.dom.createDom('div',
      goog.getCssName('picnet-daterangepicker-fromto-cont'));
  goog.dom.appendChild(this.popupConent_, toContainer);
  var toLabel = goog.dom.createDom('div',
      goog.getCssName('picnet-daterangepicker-fromto-label'), 'To:');
  goog.dom.appendChild(toContainer, toLabel);
  this.datePickerTo_.decorate(toContainer);

  this.getHandler().listen(this.clearRangeButton_,
      goog.events.EventType.MOUSEDOWN, this.clearRange_);
  this.getHandler().listen(this.popupButton_,
      goog.events.EventType.MOUSEDOWN, this.showPopup_);
  this.getHandler().listen(this.label_,
      goog.events.EventType.MOUSEDOWN, this.showPopup_);
  this.listenToPickers(true);
  this.showHideFromToLabels_();
};


/**
 * @param {boolean} listen Wether to listen or unlisten to the date pickers
 *    change event.
 */
pn.ui.DateRangePicker.prototype.listenToPickers = function(listen) {
  if (listen) {
    this.getHandler().listen(this.datePickerFrom_,
        goog.ui.DatePicker.Events.CHANGE, this.onDateChanged_);
    this.getHandler().listen(this.datePickerTo_,
        goog.ui.DatePicker.Events.CHANGE, this.onDateChanged_);
  } else {
    this.getHandler().unlisten(this.datePickerFrom_,
        goog.ui.DatePicker.Events.CHANGE, this.onDateChanged_);
    this.getHandler().unlisten(this.datePickerTo_,
        goog.ui.DatePicker.Events.CHANGE, this.onDateChanged_);
  }
};


/**
 * @private
 * Hides or shows the from and to labels depending on the current value of
 * the showFromAndToLabels_ member.
 */
pn.ui.DateRangePicker.prototype.showHideFromToLabels_ = function() {
  var visible = this.showFromAndToLabels_;
  var divs = pn.toarr(goog.dom.getElementsByTagNameAndClass('div',
      goog.getCssName('picnet-daterangepicker-fromto-label')));
  divs.pnforEach(function(d) { pn.dom.show(d, visible); });
};


/** @override */
pn.ui.DateRangePicker.prototype.canDecorate = function(element) {
  return false;
};


/**
 * @return {goog.ui.DatePicker} The date picker instance.
 */
pn.ui.DateRangePicker.prototype.getDatePickerFrom = function() {
  return this.datePickerFrom_;
};


/**
 * @return {goog.ui.DatePicker} The date picker instance.
 */
pn.ui.DateRangePicker.prototype.getDatePickerTo = function() {
  return this.datePickerTo_;
};


/**
 * @return {string} The text displayed when no dates are selected.
 */
pn.ui.DateRangePicker.prototype.getEmptyText = function() {
  return this.emptyText_;
};


/**
 * Sets the text displayed when no dates are selected.
 * @param {string} emptyText The text to display when there is no date range
 *     selected.
 */
pn.ui.DateRangePicker.prototype.setEmptyText = function(emptyText) {
  this.emptyText_ = emptyText;
  if (this.label_) goog.dom.setTextContent(this.label_, this.emptyText_);
};


/**
 * @return {boolean} Wether we are displaying from and to labels on top
 *    of the date pickers.
 */
pn.ui.DateRangePicker.prototype.getShowFromAndToLabels = function() {
  return this.showFromAndToLabels_;
};


/**
 * Sets the text displayed when no dates are selected.
 * @param {boolean} showFromAndToLabels If we should display the from and to
 *    labels on top of the date pickers.
 */
pn.ui.DateRangePicker.prototype.setShowFromAndToLabels =
    function(showFromAndToLabels) {
  this.showFromAndToLabels_ = showFromAndToLabels;
  this.showHideFromToLabels_();
};


/**
 * @return {goog.date.Date} The selected date range start.
 */
pn.ui.DateRangePicker.prototype.getDateRangeFrom = function() {
  return this.datePickerFrom_.getDate();
};


/**
 * @return {goog.date.Date} The selected date range end.
 */
pn.ui.DateRangePicker.prototype.getDateRangeTo = function() {
  return this.datePickerTo_.getDate();
};


/**
 * Sets the selected date range.
 * @param {goog.date.Date|Date} from The date range from date to select.
 * @param {goog.date.Date|Date} to The date range to date to select.
 */
pn.ui.DateRangePicker.prototype.setDateRange = function(from, to) {
  this.datePickerFrom_.setDate(from);
  this.datePickerTo_.setDate(to);
};


/**
 * @return {Element} The last element that triggered the popup.
 */
pn.ui.DateRangePicker.prototype.getLastTarget = function() {
  return this.lastTarget_;
};


/**
 * Detatches the popup date picker from an element.
 * @param {Element} element The element to detach from.
 */
pn.ui.DateRangePicker.prototype.detach = function(element) {
  this.getHandler().unlisten(element, goog.events.EventType.MOUSEDOWN,
                             this.showPopup_);
};


/**
 * Show the popup at the bottom-left corner of the specified element.
 * @param {Element} element Reference element for displaying the popup -- popup
 *     will appear at the bottom-left corner of this element.
 */
pn.ui.DateRangePicker.prototype.showPopup = function(element) {
  this.lastTarget_ = element;
  this.popup_.setPosition(new goog.positioning.AnchoredPosition(
      element, goog.positioning.Corner.BOTTOM_START));

  this.dispatchEvent(goog.ui.PopupBase.EventType.SHOW);
  this.popup_.setVisible(true);
};


/**
 * Handles click events on the targets and shows the date picker.
 * @private
 * @param {goog.events.Event} event The click event.
 */
pn.ui.DateRangePicker.prototype.showPopup_ = function(event) {
  this.showPopup(/** @type {Element} */ (event.currentTarget));
};


/**
 * Hides this popup.
 */
pn.ui.DateRangePicker.prototype.hidePopup = function() {
  this.popup_.setVisible(false);

  if (this.lastTarget_) {
    this.lastTarget_.focus();
  }
};


/** @private */
pn.ui.DateRangePicker.prototype.clearRange_ = function() {
  this.listenToPickers(false);   // Ignore the individual change events
  this.datePickerFrom_.setDate(null);
  this.datePickerTo_.setDate(null);
  this.listenToPickers(true);

  this.onDateChanged_(new goog.events.Event(goog.events.EventType.CHANGE));
  this.hidePopup();
};


/**
 * Called when the date is changed.
 *
 * @private
 * @param {goog.events.Event} event The date change event.
 */
pn.ui.DateRangePicker.prototype.onDateChanged_ = function(event) {
  var from = this.datePickerFrom_.getDate();
  var to = this.datePickerTo_.getDate();
  if (from && to && from > to) {
    event.target.setDate(null);
    return;
  } // Ignore invalid ranges

  this.setLabelText_(from, to);
  this.highlightDateRange_(from, to);

  if (from && to && this.datePickerTo_ === event.target) this.hidePopup();
  event.rangeFrom = from;
  event.rangeTo = to;
  this.dispatchEvent(event);
};


/**
 * @private
 * @param {goog.date.Date} from The from date (start of the range). Can
 *    be null.
 * @param {goog.date.Date} to The to date (end of the range). Can be null.
 */
pn.ui.DateRangePicker.prototype.setLabelText_ = function(from, to) {
  var tos, froms;
  if (this.dateFormat_) {
    froms = from ? this.dateFormat_.format(from) : '';
    tos = to ? this.dateFormat_.format(to) : '';
  } else {
    froms = from ? from.toIsoString(true) : '';
    tos = to ? to.toIsoString(true) : '';
  }
  if (froms && tos) {
    goog.dom.setTextContent(this.label_, froms + ' - ' + tos); }
  else if (froms) { goog.dom.setTextContent(this.label_, 'after ' + froms); }
  else if (tos) { goog.dom.setTextContent(this.label_, 'before ' + tos); }
  else { goog.dom.setTextContent(this.label_, 'Select Date Range'); }
};


/**
 * @private
 * @param {goog.date.Date} from The from date (start of the range). Can
 *    be null.
 * @param {goog.date.Date} to The to date (end of the range). Can be null.
 */
pn.ui.DateRangePicker.prototype.highlightDateRange_ = function(from, to) {
  this.highlightDateRangeImpl_(from, to, this.datePickerFrom_);
  this.highlightDateRangeImpl_(from, to, this.datePickerTo_);
};


/**
 * @private
 * @param {goog.date.Date} from The from date (start of the range). Can
 *    be null.
 * @param {goog.date.Date} to The to date (end of the range). Can be null.
 * @param {goog.ui.DatePicker} picker the DatePicker to highlight dates in.
 */
pn.ui.DateRangePicker.prototype.highlightDateRangeImpl_ = function(from, to,
    picker) {
  picker.grid_.pnforEach(function(dates, y) {
    dates.pnforEach(function(date, x) {
      var el = picker.elTable_[y + 1][x + 1];
      var enabled = !!(from || to) &&
          !!(!from || date > from) &&
          !!(!to || date < to);
      if (from && date.equals(from) && picker === this.datePickerTo_)
        enabled = true;
      if (to && date.equals(to) && picker === this.datePickerFrom_)
        enabled = true;
      goog.dom.classlist.enable(el, goog.getCssName('picnet-datehighlighted'),
          enabled);
    }, this);
  }, this);
};

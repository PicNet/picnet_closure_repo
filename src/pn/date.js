
goog.require('goog.i18n.DateTimeFormat');
goog.require('goog.i18n.DateTimeParse');

goog.provide('pn.date');


/**
 * @private
 * @type {string}
 */
pn.date.datePattern_ = "dd'/'MMM'/'yyyy";


/**
 * @private
 * @type {string}
 */
pn.date.dateTimePattern_ = "dd'/'MMM'/'yyyy hh:mm aa";


/** @type {!goog.i18n.DateTimeFormat} */
pn.date.dateFormat = new goog.i18n.DateTimeFormat(pn.date.datePattern_);


/** @type {!goog.i18n.DateTimeFormat} */
pn.date.dateTimeFormat = new goog.i18n.DateTimeFormat(pn.date.dateTimePattern_);


/** @type {!goog.i18n.DateTimeParse} */
pn.date.dateParser = new goog.i18n.DateTimeParse(pn.date.datePattern_);

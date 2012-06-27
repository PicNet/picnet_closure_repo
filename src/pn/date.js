
goog.require('goog.date.Date');
goog.require('goog.i18n.DateTimeFormat');
goog.require('goog.i18n.DateTimeParse');

goog.provide('pn.date');


/**
 * @private
 * @type {string}
 */
pn.date.datePattern_ = "dd'/'MMM'/'yyyy";


/** @type {!goog.i18n.DateTimeFormat} */
pn.date.dateFormat = new goog.i18n.DateTimeFormat(pn.date.datePattern_);


/** @type {!goog.i18n.DateTimeFormat} */
pn.date.dateTimeFormat =
    new goog.i18n.DateTimeFormat("dd'/'MMM'/'yyyy hh:mm aa");


/** @type {!goog.i18n.DateTimeFormat} */
pn.date.longDateFormat = new goog.i18n.DateTimeFormat("EEEE dd'/'MMM'/'yyyy");


/** @type {!goog.i18n.DateTimeParse} */
pn.date.dateParser = new goog.i18n.DateTimeParse(pn.date.datePattern_);


/**
 * @param {!goog.date.Date} date The date to check, if its a weekday (MON-FRI).
 * @return {boolean} Wether the specified date is a weekday.
 */
pn.date.isWeekday = function(date) {
  goog.asserts.assert(date);

  var day = date.getIsoWeekday();
  return day !== goog.date.weekDay.SAT && day !== goog.date.weekDay.SUN;
};


/**
 * @param {!goog.date.Date} date The date to check, if its a weekend (SAT, SUN).
 * @return {boolean} Wether the specified date is a weekend.
 */
pn.date.isWeekend = function(date) {
  return !pn.date.isWeekday(date);
};


/**
 * @param {!goog.date.Date} date The date to check, if its today.
 * @return {boolean} Wether the specified date is today.
 */
pn.date.isToday = function(date) {
  goog.asserts.assert(date);

  return goog.date.isSameDay(date);
};


/**
 * @param {!goog.date.Date} date The date to check, if its in the future.
 * @return {boolean} Wether the specified date is in the future.
 */
pn.date.isFuture = function(date) {
  goog.asserts.assert(date);

  var now = new Date(goog.now());
  if (goog.date.isSameDay(date, now)) return false;
  return goog.date.Date.compare(date, now) > 0;
};


/**
 * @param {!goog.date.Date} date The date to check, if its in the past.
 * @return {boolean} Wether the specified date is in the past.
 */
pn.date.isPast = function(date) {
  goog.asserts.assert(date);

  var now = new Date(goog.now());
  if (goog.date.isSameDay(date, now)) return false;
  return goog.date.Date.compare(date, now) < 0;
};


/**
 * @param {number} millis The number of milliseconds from 1970.
 * @return {goog.date.Date} The goog.Date from the specified millis.
 */
pn.date.fromMillis = function(millis) {
  var date = new goog.date.Date();
  date.setTime(millis);
  return date.getYear() <= 1753 ? null : date;
};


/**
 * @param {Date} d The JS Date object.
 * @return {!goog.date.Date} The goog.Date from the specified Date.
 */
pn.date.fromDate = function(d) {
  var date = new goog.date.Date();
  date.setTime(d.getTime());
  return date;
};

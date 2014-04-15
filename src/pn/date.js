
goog.require('goog.date.Date');
goog.require('goog.date.DateTime');
goog.require('goog.i18n.DateTimeFormat');
goog.require('goog.i18n.DateTimeParse');
goog.require('pn');

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


/** Disposed all static instances of formatters and parsers */
pn.date.dispose = function() {
  goog.dispose(pn.date.dateFormat);
  goog.dispose(pn.date.dateTimeFormat);
  goog.dispose(pn.date.longDateFormat);
  goog.dispose(pn.date.dateParser);

  delete pn.date.dateFormat;
  delete pn.date.dateTimeFormat;
  delete pn.date.longDateFormat;
  delete pn.date.dateParser;
};


/**
 * @param {!goog.date.Date} date The date to check, if its a
 *    weekday (MON-FRI).
 * @return {boolean} Wether the specified date is a weekday.
 */
pn.date.isWeekday = function(date) {
  pn.ass(date);

  var day = date.getIsoWeekday();
  return day !== goog.date.weekDay.SAT && day !== goog.date.weekDay.SUN;
};


/**
 * @param {!goog.date.Date} date The date to check, if its a
 *    weekend (SAT, SUN).
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
  pn.ass(date);

  return goog.date.isSameDay(date);
};


/**
 * @param {!goog.date.Date} date The date to check, if its in the future.
 * @return {boolean} Wether the specified date is in the future.
 */
pn.date.isFuture = function(date) {
  pn.ass(date);

  var now = new Date(goog.now());
  if (goog.date.isSameDay(date, now)) return false;
  return goog.date.Date.compare(date, now) > 0;
};


/**
 * @param {!goog.date.Date} date The date to check, if its in the past.
 * @return {boolean} Wether the specified date is in the past.
 */
pn.date.isPast = function(date) {
  pn.ass(date);

  var now = new Date(goog.now());
  if (goog.date.isSameDay(date, now)) return false;
  return goog.date.Date.compare(date, now) < 0;
};


/**
 * @param {!number} millis The date to reset
 * @return {?goog.date.DateTime} A new utc date time.
 */
pn.date.fromUtcMillis = function(millis) {

  if (!goog.isDefAndNotNull(millis) || millis <= 0) return null;

  var datetime = new goog.date.DateTime(new Date(millis)),
      year = datetime.getUTCFullYear(),
      month = datetime.getUTCMonth(),
      day = datetime.getUTCDate(),
      hours = datetime.getUTCHours(),
      mins = datetime.getUTCMinutes();

  return isNaN(year) || year <= 1970 ?
      null : new goog.date.DateTime(year, month, day, hours, mins);
};


/**
 * @param {number} millis The number of milliseconds from 1970.
 * @return {goog.date.DateTime} The goog.Date from the specified millis.
 */
pn.date.fromMillis = function(millis) {
  var date = new goog.date.DateTime();
  date.setTime(millis);
  var year = date.getYear();
  return isNaN(year) || year <= 1970 ? null : date;
};


/**
 * @param {Date} d The JS Date object.
 * @return {!goog.date.DateTime} The goog.Date from the specified Date.
 */
pn.date.fromDate = function(d) {
  var date = new goog.date.DateTime();
  date.setTime(d.getTime());
  return date;
};

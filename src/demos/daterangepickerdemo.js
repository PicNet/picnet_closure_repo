
goog.provide('picnet.demo.daterangepickerdemo');

goog.require('picnet.ui.DateRangePicker');

/**
 * @export
 */
picnet.demo.daterangepickerdemo = function() {
  var drp = new picnet.ui.DateRangePicker();
  drp.setFirstWeekday(0);
  var now = new Date();
  var from = new Date();
  from.setDate(now.getDate() - 10);
  var to = new Date();
  to.setDate(now.getDate() + 10);
  drp.setAllowedDateRange(from, to);
  drp.render(document.getElementById('range_picker'));

  goog.events.listen(drp, 'change', updateLog);
  updateLog();

  function updateLog() {
    var desc = 'Event Received[' + new Date().getTime() + '] ';
    var from = drp.getDateRangeFrom();
    var to = drp.getDateRangeTo();

    desc += 'Start[' + (from ? from.toIsoString(true) : 'n/a') +
        '] End[' + (to ? to.toIsoString(true) : 'n/a') + ']';
    goog.dom.setTextContent(document.getElementById('picker_log'), desc);
  };
};
goog.exportSymbol('picnet.demo.daterangepickerdemo',
    picnet.demo.daterangepickerdemo);

goog.require('goog.array');
goog.require('pn.ui.filter.TableFilter');
goog.require('pn.ui.filter.TableFilterOptions');

goog.provide('pn.ui.filter.jQueryPlugin');

// This is the only public method.  Initialised like:
// $(#tableid).tableFilter(options)
var jq = window['jQuery'];
if (jq) { (function(jq) {
  /** @constructor */
  jq.tableFilter = function(element, opts) {
    var tf;
    var plugin = this;

    plugin.init = function() {
      var tfo = new pn.ui.filter.TableFilterOptions();
      var options = jq['extend']({}, tfo, opts);
      tf = new pn.ui.filter.TableFilter(element, options);
    };

    plugin.refresh = function() {
      pn.ui.filter.TableFilter.superClass_.refresh.call(tf);
    };

    plugin.reset = function(list) {
      pn.ui.filter.TableFilter.superClass_.resetList.call(tf, list);
    };

    plugin.clearFilters = function() {
      pn.ui.filter.TableFilter.superClass_.clearAllFilters.call(tf);
    };

    plugin.init();

  };

  jq['fn']['tableFilter'] = function(options) {
    var tmp = pn.toarr(this).pnforEach(function(t) {
      if (undefined === jq(t).data('tableFilter') ||
          jq(t).data('tableFilter') === null) {
        var plugin = new jq.tableFilter(t, options);
        jq(t).data('tableFilter', plugin);
      }
    });
    return tmp;
  };

  jq['fn']['tableFilterApplyFilterValues'] = function() {
    var tmp = pn.toarr(this).pnforEach(function(t) {
      if (undefined !== jq(t).data('tableFilter') &&
          jq(t).data('tableFilter') !== null) {
        var plugin = jq(t).data('tableFilter');
        plugin.refresh();
      }
    });
    return tmp;
  };

  jq['fn']['tableFilterRefresh'] = function() {
    var tmp = pn.toarr(this).pnforEach(function(t) {
      if (undefined !== jq(t).data('tableFilter') &&
          jq(t).data('tableFilter') !== null) {
        var plugin = jq(t).data('tableFilter');
        plugin.reset(t);
      }
    });
    return tmp;
  };

  jq['fn']['tableFilterClearFilters'] = function() {
    var tmp = pn.toarr(this).pnforEach(function(t) {
      if (undefined !== jq(t).data('tableFilter') &&
          jq(t).data('tableFilter') !== null) {
        var plugin = jq(t).data('tableFilter');
        plugin.clearFilters(t);
      }
    });
    return tmp;
  };
})(jq); }

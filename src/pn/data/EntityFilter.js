;
goog.provide('pn.data.EntityFilter');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('pn');
goog.require('pn.convert');
goog.require('pn.ui.filter.SearchEngine');



/**
 * @constructor
 * @extends {goog.Disposable}
 * @param {!pn.data.BaseDalCache} cache The data cache to use for related
 *    entities.
 * @param {!pn.ui.UiSpec} spec The spec being filtered.
 */
pn.data.EntityFilter = function(cache, spec) {
  goog.Disposable.call(this);

  /**
   * @private
   * @type {!pn.data.BaseDalCache}
   */
  this.cache_ = cache;

  /**
   * @private
   * @type {!pn.ui.UiSpec}
   */
  this.spec_ = spec;

  /**
   * @private
   * @type {!pn.ui.srch.Config}
   */
  this.cfg_ = this.spec_.getSearchConfig(cache);

  /**
   * @private
   * @type {!pn.ui.filter.SearchEngine}
   */
  this.search_ = new pn.ui.filter.SearchEngine();

  /**
   * @private
   * @const
   * @type {boolean}
   */
  this.debug_ = false;

  /**
   * @private
   * @type {goog.debug.Logger}
   */
  this.log_ = pn.log.getLogger('EntityFilter');
};
goog.inherits(pn.data.EntityFilter, goog.Disposable);


/**
 * @param {!pn.data.Entity} entity The entity to filter with the specified
 *    filters.
 * @param {!Object.<string>} filters The filters to use to filter the list by.
 * @return {boolean} Wether the specified entity meets the specified filters.
 */
pn.data.EntityFilter.prototype.filterEntity = function(entity, filters) {
  pn.ass(entity);
  pn.ass(filters);

  this.dbg_('filterEntity: ', filters);
  for (var filterId in filters) {
    var fv = filters[filterId];
    if (!goog.isDefAndNotNull(fv)) continue;
    if (!goog.isArray(fv)) fv = fv.toString().toLowerCase();
    if (!this.filterEntityImpl_(fv, entity, filterId)) {
      return false;
    }
  }
  return true;
};


/**
 * @private
 * @param {Array.<string>|string} filterValue The filter value to apply to
 *    the given entity. All filter values wether in array or a string MUST be
 *    lowercase.
 * @param {pn.data.Entity} entity The entity to test for match.
 * @param {string} fieldId The filter/field id.
 * @return {boolean} Wether the specified entity meets the
 *    specified filterValue.
 */
pn.data.EntityFilter.prototype.filterEntityImpl_ =
    function(filterValue, entity, fieldId) {
  pn.ass(goog.isDefAndNotNull(filterValue));
  if (!goog.isDefAndNotNull(entity)) return false;
  if (filterValue === '0') return true;

  var entityType = this.spec_.type;
  var res = fieldId.indexOf('.') > 0 ? pn.data.EntityUtils.getTargetEntity(
      this.cache_, fieldId, entityType, entity)[0] : entity[fieldId];
  if (!res) return false;
  res = res.id ? res.id : res;
  return this.matchesFilter_(res, filterValue, fieldId);
};


/**
 * @private
 * @param {*} entityValue The value of the current entity(s) in the final step.
 * @param {string|Array.<string>} filterValue The filter value.
 * @param {string} fieldId The filter/field id.
 * @return {boolean} Wether the current entity matches the specified filter.
 */
pn.data.EntityFilter.prototype.matchesFilter_ =
    function(entityValue, filterValue, fieldId) {
  if (!goog.isDefAndNotNull(entityValue)) {
    this.dbg_('matchesFilter_ null entity value');
    return false;
  }
  this.dbg_('matchesFilter_: ', arguments);
  var FieldRenderers = pn.ui.edit.FieldRenderers;

  var matcher = function(ev, fv, exact) {
    this.dbg_('matchesFilter_.matcher: ', arguments);
    if (ev.id) return ev.id.toString() === fv;

    var fctx = this.cfg_.fCtxs.pnfind(
        function(fctx1) { return fctx1.id === fieldId; });
    var renderer = fctx.spec.renderer;
    if (renderer === FieldRenderers.dateRenderer) {
      var min = parseInt(filterValue, 10);
      var max = min + (24 * 60 * 60 * 1000);
      return min <= ev && ev < max;
    } else if (renderer === FieldRenderers.centsRenderer) {
      ev = pn.convert.centsToCurrency(ev);
    }
    var evald = ev.toString().toLowerCase();
    var result = exact ? evald === fv : this.search_.matches(evald, fv);

    this.dbg_('matchesFilter_.matcher result: ', result, ' eval: ', evald,
        ' exact: ', exact, ' fv: ', fv);
    return result;
  };


  if (goog.isArray(entityValue)) {
    return entityValue.pnfindIndex(function(entity) {
      return this.singleEntityMatches_(filterValue, entity, matcher);
    }, this) >= 0;
  } else {
    return this.singleEntityMatches_(filterValue, entityValue, matcher);
  }
};


/**
 * @private
 * @param {string|Array.<string>} filterVal The filter value.
 * @param {*} entityVal The value of the current entity(s) in the final step.
 * @param {function(*,string,boolean):boolean} predicate The matching
 *    predicate which takes the single entity value, single filter value and
 *    wether an exact match is required.
 * @return {boolean} Wether the current entity matches the specified filter.
 */
pn.data.EntityFilter.prototype.singleEntityMatches_ =
    function(filterVal, entityVal, predicate) {
  if (!goog.isDefAndNotNull(entityVal)) return false;
  this.dbg_('singleEntityMatches_: ', arguments);

  if (goog.isArray(filterVal)) {
    return filterVal.pnfindIndex(function(fv) {
      return this.singleFilterValueMatches_(fv, entityVal, true, predicate);
    }, this) >= 0;
  } else {
    return this.singleFilterValueMatches_(
        /** @type {string} */ (filterVal), entityVal, false, predicate);
  }
};


/**
 * @private
 * @param {string} filterVal The filter value.
 * @param {*} entityVal The value of the current entity(s) in the final step.
 * @param {boolean} exact Wether the match has to be exact.
 * @param {function(*, string, boolean):boolean} predicate The matching
 *    predicate which takes the single entity value, single filter value and
 *    wether an exact match is required.
 * @return {boolean} Wether the current entity matches the specified filter.
 */
pn.data.EntityFilter.prototype.singleFilterValueMatches_ =
    function(filterVal, entityVal, exact, predicate) {
  if (!goog.isDefAndNotNull(entityVal)) return false;
  this.dbg_('singleFilterValueMatches_: ', arguments);

  if (!filterVal || filterVal === '0') return true;
  return predicate.call(this, entityVal, filterVal, exact);
};


/**
 * @private
 * @param {...*} args Any additional arguments to append to the message.
 */
pn.data.EntityFilter.prototype.dbg_ = function(args) {
  if (!this.debug_) return;
  var format = function(arg) {
    if (!goog.isString(arg) && arg && arg.length) {
      return '[' + arg.pnmap(format).join(',') + ']';
    } else if (goog.isObject(arg)) { return goog.debug.expose(arg); }
    else return arg;
  };

  this.log_.finest(pn.toarr(arguments).pnmap(format).join(''));
};

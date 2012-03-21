;
goog.provide('pn.data.EntityFilter');

goog.require('goog.array');
goog.require('goog.asserts');



/**
 * @constructor
 * @extends {goog.Disposable}
 * @param {!Object.<Array>} cache The data cache to use for related entities.
 * @param {!pn.ui.UiSpec} spec The spec being filtered.
 */
pn.data.EntityFilter = function(cache, spec) {
  goog.Disposable.call(this);

  /**
   * @private
   * @type {!Object.<Array>}
   */
  this.cache_ = cache;

  /**
   * @private
   * @type {!pn.ui.UiSpec}
   */
  this.spec_ = spec;

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
  this.log_ = pn.LogUtils.getLogger('EntityFilter');
};
goog.inherits(pn.data.EntityFilter, goog.Disposable);


/**
 * @param {!Object} entity The entity to filter with the specified filters.
 * @param {!Object.<string>} filters The filters to use to filter the list by.
 * @return {boolean} Wether the specified entity meets the specified filters.
 */
pn.data.EntityFilter.prototype.filterEntity = function(entity, filters) {
  goog.asserts.assert(entity);
  goog.asserts.assert(filters);

  this.dbg_('filterEntity: ', filters);
  for (var filterId in filters) {
    var fv = filters[filterId].toString().toLowerCase();
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
 * @param {Object} entity The entity to test for match.
 * @param {string} fieldId The filter/field id.
 * @return {boolean} Wether the specified entity meets the
 *    specified filterValue.
 */
pn.data.EntityFilter.prototype.filterEntityImpl_ =
    function(filterValue, entity, fieldId) {
  goog.asserts.assert(goog.isDefAndNotNull(filterValue));
  if (!goog.isDefAndNotNull(entity)) return false;
  if (filterValue === '0') return true;
  var steps = fieldId.split('.'),
      parentType = this.spec_.type,
      result = entity;
  while (true) {
    var step = steps.shift();
    if (!step) break;
    result = this.processStep_(step, parentType, result, step.length === 0);    
    
    this.dbg_('process step result: ', result);
    if (!goog.isDefAndNotNull(result)) {
      this.dbg_('returning as is null');
      return false;
    }
    // Whenever an entity is found in the path then we stop at that step with
    // that entities ID
    if (result['ID']) {
      result = result['ID'];
      break;
    }
    parentType = this.getStepType_(step);
  }

  return this.matchesFilter_(result, filterValue, fieldId);
};


/**
 * @private
 * @param {string} property The property to get the value of.
 * @param {string} parentType The type name of the parent of this step.
 * @param {Object|Array} source The entity or list of entities to
 *    query the given property.
 * @param {boolean} isFinal Wether this is the final step.
 * @return {Object|Array} The next level of entity value(s) from this step.
 */
pn.data.EntityFilter.prototype.processStep_ =
    function(property, parentType, source, isFinal) {
  this.dbg_('processStep_: ', arguments);

  var type = this.getStepType_(property);
  if (type && !this.cache_[type])
    throw new Error('Could not find ' + type + ' in the cache.');

  var result;
  // Children Entities
  if (goog.string.endsWith(property, 'Entities')) {
    this.dbg_('\tprocessStep_ Children Entities [' + type +
        '] parentType [' + parentType + ']');
    result = goog.array.filter(this.cache_[type], function(e) {
      return e[parentType + 'ID'] === source['ID'];
    }, this);
  }
  // Parent Entity
  else if (!isFinal && property !== 'ID' &&
      goog.string.endsWith(property, 'ID')) {
    this.dbg_('\tprocessStep_ Parent Entity type [' + type + ']');
    var getChild = goog.bind(function(sourceEntity) {
      if (!sourceEntity) return null;
      var entityId = sourceEntity[property];
      return goog.array.find(this.cache_[type], function(child) {
        return entityId === child['ID'];
      }, this);
    }, this);

    if (goog.isArray(source)) {
      result = goog.array.map(/** @type {Array} */ (source), getChild, this);
    } else { result = getChild(source); }
  }
  // Simple Property
  else {
    this.dbg_('\tprocessStep_ Simple Property: ' + property);
    var getVal = goog.bind(function(sourceEntity) {
      return sourceEntity ? sourceEntity[property] : null;
    }, this);

    if (goog.isArray(source)) {
      result = goog.array.map(/** @type {Array} */ (source), getVal, this);
    } else { result = getVal(source); }
  }
  if (!goog.isArray(result)) { return result; }

  return goog.array.filter(result, function(r) {
    return goog.isDefAndNotNull(r);
  });
};


/**
 * @private
 * @param {string} property The step property used to retreive the value from
 *    the current entity step.
 * @return {string} The type of the current property if its an entity. Otherwise
 *    returns empty string.
 */
pn.data.EntityFilter.prototype.getStepType_ = function(property) {
  if (goog.string.endsWith(property, 'Entities')) {
    return goog.string.remove(property, 'Entities');
  } else if (goog.string.endsWith(property, 'ID')) {
    return property.substring(0, property.length - 2);
  } else return '';
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
    if (ev['ID']) return ev['ID'].toString() === fv;
    var field = goog.array.find(this.spec_.getSearchFields(), function(sf) {
      return sf.id === fieldId;
    });
    if (field.renderer === FieldRenderers.dateRenderer ||
        field.renderer === FieldRenderers.readOnlyDateField) {
      var min = parseInt(filterValue, 10);
      var max = min + (24 * 60 * 60 * 1000);
      return min <= ev && ev < max;
    } else if (field.renderer === FieldRenderers.centsRenderer) {
      ev = pn.Utils.centsToDisplayString(ev);
    }
    var eval = ev.toString().toLowerCase();
    var result = exact ? eval === fv : eval.indexOf(fv) >= 0;

    this.dbg_('matchesFilter_.matcher result: ',
        result, ' eval: ', eval, ' exact: ', exact, ' fv: ', fv);
    return result;
  };


  if (goog.isArray(entityValue)) {
    return goog.array.findIndex(entityValue, function(entity) {
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
    return goog.array.findIndex(filterVal, function(fv) {
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
    if (!goog.isString(arg) && arg.length) {
      return '[' + goog.array.map(arg, format).join(',') + ']';
    } else if (goog.isObject(arg)) { return goog.debug.expose(arg); }
    else return arg;
  };

  var strings = goog.array.map(arguments, format);
  this.log_.finest(strings.join(''));
};


/** @inheritDoc */
pn.data.EntityFilter.prototype.disposeInternal = function() {
  pn.data.EntityFilter.superClass_.disposeInternal.call(this);

  goog.dispose(this.log_);
  delete this.cache_;
  delete this.spec_;
  delete this.log_;
};

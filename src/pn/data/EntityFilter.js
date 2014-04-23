;
goog.provide('pn.data.EntityFilter');

goog.require('goog.array');
goog.require('goog.asserts');



/**
 * @constructor
 * @extends {goog.Disposable}
 * @param {!Object.<Array>} cache The data cache to use for related entities.
 * @param {string} type The type of the entity being filtered.
 */
pn.data.EntityFilter = function(cache, type) {
  goog.Disposable.call(this);

  /**
   * @private
   * @type {!Object.<Array>}
   */
  this.cache_ = cache;

  /**
   * @private
   * @type {string}
   */
  this.type_ = type;

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
 * @param {!Object.<{value:(Array.<string>|string), spec:!pn.ui.edit.Field}>}
 *    filters The filters to use to filter the list by.
 * @param {!Object} hash the hash table
 * @return {boolean} Wether the specified entity meets the specified filters.
 */
pn.data.EntityFilter.prototype.filterEntity = function(entity, filters, hash) {
  goog.asserts.assert(entity);
  goog.asserts.assert(filters);
  this.dbg_('filterEntity: ' + goog.debug.expose(filters));

  for (var id in filters) {
    var f = filters[id];
    if (!this.filterEntityImpl_(f.value, f.spec, entity, hash)) {
      return false;
    }
  }
  return true;
};


/**
 * @private
 * @param {Array.<string>|string|number|Date}
 *    filterValue The filter value to apply to
 *    the given entity. All filter values wether in array or a string MUST be
 *    lowercase.
 * @param {!pn.ui.edit.Field} spec The field specification for the given
 *    filter.
 * @param {Object} entity The entity to test for match.
 * @param {!Object} hash the hash table
 * @return {boolean} Wether the specified entity meets the
 *    specified filterValue.
 */

pn.data.EntityFilter.prototype.filterEntityImpl_ =
    function(filterValue, spec, entity, hash) {
  goog.asserts.assert(goog.isDefAndNotNull(filterValue));
  if (!goog.isDefAndNotNull(entity)) return false;
  if (spec.searchFilter) {
    if (goog.isArray(filterValue)) {
      goog.asserts.assert(filterValue.length === 1);
      filterValue = filterValue[0];
    }
    goog.asserts.assert(goog.isString(filterValue));
    return spec.searchFilter(entity, /** @type {string} */ (filterValue));
  }
  // use filter function with multi-filter values
  if (spec.multiFilter) {
    goog.asserts.assert(goog.isArray(filterValue));
    return spec.multiFilter(entity,
        /** @type {Array} */ (filterValue), this.cache_, hash);
  }

  if (filterValue === '0') return true;

  //Date filter
  if (spec.renderer === pn.ui.edit.FieldRenderers.dateRenderer) {
    if (filterValue === 0) return true;
    filterValue = new Date((new Date(filterValue)).setHours(0, 0, 0, 0));
  }

  var stepResult = false;
  var thisParent = this;

  var filters = spec.filterColumn.split('&&');
  goog.array.forEach(filters, function(f) {

    var steps = f.split('.'),
        parentType = thisParent.type_,
        result = entity;
    while (!stepResult) {
      var step = steps.shift();
      if (!step) break;
      result = thisParent.processStep_(step, parentType, result,
          steps.length === 0);

      thisParent.dbg_('process step result: ' + goog.debug.expose(result));
      if (!goog.isDefAndNotNull(result)) {
        thisParent.dbg_('returning as is null');
        continue;
      }
      parentType = thisParent.getStepType_(step);
    }
    if(filterValue[0] === 'null' && spec['displayNotSelected'] !== undefined 
        && spec['displayNotSelected'] === true){
      stepResult = result === 0; 
    }
    else{
      stepResult = stepResult || 
          thisParent.matchesFilter_(result, filterValue);
    }
  });
  return stepResult;
};


/**
 * @private
 * @param {string} property The property to get the value of.
 * @param {string} parentType The type name of the parent of this step.
 * @param {Object|Array} source The entity or list of entities to
 *    query the given property.
 * @param {boolean} isFinal Wether this is the final step.
 * @return {boolean|Array}
 */
pn.data.EntityFilter.prototype.processStep_ =
    function(property, parentType, source, isFinal) {

  this.dbg_('processStep_: property: ' + property + ' parentType: ' +
      parentType + ' source: ' + source + ' isFinal: ' + isFinal);

  if (!source) { return false; }
  var type,
      result;
  // Children Entities
  if (goog.string.endsWith(property, 'Entities')) {
    type = this.getStepType_(property);
    if (type && !this.cache_[type])
      throw new Error('Could not find ' + type + ' in the cache.');
    result = goog.array.filter(this.cache_[type], function(e) {
      if (goog.isArray(source)) {
        var idx = goog.array.findIndex(source,
            function(s) { return e[parentType + 'ID'] === s['ID']; });
        return idx >= 0;
      } else {
        return e[parentType + 'ID'] === source['ID'];
      }
    }, this);
    this.dbg_('\tprocessStep_ Children Entities [' + type +
        ':' + result.length + '] parentType [' + parentType + ']');
  }
  // Parent Entity
  else if (!isFinal && property !== 'ID' &&
      goog.string.endsWith(property, 'ID')) {
    type = this.getStepType_(property);
    if (type && !this.cache_[type])
      throw new Error('Could not find ' + type + ' in the cache.');
    this.dbg_('\tprocessStep_ Parent Entity type [' + type + ']');
    var getChild = goog.bind(function(sourceEntity) {
      if (!sourceEntity) return null;
      var id = sourceEntity[property];
      return goog.array.find(this.cache_[type], function(child) {
        return id === child['ID'];
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

      result = goog.array.map(/** @type {Array} */(source), getVal, this);

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
 * @param {string|Array.<string>|Date|number} filterValue The filter value.
 * @return {boolean} Wether the current entity matches the specified filter.
 */
pn.data.EntityFilter.prototype.matchesFilter_ =
    function(entityValue, filterValue) {

  if (!goog.isDefAndNotNull(entityValue)) {
    this.dbg_('matchesFilter_ null entity value');
    return false;
  }
  this.dbg_('matchesFilter_: entityValue:' +
      entityValue + ' filterValue: ' + filterValue);
  var matcher = function(ev, fv, exact) {
    this.dbg_('matchesFilter_.matcher: ev: ' +
        ev + ' fv: ' + fv + ' exact: ' + exact);
    if (ev['ID']) {
      return ev['ID'].toString() === fv;
    }
    var evaled = ev.toString().toLowerCase();

    if (exact) {
      return evaled === fv;
    }
    else {

      return evaled.indexOf(fv) >= 0;
    }
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
 * @param {string|Array.<string>|Date|number} filterVal The filter value.
 * @param {*} entityVal The value of the current entity(s) in the final step.
 * @param {function(*,string,boolean):boolean} predicate The matching
 *    predicate which takes the single entity value, single filter value and
 *    wether an exact match is required.
 * @return {boolean} Wether the current entity matches the specified filter.
 */
pn.data.EntityFilter.prototype.singleEntityMatches_ =
    function(filterVal, entityVal, predicate) {

  if (!goog.isDefAndNotNull(entityVal)) return false;
  this.dbg_('singleEntityMatches_: filterVal: ' +
      filterVal + ' entityVal: ' + entityVal);

  if (goog.isArray(filterVal)) {
    return goog.array.findIndex(filterVal, function(fv) {

      return this.singleFilterValueMatches_(fv, entityVal, true, predicate);
    }, this) >= 0;
  } else if (typeof entityVal === 'number' && typeof filterVal === 'string') {

    return this.singleFilterValueMatches_(
        /** @type {string} */(filterVal), entityVal, true, predicate);
  } else {

    return this.singleFilterValueMatches_(
        /** @type {string} */(filterVal), entityVal, false, predicate);
  }
};


/**
 * @private
 * @param {string|Date} filterVal The filter value.
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
  this.dbg_('singleFilterValueMatches_: filterVal: ' +
      filterVal + ' entityVal: ' + entityVal + ' exact: ' + exact);

  if (!filterVal || filterVal === '0') return true;
  if (filterVal.getMonth) {
    entityVal = (new Date(entityVal)).setHours(0, 0, 0, 0);
    filterVal = filterVal.setHours(0, 0, 0, 0);
  }
  if (filterVal.toLowerCase)
    filterVal = filterVal.toLowerCase();
  return predicate.call(this, entityVal, filterVal, exact);
};


/**
 * @private
 * @param {string} message The message to log if debug is enabled.
 */
pn.data.EntityFilter.prototype.dbg_ = function(message) {
  if (this.debug_) this.log_.finest(message);
};


/** @inheritDoc */
pn.data.EntityFilter.prototype.disposeInternal = function() {
  pn.data.EntityFilter.superClass_.disposeInternal.call(this);

  goog.dispose(this.log_);
  delete this.cache_;
  delete this.type_;
  delete this.log_;
};

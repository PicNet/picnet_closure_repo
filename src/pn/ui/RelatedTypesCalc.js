;
goog.provide('pn.ui.RelatedTypesCalc');

goog.require('pn.data.BaseDalCache');
goog.require('pn.data.Entity');


/**
 * @param {pn.ui.UiSpec|string} spec The UiSpec or the ID of the UiSpec to
 *    parse for related types.
 * @param {Array.<pn.data.Type>=} opt_additionals Any additional types to
 *    include in the returned array.
 * @return {!Array.<pn.data.Type>} The list of types related to
 *    this entity.
 */
pn.ui.RelatedTypesCalc.getGridRelatedTypes = function(spec, opt_additionals) {
  var createSpec = goog.isString(spec);
  var spec2 = createSpec ? pn.app.ctx.specs.get(/** @type {string} */ (spec)) :
      /** @type {pn.ui.UiSpec} */ (spec);
  var cfg = spec2.getGridConfig(new pn.data.BaseDalCache({}));

  var types = opt_additionals || [];
  goog.array.forEach(cfg.cCtxs, function(cctx) {
    var additional = cctx.spec.additionalCacheTypes;
    if (additional.length) {
      goog.asserts.assert(goog.isFunction(additional[0]));
      types = goog.array.concat(types, additional);
    }
    pn.ui.RelatedTypesCalc.addAllTypes_(
        types, cctx.spec.entitySpec.type, cctx.spec.displayPath);
    pn.ui.RelatedTypesCalc.addAllTypes_(
        types, cctx.spec.entitySpec.type, cctx.spec.dataProperty);
  });

  goog.dispose(cfg);
  if (createSpec) goog.dispose(spec2);
  goog.array.removeDuplicates(types);
  return types;
};


/**
 * @param {pn.ui.UiSpec|string} spec The UiSpec or the ID of the UiSpec to
 *    parse for related types.
 * @param {!Object} entity The entity about to be edited.  This is usually only
 *    ever used if a field's additionalCacheTypes property is dependant on some
 *    property of the entity, i.e. If its a new entity.
 * @param {Array.<pn.data.Type>=} opt_additionals Any additional types to
 *    include in the returned array.
 * @return {!Array.<pn.data.Type>} The list of types related to this entity.
 */
pn.ui.RelatedTypesCalc.getEditRelatedTypes =
    function(spec, entity, opt_additionals) {
  var createSpec = goog.isString(spec);
  var spec2 = createSpec ? pn.app.ctx.specs.get(/** @type {string} */ (spec)) :
      /** @type {pn.ui.UiSpec} */ (spec);
  var cfg = spec2.getEditConfig(entity, new pn.data.BaseDalCache({}));

  var types = opt_additionals || [];
  goog.array.forEach(cfg.fCtxs, function(fctx) {

    var additional = fctx.spec.additionalCacheTypes;
    if (additional.length) {
      goog.asserts.assert(goog.isFunction(additional[0]));
      types = goog.array.concat(types, additional);
    }

    pn.ui.RelatedTypesCalc.addAllTypes_(
        types, fctx.spec.entitySpec.type, fctx.spec.displayPath);
    if (fctx.spec.renderer === pn.ui.edit.FieldRenderers.orderFieldRenderer) {
      goog.asserts.assert(goog.isFunction(spec.type));
      types.push(spec.type);
    }
    pn.ui.RelatedTypesCalc.addAllTypes_(
        types, fctx.spec.entitySpec.type, fctx.spec.dataProperty);
    if (fctx.spec.tableSpec) {
      var spec1 = fctx.spec.tableSpec;
      var related = pn.ui.RelatedTypesCalc.getGridRelatedTypes(spec1);
      if (related.length) {
        goog.asserts.assert(goog.isFunction(related[0]));
        types = goog.array.concat(types, related);
      }
    }
  });

  goog.dispose(cfg);
  if (createSpec) goog.dispose(spec2);

  goog.array.removeDuplicates(types);
  return types;
};


/**
 * @private
 * @param {!Array.<string>} arr The target array to add all types infered from
 *    the specified base type and property.
 * @param {pn.data.Type} type The starting entity type.
 * @param {string} prop The path to check for additional types.
 */
pn.ui.RelatedTypesCalc.addAllTypes_ = function(arr, type, prop) {
  goog.asserts.assert(goog.isArray(arr));
  goog.asserts.assert(goog.isFunction(type));

  var target = /** @type {?pn.data.Type} */ (type);
  var steps = prop ? prop.split('.') : [];
  while (!!prop && !!target) {
    prop = steps.shift();
    if (prop && pn.data.EntityUtils.isRelationshipProperty(prop)) {
      target = pn.data.EntityUtils.getTypeProperty(target, prop);
    }
    if (target) {
      goog.asserts.assert(goog.isFunction(target));
      arr.push(target);
    }
  }
};

;
goog.provide('pn.ui.RelatedTypesCalc');


/**
 * @param {pn.ui.UiSpec|string} spec The UiSpec or the ID of the UiSpec to
 *    parse for related types.
 * @param {Array.<string>=} opt_additionals Any additional types to include in
 *    the returned array.
 * @return {!Array.<pn.data.EntityFactory>} The list of types related to 
 *    this entity.
 */
pn.ui.RelatedTypesCalc.getGridRelatedTypes = function(spec, opt_additionals) {
  var createSpec = goog.isString(spec);
  var spec2 = createSpec ? pn.app.ctx.specs.get(/** @type {string} */ (spec)) :
      /** @type {pn.ui.UiSpec} */ (spec);
  var cfg = spec2.getGridConfig({});

  var types = opt_additionals || [];
  goog.array.forEach(cfg.cCtxs, function(cctx) {
    var additional = cctx.spec.additionalCacheTypes;
    if (additional.length) { types = goog.array.concat(types, additional); }
    pn.ui.RelatedTypesCalc.addAllTypes_(
        types, cctx.spec.entitySpec.type, cctx.spec.displayPath);
    pn.ui.RelatedTypesCalc.addAllTypes_(
        types, cctx.spec.entitySpec.type, cctx.spec.dataProperty);
  });

  goog.dispose(cfg);
  if (createSpec) goog.dispose(spec2);
  goog.array.removeDuplicates(types);
  
  return goog.array.map(types, 
      function(t) { return pn.data.Entity.fromName(t); });
};


/**
 * @param {pn.ui.UiSpec|string} spec The UiSpec or the ID of the UiSpec to
 *    parse for related types.
 * @param {!Object} entity The entity about to be edited.  This is usually only
 *    ever used if a field's additionalCacheTypes property is dependant on some
 *    property of the entity, i.e. If its a new entity.
 * @param {Array.<string>=} opt_additionals Any additional types to include in
 *    the returned array.
 * @return {!Array.<string>} The list of types related to this entity.
 */
pn.ui.RelatedTypesCalc.getEditRelatedTypes =
    function(spec, entity, opt_additionals) {
  var createSpec = goog.isString(spec);
  var spec2 = createSpec ? pn.app.ctx.specs.get(/** @type {string} */ (spec)) :
      /** @type {pn.ui.UiSpec} */ (spec);
  var cfg = spec2.getEditConfig(entity, {});

  var types = opt_additionals || [];

  goog.array.forEach(cfg.fCtxs, function(fctx) {

    var additional = fctx.spec.additionalCacheTypes;
    if (additional.length) { types = goog.array.concat(types, additional); }

    pn.ui.RelatedTypesCalc.addAllTypes_(
        types, fctx.spec.entitySpec.type, fctx.spec.displayPath);
    if (fctx.spec.renderer === pn.ui.edit.FieldRenderers.orderFieldRenderer) {
      types.push(spec.type);
    }
    pn.ui.RelatedTypesCalc.addAllTypes_(
        types, fctx.spec.entitySpec.type, fctx.spec.dataProperty);
    if (fctx.spec.tableSpec) {
      types = goog.array.concat(types,
          pn.ui.RelatedTypesCalc.getGridRelatedTypes(fctx.spec.tableSpec));
    }
  });

  goog.dispose(cfg);
  if (createSpec) goog.dispose(spec2);
  goog.array.removeDuplicates(types);
  
  return goog.array.map(types, 
      function(t) { return pn.data.Entity.fromName(t); });
};


/**
 * @private
 * @param {!Array.<string>} arr The target array to add all types infered from
 *    the specified base type and property.
 * @param {string} type The starting entity type.
 * @param {string} property The path to check for additional types.
 */
pn.ui.RelatedTypesCalc.addAllTypes_ = function(arr, type, property) {
  var steps = property ? property.split('.') : [];
  while (!!property && !!type) {
    property = steps.shift();
    type = property ? pn.data.EntityUtils.getTypeProperty(type, property) : '';
    if (type) arr.push(type);
  }
};

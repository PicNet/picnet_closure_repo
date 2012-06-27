;
goog.provide('pn.ui.RelatedTypesCalc');


/**
 * @param {pn.ui.UiSpec|string} spec The UiSpec or the ID of the UiSpec to
 *    parse for related types.
 * @param {Array.<string>=} opt_additionals Any additional types to include in
 *    the returned array.
 * @return {!Array.<string>} The list of types related to this entity.
 */
pn.ui.RelatedTypesCalc.getGridRelatedTypes = function(spec, opt_additionals) {
  var createSpec = goog.isString(spec);
  var spec2 = createSpec ? pn.app.ctx.specs.get(/** @type {string} */ (spec)) :
      /** @type {pn.ui.UiSpec} */ (spec);
  var cfg = spec2.getGridConfig({});

  var types = opt_additionals || [];
  var addIfType = function(prop) {
    pn.ui.RelatedTypesCalc.addIfType_(types, prop);
  };
  goog.array.forEach(cfg.cCtxs, function(cctx) {
    var additional = cctx.spec.additionalCacheTypes;
    if (additional.length) { types = goog.array.concat(types, additional); }

    if (cctx.spec.displayPath) {
      goog.array.forEach(cctx.spec.displayPath.split('.'), addIfType);
    }
    addIfType(cctx.spec.dataProperty);
  });

  goog.dispose(cfg);
  if (createSpec) goog.dispose(spec2);
  goog.array.removeDuplicates(types);
  return types;
};


/**
 * @param {pn.ui.UiSpec|string} spec The UiSpec or the ID of the UiSpec to
 *    parse for related types.
 * @param {Array.<string>=} opt_additionals Any additional types to include in
 *    the returned array.
 * @return {!Array.<string>} The list of types related to this entity.
 */
pn.ui.RelatedTypesCalc.getEditRelatedTypes = function(spec, opt_additionals) {
  var createSpec = goog.isString(spec);
  var spec2 = createSpec ? pn.app.ctx.specs.get(/** @type {string} */ (spec)) :
      /** @type {pn.ui.UiSpec} */ (spec);
  var cfg = spec2.getEditConfig({}, {});

  var types = opt_additionals || [];
  var addIfType = function(prop) {
    pn.ui.RelatedTypesCalc.addIfType_(types, prop);
  };

  goog.array.forEach(cfg.fCtxs, function(fctx) {

    var additional = fctx.spec.additionalCacheTypes;
    if (additional.length) { types = goog.array.concat(types, additional); }

    if (fctx.spec.displayPath) {
      goog.array.forEach(fctx.spec.displayPath.split('.'), addIfType);
    }
    if (fctx.spec.renderer === pn.ui.edit.FieldRenderers.orderFieldRenderer) {
      types.push(spec.type);
    }
    addIfType(fctx.spec.dataProperty);
    if (fctx.spec.tableSpec) {
      types = goog.array.concat(types,
          pn.ui.RelatedTypesCalc.getGridRelatedTypes(fctx.spec.tableSpec));
    }
  });

  goog.dispose(cfg);
  if (createSpec) goog.dispose(spec2);
  goog.array.removeDuplicates(types);
  return types;
};


/**
 * @private
 * @param {!Array.<string>} arr The array to add the type that this property
 *    denotes (if any).
 * @param {string} prop The property to inspect for type denotation.
 */
pn.ui.RelatedTypesCalc.addIfType_ = function(arr, prop) {
  if (!prop) return;
  var type = pn.data.EntityUtils.getTypeProperty(prop);
  if (type !== prop) { arr.push(type); }
};

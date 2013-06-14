;
goog.provide('pn.ui.hist.HistoryConfig');

goog.require('pn.ui.edit.soy.history');



/**
 * @constructor
 * @extends {goog.Disposable}
 * @param {!pn.ui.UiSpec} spec The entity spec being shown.
 * @param {!pn.data.BaseDalCache} cache The current context cache.
 * @param {!Array.<!pn.data.Entity>} changes The changes (audit
 *    entries) to display.
 */
pn.ui.hist.HistoryConfig = function(spec, cache, changes) {
  goog.Disposable.call(this);

  pn.assInst(spec, pn.ui.UiSpec);
  pn.assInst(cache, pn.data.BaseDalCache);
  pn.assArr(changes);

  /**
   * @const
   * @type {!pn.ui.UiSpec}
   */
  this.spec = spec;

  /**
   * @const
   * @type {!pn.data.BaseDalCache}
   */
  this.cache = cache;

  /**
   * @const
   * @type {!Array.<!pn.data.Entity>}
   */
  this.changes = changes;

  var cfg = spec.getEditConfig(new pn.data.Entity(spec.type, 0), cache);
  /**
   * @const
   * @type {!Array.<pn.ui.edit.FieldCtx>}
   */
  this.fields = cfg.fCtxs;
  goog.dispose(cfg);
};
goog.inherits(pn.ui.hist.HistoryConfig, goog.Disposable);


/**
 * @param {pn.data.Entity} e The entity being displayed.
 * @return {string} The heading for the specified entity.  The default
 *    implementation returns the EntityType + Name field or simply the 'ID'.
 *    Override to change.
 */
pn.ui.hist.HistoryConfig.prototype.getHeading = function(e) {
  pn.assInst(e, pn.data.Entity);

  if (!e) { return ''; }
  if (e[this.spec.type + 'Name']) {
    return 'History - ' + e[this.spec.type + 'Name'];
  }
  return 'History - ID: ' + e['ID'];
};


/** @return {string} The html for the HistoryViewer control.  See
 *    HistoryViewer.js for details on what is expected of this template. */
pn.ui.hist.HistoryConfig.prototype.getTemplate = function() {
  return pn.ui.edit.soy.history.page();
};

;
goog.provide('pn.ui.hist.HistoryViewer');

goog.require('goog.events.EventHandler');
goog.require('goog.ui.Component');
goog.require('pn.dom');
goog.require('pn.json');
goog.require('pn.ui.hist.HistoryConfig');



/**
 * @constructor
 * @extends {goog.ui.Component}
 * @param {!pn.ui.hist.HistoryConfig} cfg The configuration for this
 *    HistoryViewer.
 */
pn.ui.hist.HistoryViewer = function(cfg) {
  pn.ass(cfg instanceof pn.ui.hist.HistoryConfig);

  /**
   * @private
   * @type {!pn.ui.hist.HistoryConfig}
   */
  this.cfg_ = cfg;

  /**
   * @private
   * @type {goog.debug.Logger}
   */
  this.log_ = pn.log.getLogger('pn.ui.hist.HistoryViewer');

  /**
   * @private
   * @type {pn.ui.grid.Grid}
   */
  this.grid_ = null;

  /**
   * @private
   * @type {!Object.<!pn.ui.edit.FieldCtx>}
   */
  this.fieldSpecs_ = {};

  goog.ui.Component.call(this);
};
goog.inherits(pn.ui.hist.HistoryViewer, goog.ui.Component);


/** @override */
pn.ui.hist.HistoryViewer.prototype.createDom = function() {
  this.decorateInternal(this.dom_.createElement('div'));
};


/** @override */
pn.ui.hist.HistoryViewer.prototype.decorateInternal = function(element) {
  this.setElementInternal(element);
  element.innerHTML = this.cfg_.getTemplate();

  var gridContainer = pn.dom.get('audit-log-grid'),
      spec = pn.app.ctx.specs.get('ChangeLogEntry'),
      gcfg = spec.getGridConfig(this.cfg_.cache);

  this.grid_ = new pn.ui.grid.Grid(gcfg, this.cfg_.changes, this.cfg_.cache);
  this.grid_.decorate(gridContainer);

  this.registerDisposable(spec);
  this.registerDisposable(this.grid_);
};


/** @override */
pn.ui.hist.HistoryViewer.prototype.enterDocument = function() {
  pn.ui.hist.HistoryViewer.superClass_.enterDocument.call(this);

  var h = this.getHandler();
  h.listen(this.grid_, pn.ui.grid.Grid.SELECTED, this.showAuditEntry_);
  h.listen(pn.dom.get('back'), goog.events.EventType.CLICK,
      function() { pn.app.ctx.pub(pn.app.AppEvents.ENTITY_CANCEL); });
};


/**
 * @private
 * @param {goog.events.Event} e The event from the grid.
 */
pn.ui.hist.HistoryViewer.prototype.showAuditEntry_ = function(e) {
  var change = /** @type {pn.data.Entity} */ (e.selected);

  var data = {
    'id1': change.id,
    'id2': change.getValue('PrevChangeLogEntryPK')
  },
      callback = goog.bind(this.showDiffBetween_, this),
      uri = pn.app.ctx.cfg.touri('History', 'GetHistoryDescriptions');
  pn.app.ctx.data.ajax(uri, data, callback);
};


/**
 * @private
 * @param {!Array.<string>} descs The descriptions for this and the
 *    previous ChangeLogEntry entities.
 */
pn.ui.hist.HistoryViewer.prototype.showDiffBetween_ = function(descs) {
  pn.ass(descs.length === 1 || descs.length === 2);
  var selected = pn.data.TypeRegister.parseEntity(
      this.cfg_.spec.type, descs[0]);
  var prev = descs[1] ? pn.data.TypeRegister.parseEntity(
      this.cfg_.spec.type, descs[1]) : null;
  pn.dom.get('audit-log-heading').innerHTML = this.cfg_.getHeading(selected);
  var diff = this.getEntityDiff_(prev || selected, selected);
  var diffTable = pn.dom.get('audit-log-diff-table');
  goog.dom.removeChildren(diffTable);

  goog.dom.appendChild(diffTable, this.createDiffHeaderRow_());
  this.getDiffRows_(diff, !prev).pnforEach(function(r) {
    goog.dom.appendChild(diffTable, r);
  }, this);
};


/**
 * @private
 * @return {!Element} The header row for the diff table.
 */
pn.ui.hist.HistoryViewer.prototype.createDiffHeaderRow_ = function() {
  return goog.dom.createDom('tr', '',
      goog.dom.createDom('th', {'class': 'audit-log-diff-table-item'}),
      goog.dom.createDom('th',
          {'class': 'audit-log-diff-table-before'}, '', 'Before'),
      goog.dom.createDom('th',
          {'class': 'audit-log-diff-table-after'}, '', 'After')
  );
};


/**
 * @private
 * @param {!pn.data.Entity} left The left entity to compare.
 * @param {!pn.data.Entity} right The right entity to compare.
 * @return {!Object.<!Array.<string>>} The diff object which is just a list of
 *  fields with a value for left and right.
 */
pn.ui.hist.HistoryViewer.prototype.getEntityDiff_ = function(left, right) {
  pn.assInst(left, pn.data.Entity);
  pn.assInst(right, pn.data.Entity);

  var diff = {};
  var addDiff = goog.bind(function(fctx) {
    if (fctx.id.pnstartsWith('_')) return;
    var l = this.getRenderedText_(fctx, left),
        r = this.getRenderedText_(fctx, right);
    diff[fctx.id] = [l, r];
    this.fieldSpecs_[fctx.id] = fctx;
  }, this);
  this.cfg_.fields.pnforEach(addDiff);
  return diff;
};


/**
 * @private
 * @param {!pn.ui.edit.FieldCtx} fctx The field context being displayed.
 * @param {!pn.data.Entity} entity The entity to get the rendered text for.
 * @return {string} The rendererd prop value on the specified entity.
 */
pn.ui.hist.HistoryViewer.prototype.getRenderedText_ = function(fctx, entity) {
  pn.ass(fctx instanceof pn.ui.edit.FieldCtx);
  pn.ass(entity instanceof pn.data.Entity);

  // When storing audit logs we store the name of the parent in the ParentID
  // field not the ID so we cannot use the default renderer.
  if (pn.data.EntityUtils.isParentProperty(fctx.spec.dataProperty)) {
    return entity.getValue(fctx.id).toString();
  }
  var spec = fctx.spec;
  spec.readonly = true;
  var rend = spec.getDefaultRenderer(true);
  if (goog.isFunction(rend)) {
    var div = goog.dom.createDom('div');
    rend(fctx, div, entity);
    return div.innerText.pntrim();
  } else {
    return entity.getValue(fctx.id).toString();
  }
};


/**
 * @private
 * @param {!Object.<!Array.<string>>} diff The diff object to render to html.
 * @param {boolean} newEntity Wether the left column is empty.
 * @return {!Array.<Element>} The rows created from the diff description.
 */
pn.ui.hist.HistoryViewer.prototype.getDiffRows_ = function(diff, newEntity) {
  var rows = [];
  var odd = false;
  for (var f in diff) {
    var eq = diff[f][0] === diff[f][1];
    var clazz = eq ? 'same ' : 'not-same ';
    clazz += (odd = !odd) ? 'odd' : 'even';
    var field = this.fieldSpecs_[f];
    rows.push(goog.dom.createDom('tr', clazz,
        goog.dom.createDom('th', {'class': 'left-col'}, '', field.spec.name),
        goog.dom.createDom('td', {'class': 'middle-col'}, '',
            goog.dom.createTextNode(newEntity ? '' : diff[f][0])),
        goog.dom.createDom('td', '', goog.dom.createTextNode(diff[f][1]))
        ));
  }
  return rows;
};

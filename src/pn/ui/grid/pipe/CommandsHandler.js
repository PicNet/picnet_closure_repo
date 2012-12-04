;
goog.provide('pn.ui.grid.pipe.CommandsHandler');

goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('pn.ui.grid.pipe.GridHandler');



/**
 * @constructor
 * @extends {pn.ui.grid.pipe.GridHandler}
 * @param {string} entityType The entity being displayed on the current
 *    grid.
 */
pn.ui.grid.pipe.CommandsHandler = function(entityType) {
  pn.ui.grid.pipe.GridHandler.call(this);

  /**
   * @private
   * @type {string}
   */
  this.entityType_ = entityType;

  this.requiredOnEmptyGrid = true;
};
goog.inherits(pn.ui.grid.pipe.CommandsHandler, pn.ui.grid.pipe.GridHandler);


/** @override */
pn.ui.grid.pipe.CommandsHandler.prototype.postRender = function() {
  this.cfg.commands.pnforEach(this.registerCommand_, this);
};


/** @override */
pn.ui.grid.pipe.CommandsHandler.prototype.onCustomEvent =
    function(eventType, opt_data) {
  if (eventType === 'select-row') {
    var e = new goog.events.Event(pn.web.WebAppEvents.ENTITY_SELECT, this);
    e.selected = opt_data;
    this.onCommand_(e);
  }
};


/**
 * @private
 * @param {pn.ui.grid.cmd.Command} cmd The command to listen to.
 */
pn.ui.grid.pipe.CommandsHandler.prototype.registerCommand_ = function(cmd) {
  pn.assInst(cmd, pn.ui.grid.cmd.Command);

  this.listen(cmd, cmd.eventType, this.onCommand_);
};


/**
 * @private
 * @param {goog.events.Event} event The command event fired.
 */
pn.ui.grid.pipe.CommandsHandler.prototype.onCommand_ = function(event) {
  pn.ass(event);
  if (this.cfg.publishEventBusEvents) this.doPubSubEvent_(event);
  else this.pipeline.raiseGridEvent(event);
};


/**
 * @private
 * @param {goog.events.Event} e The command event to publish using the
 *    pn.web.ctx.pub publishing mechanism.
 */
pn.ui.grid.pipe.CommandsHandler.prototype.doPubSubEvent_ = function(e) {
  pn.ass(e);

  var ae = pn.web.WebAppEvents;
  switch (e.type) {
    case ae.ENTITY_SELECT:
      var id = e.selected.id;
      pn.web.ctx.pub(e.type, this.entityType_, id);
      break;
    case ae.LIST_EXPORT:
      var cols = this.cctxs;
      var hdrs = cols.pnmap(function(c) { return c.spec.name; });
      var dat = pn.ui.grid.cmd.ExportCommand.getGridData(cols, hdrs, this.view);
      pn.web.ctx.pub(e.type, this.entityType_, e.exportFormat, dat);
      break;
    default:
      pn.web.ctx.pub(e.type, this.entityType_);
  }
};

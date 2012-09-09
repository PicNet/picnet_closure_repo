;
goog.provide('pn.ui.grid.pipe.CommandsHandler');

goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('pn.ui.grid.pipe.GridHandler');



/**
 * @constructor
 * @extends {pn.ui.grid.pipe.GridHandler}
 * @param {pn.data.Type} entityType The entity being displayed on the current
 *    grid.
 */
pn.ui.grid.pipe.CommandsHandler = function(entityType) {
  pn.ui.grid.pipe.GridHandler.call(this);

  /**
   * @private
   * @type {pn.data.Type}
   */
  this.entityType_ = entityType;
};
goog.inherits(pn.ui.grid.pipe.CommandsHandler, pn.ui.grid.pipe.GridHandler);


/** @override */
pn.ui.grid.pipe.CommandsHandler.prototype.postRender = function() {
  if (this.cfg.readonly) { return; }

  goog.array.forEach(this.cfg.commands, this.registerCommand_, this);
};


/** @override */
pn.ui.grid.pipe.CommandsHandler.prototype.onCustomEvent =
    function(eventType, opt_data) {
  if (eventType === 'select-row') {
    var e = new goog.events.Event(pn.app.AppEvents.ENTITY_SELECT, this);
    e.selected = opt_data;
    this.onCommand_(e);
  }
};


/**
 * @private
 * @param {pn.ui.grid.cmd.Command} cmd The command to listen to.
 */
pn.ui.grid.pipe.CommandsHandler.prototype.registerCommand_ = function(cmd) {
  goog.asserts.assert(cmd);

  this.listen(cmd, cmd.eventType, this.onCommand_);
};


/**
 * @private
 * @param {goog.events.Event} event The command event fired.
 */
pn.ui.grid.pipe.CommandsHandler.prototype.onCommand_ = function(event) {
  goog.asserts.assert(event);

  if (this.cfg.publishEventBusEvents) this.doPubSubEvent_(event);
  else this.pipeline.raiseGridEvent(event);
};


/**
 * @private
 * @param {goog.events.Event} e The command event to publish using the
 *    pn.app.ctx.pub publishing mechanism.
 */
pn.ui.grid.pipe.CommandsHandler.prototype.doPubSubEvent_ = function(e) {
  goog.asserts.assert(e);

  var ae = pn.app.AppEvents;
  switch (e.type) {
    case ae.ENTITY_SELECT:
      var id = e.selected.id;
      pn.app.ctx.pub(e.type, this.entityType_, id);
      break;
    case ae.ENTITY_ADD:
      pn.app.ctx.pub(e.type, this.entityType_);
      break;
    case ae.LIST_EXPORT:
      var cols = this.cctxs;
      var hdrs = goog.array.map(cols, function(c) { return c.spec.name; });
      var dat = pn.ui.grid.cmd.ExportCommand.getGridData(cols, hdrs, this.view);
      pn.app.ctx.pub(e.type, this.entityType_, e.exportFormat, dat);
      break;
    default: throw new Error('Event: ' + e.type + ' is not supported');
  }
};

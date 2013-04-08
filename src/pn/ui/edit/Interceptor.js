;
goog.provide('pn.ui.edit.Interceptor');
goog.provide('pn.ui.edit.InterceptorCtor');

goog.require('goog.events.EventHandler');
goog.require('pn.data.Entity');


/** @typedef {function(new:pn.ui.edit.Interceptor,
 *    !pn.data.Entity,!pn.data.BaseDalCache,!pn.ui.edit.state.State,
 *    !Object.<goog.ui.Button>)} */
pn.ui.edit.InterceptorCtor;



/**
 * @constructor
 * @extends {goog.Disposable}
 * @param {!pn.data.Entity} entity The entity that was just decorated.
 * @param {!pn.data.BaseDalCache} cache The cache with all loaded entities.
 * @param {!pn.ui.edit.state.State} state The state of the fields in this
 *    interceptor.
 * @param {!Object.<goog.ui.Button>} commands The command elements.
 */
pn.ui.edit.Interceptor = function(entity, cache, state, commands) {
  pn.assInst(entity, pn.data.Entity);
  pn.assInst(cache, pn.data.BaseDalCache);
  pn.assInst(state, pn.ui.edit.state.State);
  pn.assObj(commands);

  goog.Disposable.call(this);

  /**
   * @protected
   * @type {!pn.data.Entity}
   */
  this.entity = entity;

  /**
   * @protected
   * @type {!pn.data.BaseDalCache}
   */
  this.cache = cache;

  /**
   * @protected
   * @type {!pn.ui.edit.state.State}
   */
  this.state = state;

  /**
   * @private
   * @type {!Object.<!goog.ui.Button>}
   */
  this.commands_ = commands;

  /**
   * @protected
   * @type {!goog.events.EventHandler}
   */
  this.eh = new goog.events.EventHandler(this);
  this.registerDisposable(this.eh);
};
goog.inherits(pn.ui.edit.Interceptor, goog.Disposable);


/**
 * Override this method to do custom validation checking.  These errors are
 *    in addition to the standard field based error checking done by Edit.js.
 * @return {!Array} An array of any errors found in the form in addition to
 *    the standard error checks done by Edit.js.
 */
pn.ui.edit.Interceptor.prototype.getCustomValidationErrors =
    function() { return []; };


/**
 * @param {string} id The id of the command we need.
 * @return {!(goog.ui.Button|Element)} The command button for the specified id.
 */
pn.ui.edit.Interceptor.prototype.getCommand = function(id) {
  pn.ass(this.commands_[id], 'Could not find command with ID "%s"', id);
  return this.commands_[id];
};

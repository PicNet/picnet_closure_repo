;
goog.provide('pn.app.Router');

goog.require('goog.History');
goog.require('goog.asserts');
goog.require('goog.events.EventHandler');
goog.require('goog.history.EventType');
goog.require('pn.log');



/**
 * @constructor
 * @extends {goog.Disposable}
 * @param {string=} opt_defaultRoute The optional default route when non is
 *    available.  Be default this is the first route in the routes map.
 * @param {boolean=} opt_invisible True to use hidden history states instead
 *    of the user-visible location hash.
 */
pn.app.Router = function(opt_defaultRoute, opt_invisible) {
  goog.Disposable.call(this);

  /**
   * @private
   * @type {goog.debug.Logger}
   */
  this.log_ = pn.log.getLogger('pn.app.Router', false);

  /**
   * @private
   * @type {Object.<function(?):undefined>}
   */
  this.routes_ = null;

  /** @type {!string} */
  this.defaultRoute = opt_defaultRoute || '';

  /**
   * @private
   * @type {!goog.events.EventHandler}
   */
  this.eh_ = new goog.events.EventHandler(this);

  /**
   * @private
   * @type {!Array}
   */
  this.historyStack_ = [];

  /**
   * @private
   * @type {!goog.History}
   */
  this.history_ = new goog.History(opt_invisible,
      opt_invisible ? 'blank.htm' : '');

  var historyEvent = goog.history.EventType.NAVIGATE;
  this.eh_.listen(this.history_, historyEvent, function(e) {
    this.navigateImpl_(e.token);
  });
};
goog.inherits(pn.app.Router, goog.Disposable);


/**
 * Enable the router and parse the first history token
 * @param {!Object.<function(?):undefined>} routes The routes to use in this
 *    application.
 */
pn.app.Router.prototype.initialise = function(routes) {
  goog.asserts.assert(routes);

  this.routes_ = routes;
  if (!this.defaultRoute) {
    this.defaultRoute = goog.object.getKeys(this.routes_)[0];
  }
  this.history_.setEnabled(true);
};


/** Goes back to last history state */
pn.app.Router.prototype.back = function() {
  this.historyStack_.pop(); // Ignore current page
  var to = this.historyStack_.pop() || this.defaultRoute;
  this.log_.fine('back: ' + to);
  // This will trigger a NAVIGATE event which will inturn call navigateImpl_
  this.history_.setToken(to);
};


/** @return {string} the top of the history stack (if any). */
pn.app.Router.prototype.pop = function() {
  return this.historyStack_.pop();
};


/**
 * @param {!string} path The full route path to navigate to.
 * @param {boolean=} opt_add Wether to add the path to the history stack.
 */
pn.app.Router.prototype.navigate = function(path, opt_add) {
  goog.asserts.assert(path);
  var add = opt_add !== false;
  if (add) {
    this.log_.fine('path: ' + path + ' added to history stack');
    // This will trigger a NAVIGATE event which will inturn call navigateImpl_
    this.history_.setToken(path);
  } else {
    this.navigateImpl_(path);
  }
};


/**
 * @private
 * @param {!string} path The full route path to navigate to.
 * @param {boolean=} opt_add Wether to add the path to the history stack.
 */
pn.app.Router.prototype.navigateImpl_ = function(path, opt_add) {
  if (!path) {
    this.log_.fine('navigateImpl empty path going to defaultRoute');
    this.history_.setToken(this.defaultRoute);
    return;
  }
  var tokens = path.split('/');
  var to = tokens.splice(0, 1)[0] || this.defaultRoute;
  var add = opt_add !== false;

  var msg = 'navigateImpl path: ' + path + ' to: ' + to + ' add: ' + add;
  this.log_.fine(msg);

  var route = this.routes_[to];
  if (!route) {
    throw new Error('Navigation token [' + path + '] not supported');
  }

  if (add) { this.historyStack_.push(path); }
  route.apply(this, tokens);
};


/** @inheritDoc */
pn.app.Router.prototype.disposeInternal = function() {
  pn.app.Router.superClass_.disposeInternal.call(this);
  this.log_.fine('disposing');

  goog.dispose(this.log_);
  goog.dispose(this.history_);
  this.eh_.removeAll();
  goog.dispose(this.eh_);

  delete this.log_;
  delete this.routes_;
  delete this.history_;
  delete this.eh_;
};

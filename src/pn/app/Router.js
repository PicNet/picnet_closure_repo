;
goog.provide('pn.app.Router');
goog.provide('pn.app.Router.EventType');

goog.require('goog.asserts');
goog.require('goog.events.Event');
goog.require('goog.history.EventType');
goog.require('goog.history.Html5History');
goog.require('pn.app.EventHandlerTarget');
goog.require('pn.log');



/**
 * @constructor
 * @extends {pn.app.EventHandlerTarget}
 * @param {string=} opt_defaultRoute The optional default route when non is
 *    available.  Be default this is the first route in the routes map.
 * @param {(boolean|string)=} opt_invisible True to use hidden history
 *    states instead of the user-visible location hash.  This can also be a
 *    string of the hidden iframe url.
 */
pn.app.Router = function(opt_defaultRoute, opt_invisible) {
  pn.app.EventHandlerTarget.call(this);

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
   * @type {!Array}
   */
  this.stack_ = [];

  /**
   * @private
   * @type {!goog.history.Html5History}
   */
  this.history_ = new goog.history.Html5History();
  this.registerDisposable(this.history_);
  
  // Hack to resolve history firing twice issues.  This is from: 
  // https://code.google.com/p/closure-library/issues/detail?id=449
  // goog.events.unlisten(this.history_.window_, goog.events.EventType.POPSTATE, 
  //    this.history_.onHistoryEvent_, false, this.history_);
  goog.events.unlisten(this.history_.window_, goog.events.EventType.HASHCHANGE, 
      this.history_.onHistoryEvent_, false, this.history_);
};
goog.inherits(pn.app.Router, pn.app.EventHandlerTarget);


/**
 * Enable the router and parse the first history token.
 * @param {!Object.<function(?):undefined>} routes The routes to use in this
 *    application.
 */
pn.app.Router.prototype.initialise = function(routes) {
  pn.ass(routes);

  this.routes_ = routes;
  if (!this.defaultRoute) {
    this.defaultRoute = goog.object.getKeys(this.routes_)[0];
  }
  this.setEnabled_(true);
  this.history_.setEnabled(true);
};


/** @return {string} The current history token. */
pn.app.Router.prototype.getCurrentToken = function() {
  return this.history_.getToken();
};


/** @return {string} The last history token. */
pn.app.Router.prototype.getLastToken = function() {
  return this.stack_[this.stack_.length - 1] || this.defaultRoute;
};


/** Goes back to last history state */
pn.app.Router.prototype.back = function() {
  var to = this.stack_[this.stack_.length - 2] || this.defaultRoute;
  this.history_.setToken(to);
};


/**
 * Replacing a token means that the existing browser location will be removed
 *    from the stack, both from the internal stack and the browser history
 *    stack.
 * @param {!string} path The token to replace the current token with.
 */
pn.app.Router.prototype.replaceLocation = function(path) {
  pn.ass(path);

  this.stack_.pop();
  if (path !== this.history_.getToken()) {
    // This will trigger a NAVIGATE event which will inturn call navigateImpl_
    this.history_.replaceToken(path);
  } else {
    // replaceLocation can also be used to reload the current page.  However,
    // in that case the above "this.history_.replaceToken" will not fire
    // the NAVIGATE event so we manually call navigateImpl_.  NOTE: This
    // manual navigateImpl_ will not fire the NAVIGATING event and can hence
    // not be cancelled.  This is a bug but allowing cancelling of a replace
    // location call can lead to its own complications.
    this.navigateImpl_(path);
  }
};


/**
 * Navigating to a path will add that path to the history stack.  Meaning the
 *    current page will be navigateable by calling router.back() or pressing
 *    the browser back button.
 * @param {!string} path The full route path to navigate to.
 */
pn.app.Router.prototype.navigate = function(path) {
  pn.ass(path);
  this.log_.fine('path: ' + path + ' added to history stack');
  // This will trigger a NAVIGATE event which will inturn call navigateImpl_
  this.history_.setToken(path);
};


/**
 * @private
 * @param {goog.history.Event} e The history event.
 * TODO: This is being called twice when back is pressed.
 */
pn.app.Router.prototype.onNavigate_ = function(e) {
  this.log_.fine('onNavigate isNavigation: ' + e.isNavigation);

  if (!this.fireNavigating_()) { this.undoLastNavigation_(); }
  else { this.navigateImpl_(e.token); }
};


/**
 * @private
 * @return {boolean} False if this navigation event is cancelled.
 */
pn.app.Router.prototype.fireNavigating_ = function() {  
  var e = new goog.events.Event(pn.app.Router.EventType.NAVIGATING);
  var continuing = this.dispatchEvent(e);
  this.log_.fine('fireNavigating_ continuing: ' + continuing);
  return continuing;
};


/** @private */
pn.app.Router.prototype.undoLastNavigation_ = function() {
  var last = this.stack_[this.stack_.length - 1] || this.defaultRoute;
  this.log_.fine('undoLastNavigation_ replacing: ' +
      this.history_.getToken() + ' with: ' + last);

  this.setEnabled_(false);
  this.history_.setToken(last);
  this.setEnabled_(true);
};


/**
 * @private
 * @param {boolean} enabled Wether the router is enabled. If not enabled no
 *    navigate events will be fired.
 */
pn.app.Router.prototype.setEnabled_ = function(enabled) {
  var historyEvent = goog.history.EventType.NAVIGATE;
  this.unlistenTo(this.history_, historyEvent, this.onNavigate_);
  if (!enabled) { return; }

  this.listenTo(this.history_, historyEvent, this.onNavigate_);
};


/**
 * @private
 * @param {!string} path The full route path to navigate to.
 */
pn.app.Router.prototype.navigateImpl_ = function(path) {
  pn.ass(goog.isString(path) && path !== '*');

  this.log_.fine('navigateImpl_ path: ' + path);
  if (!path) {
    this.log_.fine('navigateImpl empty path going to defaultRoute');
    this.history_.setToken(this.defaultRoute);
    return;
  }

  var tokens = path.split('/');
  var to = tokens.splice(0, 1)[0] || this.defaultRoute;
  this.log_.fine('navigateImpl path: ' + path + ' to: ' + to);

  var route = this.routes_[to];
  if (!route) {
    // Use the global route handler if specified (named '*')
    route = this.routes_['*'];
    tokens.unshift(to);
  }
  if (!route) { throw new Error('Route [' + path + '] not supported'); }

  var goingBack = path === this.stack_[this.stack_.length - 2];
  if (goingBack) {
    this.stack_.pop();
    this.stack_.pop();
  }

  this.stack_.push(path);
  route.apply(this, tokens);
  this.log_.fine('navigateImpl_ path: ' + path + ' stack: ' + this.stack_);
};


/** @enum {string} */
pn.app.Router.EventType = {
  NAVIGATING: 'navigating'
};

;
goog.provide('pn.Router');

goog.require('goog.History');
goog.require('goog.events.EventHandler');
goog.require('goog.history.EventType');
goog.require('pn.LogUtils');



/**
 * @constructor
 * @extends {goog.Disposable}
 * @param {!Object.<function(?):undefined>} routes The registered routes.
 * @param {!string} defaultRoute The default route when non is specified.
 * @param {boolean=} opt_invisible True to use hidden history states instead 
 *    of the user-visible location hash.
 */
pn.Router = function(routes, defaultRoute, opt_invisible) {
  goog.asserts.assert(routes);
  goog.asserts.assert(defaultRoute);

  goog.Disposable.call(this);

  /**
   * @private
   * @type {goog.debug.Logger}
   */
  this.log_ = pn.LogUtils.getLogger('pn.Router');

  /**
   * @private
   * @type {!Object.<function(?):undefined>}
   */
  this.routes_ = routes;

  /**
   * @private
   * @type {!string}
   */
  this.defaultRoute_ = defaultRoute;

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
    this.navigateImpl(e.token, false);
  });
  this.history_.setEnabled(true);
};
goog.inherits(pn.Router, goog.Disposable);


/** Goes back to last history state */
pn.Router.prototype.back = function() {
  this.historyStack_.pop(); // Ignore current page
  var to = this.historyStack_.pop();
  this.log_.fine('back: ' + to);
  this.navigateImpl(to, false);
};


/**
 * @param {!string} path The full route path to navigate to.
 * @param {boolean=} opt_ignoreHistory Wether to ignore this event from the
 *    history.
 */
pn.Router.prototype.navigate = function(path, opt_ignoreHistory) {
  goog.asserts.assert(path);
  var ignore = goog.isDefAndNotNull(opt_ignoreHistory) && opt_ignoreHistory;
  if (!ignore) {
    this.log_.fine('path: ' + path + ' added to history stack');
    this.history_.setToken(path);
  } else {
    this.navigateImpl(path, true);
  }  
};

/**
 * @private
 * @param {!string} path The full route path to navigate to.
 * @param {boolean=} opt_ignoreHistory Wether to ignore this event from the
 *    history.
 */
pn.Router.prototype.navigateImpl = function(path, opt_ignoreHistory) {  
  if (!path) {    
    this.log_.fine('navigateImpl empty path going to defaultRoute');
    this.history_.setToken(this.defaultRoute_);
    return;
  }
  
  var tokens = path.split('/');
  var to = tokens.splice(0, 1)[0] || this.defaultRoute_;
  var ignore = goog.isDefAndNotNull(opt_ignoreHistory) && opt_ignoreHistory;

  var msg = 'navigateImpl path: ' + path + ' to: ' + to + ' ignore: ' + ignore;
  this.log_.fine(msg);

  var route = this.routes_[to];
  if (!route) {
    var msg = 'Navigation token [' + path + '] not supported';
    // Exception is being swallowed by the goog.History framework 
    // so alert it. window['alert'](msg);
    throw new Error(msg);
  }

  if (!ignore) { this.historyStack_.push(path); }
  route.apply(this, tokens);
};

/** @inheritDoc */
pn.Router.prototype.disposeInternal = function() {
  pn.Router.superClass_.disposeInternal.call(this);
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

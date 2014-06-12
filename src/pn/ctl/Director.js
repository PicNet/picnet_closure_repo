goog.provide('pn.ctl.Director');

goog.require('goog.Disposable');
goog.require('pn.log');



/**
 * @constructor
 * @extends {goog.Disposable}
 * @param {function(string,!Element,
 *    function(!pn.ctl.BaseController):undefined):undefined} ctlFactory
 *    A strategy for creating controllers that are passed back in a callback.
 */
pn.ctl.Director = function(ctlFactory) {
  pn.assFun(ctlFactory);

  goog.Disposable.call(this);

  /** @private @type {!goog.debug.Logger} */
  this.log_ = pn.log.getLogger('pn.ctl.Director');

  /**
   * @private
   * @type {function(string,!Element,
   *    function(!pn.ctl.BaseController):undefined):undefined}
   */
  this.ctlFactory_ = ctlFactory;

  /** @private @type {pn.ctl.BaseController} */
  this.current_ = null;

  /** @private @type {pn.ctl.BaseDialog} */
  this.currentDialog_ = null;

  /** @private @type {!Array.<!Array>} The navigation stack*/
  this.stack_ = [];

  this.init_();
};
goog.inherits(pn.ctl.Director, goog.Disposable);


/** @return {pn.ctl.BaseController} */
pn.ctl.Director.prototype.currentController = function() {
  return this.current_;
};


/**
 * @param {!Array.<string>} actions A list of valid back targets for this
 *    current page.
 * @return {Array.<string>} The back action arguments or null if no valid back
 *    target is found.
 */
pn.ctl.Director.prototype.getValidBack = function(actions) {
  pn.assArr(actions);
  if (!!this.stack_.length) this.stack_.pop(); // Ignore current page
  while (!!this.stack_.length) {
    var step = this.stack_.pop();
    var stepAction = step[0];
    if (!this.validBacks_ || actions.pncontains(stepAction)) return step;
  }
  return null;
};


/** @return {!Array.<*>} The current page token . */
pn.ctl.Director.prototype.currentToken = function() {
  return !this.stack_.length ? [] : this.stack_.pnlast();
};


/** @private */
pn.ctl.Director.prototype.init_ = function() {
  this.log_.fine('initialising the director.');
  if (!goog.userAgent.WINDOWS) {
    if (goog.userAgent.ANDROID) goog.dom.classes.add(document.body, 'android');
    if (goog.userAgent.IPAD) goog.dom.classes.add(document.body, 'ipad');
    if (goog.userAgent.IPHONE) goog.dom.classes.add(document.body, 'iphone');
  }
  pn.toarr(goog.dom.getElementsByClass('page')).
      pnconcat(pn.toarr(goog.dom.getElementsByClass('dialog'))).
      pnforEach(function(el) { pn.dom.show(el, false); });
};


/**
 * * Steps to switching/showwing controllers/views:
 *    1) Fire 'hiding' on current
 *    2) Fire 'showing' on new
 *    3) Fire 'hid' on current
 *    3) Fire 'shown' on new
 * 'hiding' and 'showing' are cancellable.
 * @param {boolean} isback Wether we are comming from a back invokation.
 * @param {string} id The ID of the controller to get
 * @param {...*} var_args Any additional arguments passed to the controller.
 */
pn.ctl.Director.prototype.show = function(isback, id, var_args) {
  pn.assBool(isback);
  pn.assStr(id);

  this.log_.fine('show: ' + id);
  if (!!this.current_ && !this.current_.hiding()) {
    this.log_.fine('show existing - current vetoed hiding');
    return;
  }
  var newel = pn.dom.get(id + '-page'),
      args = pn.toarr(arguments);
  args.splice(2, 0, newel);
  args.splice(3, 0, function(newc) {
    if (newc instanceof pn.ctl.BaseDialog)
      throw new Error('Controller: ' + id + ' should not inherit from Dialog');
    if (!newc.showing()) {
      goog.dispose(newc);
      this.log_.fine('show existing - new controller vetoed showing');
      return;
    }

    if (this.current_) {
      this.disposeController_(this.current_);
      this.current_ = null;
      // On change of page hide any active dialog.  This assumes that the
      //    dialog triggered the page change and is no longer required.  E.g.
      //    the task actions dialog.
      if (this.currentDialog_ &&
          !this.currentDialog_.isDisposed() &&
          this.currentDialog_.hasshown) {
        this.disposeController_(this.currentDialog_);
      }
      this.currentDialog_ = null;
    }

    this.showNewController_(newc, id);
  }.pnbind(this));

  this.stack_.push(pn.toarr(arguments));
  this.get_.apply(this, args);
};


/**
 * @param {boolean} isback Wether we are comming from a back invokation.
 * @param {string} id The ID of the dialog to get
 * @param {function(*):undefined=} opt_cb The callback on dialog close.
 * @param {...*} var_args Any additional arguments passed to the controller.
 */
pn.ctl.Director.prototype.showDialog = function(isback, id, opt_cb, var_args) {
  pn.assBool(isback);
  pn.assStr(id);
  pn.ass(!opt_cb || goog.isFunction(opt_cb));

  var args = pn.toarr(arguments),
      el = pn.dom.get(id + '-dialog'),
      pages,
      top;
  args[2] = el;
  args.splice(3, 0, function(newc) {
    if (!(newc instanceof pn.ctl.BaseDialog))
      throw new Error('Controller: ' + id + ' should inherit from Dialog');

    var crrentel = !!this.current_ ? this.current_.el : null;
    this.currentDialog_ = newc;
    if (crrentel) {
      pages = pn.dom.get('pages');
      top = pages.scrollTop;
      pn.dom.show(crrentel, false);
    }
    pn.dom.show(el, true);

    if (opt_cb) this.currentDialog_.onsubmit(opt_cb);
    if (crrentel) {
      this.currentDialog_.onhide(goog.bind(function() {
        pn.dom.show(crrentel, true);
        pages.scrollTop = top;
        this.disposeController_(this.currentDialog_);
        this.currentDialog_ = null;
      }, this));
    }
    goog.Timer.callOnce(this.currentDialog_.shown, 0, this.currentDialog_);
  }.pnbind(this));
  this.get_.apply(this, args);
};


/** @private @param {!pn.ctl.BaseController} c @param {string} id */
pn.ctl.Director.prototype.showNewController_ = function(c, id) {
  pn.assInst(c, pn.ctl.BaseController);
  this.current_ = c;

  window.scroll(0, 0);

  this.moveReusableControlls_(c.el);
  pn.dom.show(c.el, true);
  c.shown();

  this.log_.fine('new controller shown [' + id + ']');
};


/** @private @param {!Element} el */
pn.ctl.Director.prototype.moveReusableControlls_ = function(el) {
  pn.assInst(el, HTMLElement);

  var controls = pn.dom.get('reusable-header-controls'),
      target = goog.dom.getElementByClass(
          'header-reusable-controls-target', el);
  if (!target) {
    pn.dom.show(controls, false);
    target = document.body;
  }
  else { pn.dom.show(controls, true); }
  goog.dom.append(/** @type {!Node} */ (target), controls);
};


/** @private @param {pn.ctl.BaseController} controller */
pn.ctl.Director.prototype.disposeController_ = function(controller) {
  if (!controller) return;

  pn.dom.show(controller.el, false);
  controller.hid();
  goog.dispose(controller);
};


/**
 * @private
 * @param {boolean} isback Wether we are navigating from a back button.
 * @param {string} id The ID of the controller to get
 * @param {!Element} el The div that represents this view.
 * @param {function(!pn.ctl.BaseController):undefined} cb The callback to
 *    pass the loaded controller to.
 * @param {...*} var_args Any additional arguments passed to the controller.
 */
pn.ctl.Director.prototype.get_ = function(isback, id, el, cb, var_args) {
  pn.assBool(isback);
  pn.assStr(id);
  pn.assInst(el, HTMLElement);
  pn.assFun(cb);
  this.ctlFactory_.apply(this, arguments);
};


/** @override */
pn.ctl.Director.prototype.disposeInternal = function() {
  pn.ctl.Director.superClass_.disposeInternal.call(this);

  this.disposeController_(this.current_);
  if (!!this.currentDialog_ && !this.currentDialog_.isDisposed())
    this.disposeController_(this.currentDialog_);
  this.current_ = this.currentDialog_ = null;
};

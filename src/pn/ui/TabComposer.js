;
goog.provide('pn.ui.TabComposer');

goog.require('goog.ui.TabBar');



/**
 * @constructor
 * @extends {goog.ui.Component}
 * @param {string} idpfx The id prefix to use on all control IDs.
 * @param {string} template The template to use for the display.
 */
pn.ui.TabComposer = function(idpfx, template) {
  goog.ui.Component.call(this);

  pn.assStr(idpfx);
  pn.assStr(template);

  /**
   * @private
   * @const
   * @type {string}
   */
  this.idpfx_ = idpfx;

  /**
   * @private
   * @const
   * @type {string}
   */
  this.template_ = template;

  /**
   * @private
   * @const
   * @type {!goog.ui.TabBar}
   */
  this.tabs_ = new goog.ui.TabBar();
  this.registerDisposable(this.tabs_);
};
goog.inherits(pn.ui.TabComposer, goog.ui.Component);


/** @override */
pn.ui.TabComposer.prototype.decorateInternal = function(element) {
  pn.ui.TabComposer.superClass_.decorateInternal.call(this, element);

  this.setElementInternal(element);

  var wrapper = goog.dom.createDom('div', { 'id': this.idpfx_ + '-wrapper' }),
      div = goog.dom.createDom('div', { 'id': this.idpfx_ });

  div.innerHTML = this.template_;

  goog.dom.appendChild(wrapper, div);
  goog.dom.appendChild(element, wrapper);

  this.tabs_.decorate(pn.dom.get(this.idpfx_ + '-tabs'));

  var tabid = goog.net.cookies.get(this.idpfx_ + '-tabid');
  var tabidx = 0;
  if (tabid) {
    var ids = this.tabs_.getChildIds();
    tabidx = ids.pnfindIndex(function(id) { return id === tabid; });
  }
  this.tabs_.setSelectedTabIndex(Math.max(0, tabidx));
};


/** @override */
pn.ui.TabComposer.prototype.enterDocument = function() {
  pn.ui.TabComposer.superClass_.enterDocument.call(this);

  var et = goog.ui.Component.EventType;
  this.getHandler().listen(this.tabs_, et.SELECT, this.tabSelected_);
  goog.Timer.callOnce(this.tabSelected_, 1, this);
};


/** @return {Array.<string>} The tabs in this composer. */
pn.ui.TabComposer.prototype.getTabIds = function() {
  return this.tabs_.getChildIds();
};


/** @private */
pn.ui.TabComposer.prototype.tabSelected_ = function() {
  var selid = this.tabs_.getSelectedTab().getId() || this.getTabIds()[0];
  goog.net.cookies.set(this.idpfx_ + '-tabid', selid, -1);

  goog.array.forEach(this.getTabIds(), function(id) {
    var dom = pn.dom.get('content-' + id);
    pn.dom.show(dom, id === selid);
  });
};

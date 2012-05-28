
goog.require('goog.Timer');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.events');
goog.require('goog.fx.Animation');
goog.require('goog.fx.easing');
goog.require('goog.style');
goog.require('goog.userAgent');

goog.require('pn.dom');
goog.require('pn.ui.TabSlideMenuSettings');

goog.provide('pn.ui.TabSlideMenu');



/**
 * This is a google closure port of: 'tabSlideOUt v2.0, a jQuery plugin to
 * create a slideout UI element with a tabHandle'.
 *
 * Ported with the kind permission of original author William Paoli
 *  wpaoli@building58.com
 *
 * Original project published under the MIT license, Copyright (c) 2010 William
 *  Paoli
 * http://creativecommons.org/licenses/MIT/
 *
 * @constructor
 * @param {Element} element The element to turn into a slide menu.  This element
 *    should contain the tabHandler element.
 * @param {pn.ui.TabSlideMenuSettings} args The settings for this slide
 *    menu.
 */
pn.ui.TabSlideMenu = function(element, args) {

  /**
   * @private
   * @type {Element}
   */
  this.element_ = element;


  /**
   * @private
   * @type {boolean}
   */
  this.slidingIn_;


  /**
   * @private
   * @type {goog.fx.Animation}
   */
  this.anim_;


  /**
   * @private
   * @type {{containerWidth: number,containerHeight: number,tabWidth: number,
   *    tabHeight:number}}
   */
  this.properties_;


  /**
   * @private
   * @type {pn.ui.TabSlideMenuSettings}
   */
  this.settings_ =
      new pn.ui.TabSlideMenuSettings();


  this.initialise_(args);
};


/**
 * @param {pn.ui.TabSlideMenuSettings} args The settings for this slide
 *    menu.
 * @private
 */
pn.ui.TabSlideMenu.prototype.initialise_ = function(args) {
  this.settings_.tabHandle = args.tabHandle;
  this.settings_.toggleButton = args.toggleButton || '.open-close-tab';
  this.settings_.toggleButton =
      pn.dom.getElement(this.settings_.toggleButton);

  this.settings_.speed = args.speed || 300;
  this.settings_.action = args.action || 'click';
  this.settings_.tabLocation = args.tabLocation || 'left';
  this.settings_.topPos = goog.isDefAndNotNull(args.topPos) ? args.topPos : 200;
  this.settings_.leftPos = goog.isDefAndNotNull(args.leftPos) ?
      args.leftPos : 20;
  this.settings_.fixedPosition = args.fixedPosition || false;
  this.settings_.positioning = this.settings_.fixedPosition ?
      'fixed' : (args.positioning || 'absolute');
  this.settings_.pathToTabImage = args.pathToTabImage || null;
  this.settings_.imageHeight = args.imageHeight || null;
  this.settings_.imageWidth = args.imageWidth || null;
  this.settings_.onLoadSlideOut = args.onLoadSlideOut || false;
  this.settings_.handleOffset = args.handleOffset || 0;
  if (goog.isDefAndNotNull(this.settings_.pathToTabImage)) {
    this.settings_.tabHandle.style.backgroundImage =
        'url("' + this.settings_.pathToTabImage + '")';
    this.settings_.tabHandle.style.backgroundRepeat = 'no-repeat';
    this.settings_.tabHandle.style.width = this.settings_.imageWidth + 'px';
    this.settings_.tabHandle.style.height = this.settings_.imageHeight + 'px';
  }
  this.settings_.tabHandle.style.display = 'block';
  this.settings_.tabHandle.style.textIndent = '-99999px';
  this.settings_.tabHandle.style.outline = 'none';
  this.settings_.tabHandle.style.position = 'absolute';

  this.element_.style['line-height'] = 1;
  this.element_.style.position = this.settings_.positioning;

  var elemSize = goog.style.getSize(this.element_);
  var tabHandleSize = goog.style.getSize(this.settings_.tabHandle);

  this.properties_ = {
    containerWidth: elemSize.width,
    containerHeight: elemSize.height,
    tabWidth: tabHandleSize.width,
    tabHeight: tabHandleSize.height,
    // If user is using IE9 + then use the 'right' style property for hiding
    // right hand side menus
    rightStyleProperty:
        goog.userAgent.IE && parseInt(
        goog.userAgent.VERSION.charAt(0), 10) >= 0 ? 'right' : 'marginRight'
  };
  if (this.settings_.tabLocation === 'top' ||
      this.settings_.tabLocation === 'bottom') {
    this.element_.style.left = this.settings_.leftPos + 'px';
    this.settings_.tabHandle.style.right = this.settings_.handleOffset + 'px';
  }

  if (this.settings_.tabLocation === 'top') {
    this.element_.style.top = this.properties_.containerHeight + 'px';
    this.settings_.tabHandle.style.bottom =
        '-' + this.properties_.tabHeight + 'px';
  }

  if (this.settings_.tabLocation === 'bottom') {
    this.element_.style.bottom =
        '-' + this.properties_.containerHeight + 'px;position:fixed';
    this.settings_.tabHandle.style.top =
        '-' + this.properties_.tabHeight + 'px';

  }

  if (this.settings_.tabLocation === 'left') {
    this.element_.style.height = this.properties_.containerHeight + 'px';
    this.element_.style.top = this.settings_.topPos + 'px';
    this.element_.style.marginLeft = '-' +
        this.properties_.containerWidth + 'px';

    this.settings_.tabHandle.style.top = this.settings_.handleOffset + 'px';
    this.settings_.tabHandle.style.right = '-' +
        this.properties_.tabWidth + 'px';
  }

  if (this.settings_.tabLocation === 'right') {
    var container = goog.dom.htmlToDocumentFragment(
        '<div id="' + this.element_.id +
        '-slider-container" class="slider-container" style="height:' +
        this.properties_.containerHeight + 'px;top:' + this.settings_.topPos +
        'px;padding-left:' + this.properties_.tabWidth +
        'px;position:absolute;overflow:hidden;right:0px;"></div>');
    this.element_.style[this.properties_.rightStyleProperty] = '-' +
        this.properties_.containerWidth + 'px';
    this.element_.style.position = 'relative';
    this.settings_.tabHandle.style.left = '-' +
        this.properties_.tabWidth + 'px';
    this.settings_.tabHandle.style.top = this.settings_.handleOffset + 'px';

    goog.dom.replaceNode(container, this.element_);
    goog.dom.appendChild(container, this.element_);

    goog.dom.getDocument().body.style['overflow-x'] = 'hidden';
  }

  goog.events.listen(this.settings_.tabHandle, goog.events.EventType.CLICK,
      function(event) { event.preventDefault(); }, false, this);

  if (this.settings_.toggleButton) {
    goog.events.listen(this.settings_.toggleButton, goog.events.EventType.CLICK,
        function(event) { event.preventDefault(); }, false, this);
  }

  this.anim_ = new goog.fx.Animation([0, 0], [100, 100], 200,
      goog.fx.easing.easeOut);
  var events = [goog.fx.Animation.EventType.BEGIN,
    goog.fx.Animation.EventType.ANIMATE, goog.fx.Animation.EventType.END];
  goog.events.listen(this.anim_, events, this.onAnimate_, false, this);

  if (this.settings_.action === 'click') { this.clickAction_(); }
  if (this.settings_.action === 'hover') { this.hoverAction_(); }
  if (this.settings_.onLoadSlideOut) { this.slideOutOnLoad_(); }
};


/**
 * @private
 * @param {goog.events.Event} e The animation event.
 */
pn.ui.TabSlideMenu.prototype.onAnimate_ = function(e) {
  var percentage = e.x;

  if (this.settings_.tabLocation === 'top') {
    this.element_.style.top = '-' +
        this.getPositionAtPercentage_(this.properties_.containerHeight,
        percentage) + 'px';
  } else if (this.settings_.tabLocation === 'left') {
    this.element_.style.marginLeft = '-' +
        this.getPositionAtPercentage_(this.properties_.containerWidth,
        percentage) + 'px';
  } else if (this.settings_.tabLocation === 'right') {
    this.element_.style[this.properties_.rightStyleProperty] = '-' +
        this.getPositionAtPercentage_(this.properties_.containerWidth,
        percentage) + 'px';
  } else if (this.settings_.tabLocation === 'bottom') {
    this.element_.style.bottom = '-' +
        this.getPositionAtPercentage_(this.properties_.containerHeight,
        percentage) + 'px';
  }

  if (e.type === goog.fx.Animation.EventType.END) {
    if (this.slidingIn_) {
      goog.dom.classes.remove(this.element_, 'open');
      if (this.settings_.onClose) this.settings_.onClose();
    } else {
      goog.dom.classes.add(this.element_, 'open');
      if (this.settings_.onOpen) this.settings_.onOpen();
    }
  }
};


/**
 * @private
 * @param {number} dimension The dimension to find corresponding position.
 * @param {number} progress The percentage progress through the animation.
 * @return {number} The corresponding position.
 */
pn.ui.TabSlideMenu.prototype.getPositionAtPercentage_ = function(dimension, 
    progress) {
  var size = dimension + 3;
  var shift = size * (progress / 100.0);
  return Math.max(0, (this.slidingIn_ ? (-3 + shift) : (size - shift)));
};


/**
 * @private
 */
pn.ui.TabSlideMenu.prototype.slideIn_ = function() {
  if (this.slidingIn_ === true) { return; }
  this.slidingIn_ = true;
  this.anim_.play();
};


/**
 * @private
 */
pn.ui.TabSlideMenu.prototype.slideOut_ = function() {
  if (this.slidingIn_ === false) { return; }
  this.slidingIn_ = false;
  this.anim_.play();
};


/**
 * @private
 */
pn.ui.TabSlideMenu.prototype.clickScreenToClose_ = function() {
  goog.events.listen(this.element_, goog.events.EventType.CLICK,
      function(event) { event.stopPropagation(); }, false, this);
  if (this.settings_.toggleButton) {
    goog.events.listen(/** @type {Element} */ (this.settings_.toggleButton),
        goog.events.EventType.CLICK, function(event) {
          event.stopPropagation();
        }, false, this);
  }
  goog.events.listen(goog.dom.getDocument().body, goog.events.EventType.CLICK,
      function(event) { this.slideIn_(); }, false, this);
};


/**
 * @private
 */
pn.ui.TabSlideMenu.prototype.clickAction_ = function() {
  goog.events.listen(this.settings_.tabHandle, goog.events.EventType.CLICK,
      this.handleClickAction_, false, this);
  if (this.settings_.toggleButton) {
    goog.events.listen(/** @type {Element} */ (this.settings_.toggleButton),
        goog.events.EventType.CLICK, this.handleClickAction_, false, this);
  }
  this.clickScreenToClose_();
};


/**
 * @private
 * @param {Event} event The click mouse event.
 */
pn.ui.TabSlideMenu.prototype.handleClickAction_ = function(event) {
  if (goog.dom.classes.has(this.element_, 'open')) {
    this.slideIn_();
  } else { this.slideOut_(); }
};


/**
 * @private
 */
pn.ui.TabSlideMenu.prototype.hoverAction_ = function() {
  goog.events.listen(this.settings_.tabHandle, goog.events.EventType.MOUSEOVER,
      function() {
        if (!goog.dom.classes.has(this.element_, 'open')) {
          this.slideOut_();
        }
      }, false, this);
  goog.events.listen(this.settings_.tabHandle, goog.events.EventType.MOUSEOUT,
      function() {
        if (goog.dom.classes.has(this.element_, 'open')) {
          goog.Timer.callOnce(this.slideIn_, 1000, this);
        }
      }, false, this);

  goog.events.listen(this.settings_.tabHandle, goog.events.EventType.CLICK,
      function(event) {
        if (goog.dom.classes.has(this.element_, 'open')) { this.slideIn_(); }
      }, false, this);
  if (this.settings_.toggleButton) {
    goog.events.listen(/** @type {Element} */ (this.settings_.toggleButton),
        goog.events.EventType.CLICK, function(event) {
          if (goog.dom.classes.has(this.element_, 'open')) { this.slideIn_(); }
          else { this.slideOut_(); }
        }, false, this);
  }
  this.clickScreenToClose_();
};


/**
 * @private
 */
pn.ui.TabSlideMenu.prototype.slideOutOnLoad_ = function() {
  goog.Timer.callOnce(this.slideOut_, 500, this);
};

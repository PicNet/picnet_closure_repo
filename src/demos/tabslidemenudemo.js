
goog.provide('pn.demo.tabslidemenudemo');

goog.require('pn.ui.TabSlideMenu');
goog.require('pn.ui.TabSlideMenuSettings');

/**
 * @export
 */
pn.demo.tabslidemenudemo = function() {
  var opts = new pn.ui.TabSlideMenuSettings();
  opts.tabHandle = goog.dom.getElement('panel1_handle');
  opts.pathToTabImage = 'images/window_left_tab.png';
  opts.imageHeight = 153;
  opts.imageWidth = 19;
  opts.tabLocation = 'left';
  opts.speed = 150;
  opts.action = 'click';
  opts.topPos = 100;
  opts.fixedPosition = false;
  opts.onLoadSlideOut = true;
  new pn.ui.TabSlideMenu(goog.dom.getElement('panel1'), opts);

  opts.tabHandle = goog.dom.getElement('panel2_handle');
  opts.pathToTabImage = 'images/window_right_tab.png';
  opts.imageHeight = 102;
  opts.imageWidth = 18;
  opts.tabLocation = 'right';
  new pn.ui.TabSlideMenu(goog.dom.getElement('panel2'), opts);
};
goog.exportSymbol('pn.demo.tabslidemenudemo',
    pn.demo.tabslidemenudemo);

    
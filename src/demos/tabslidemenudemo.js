
goog.provide('picnet.demo.tabslidemenudemo');

goog.require('picnet.ui.TabSlideMenu');
goog.require('picnet.ui.TabSlideMenuSettings');

/**
 * @export
 */
picnet.demo.tabslidemenudemo = function() {
  var opts = new picnet.ui.TabSlideMenuSettings();
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
  new picnet.ui.TabSlideMenu(goog.dom.getElement('panel1'), opts);

  opts.tabHandle = goog.dom.getElement('panel2_handle');
  opts.pathToTabImage = 'images/window_right_tab.png';
  opts.imageHeight = 102;
  opts.imageWidth = 18;
  opts.tabLocation = 'right';
  new picnet.ui.TabSlideMenu(goog.dom.getElement('panel2'), opts);
};
goog.exportSymbol('picnet.demo.tabslidemenudemo',
    picnet.demo.tabslidemenudemo);

    
;
goog.provide('pn.mob.Utils');


/**
 * @return {boolean} Wether we are runnin in a phonegap environment or in a
 *   or just in a browser.
 */
pn.mob.Utils.isPhonegap = function() {
  return (typeof(window['cordova']) !== 'undefined' ||
      typeof(window['phonegap']) !== 'undefined');
};

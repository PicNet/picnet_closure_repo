;
goog.provide('pn.mob.AudioPlayer');

goog.require('goog.Disposable');
goog.require('pn.mob.Utils');



/**
 * @constructor
 * @extends {goog.Disposable}
 * @param {string=} opt_dir The optional directory containing the audio media.
 */
pn.mob.AudioPlayer = function(opt_dir) {
  pn.ass(!opt_dir || goog.isString(opt_dir));

  goog.Disposable.call(this);

  /**
   * @private
   * @type {string}
   */
  this.dir_ = opt_dir || '';

  /**
   * @private
   * @type {Object}
   */
  this.media_ = null;

  /**
   * @private
   * @type {!Object}
   */
  this.html5Audio_ = !pn.mob.Utils.isPhonegap() ? new window['Audio']() : null;
};
goog.inherits(pn.mob.AudioPlayer, goog.Disposable);


/** @param {string} src The media file to play. */
pn.mob.AudioPlayer.prototype.play = function(src) {
  pn.assStr(src);

  var fullsrc = this.getPath_(src);
  if (this.html5Audio_) {
    this.html5Audio_['src'] = fullsrc;
    this.html5Audio_['play']();
  } else {
    if (this.media_) this.media_['release']();
    this.media_ = new window['Media'](fullsrc);
    this.media_['play']();
  }
};


/**
 * @private
 * @param {string} src The source file to play, relative to this.dir_.
 * @return {string} The fully qualified path to play which can work on any
 *    supported device.
 */
pn.mob.AudioPlayer.prototype.getPath_ = function(src) {
  pn.assStr(src);

  var full = this.dir_ + src;
  if (!pn.mob.Utils.isPhonegap()) return full;
  var p = window.location.pathname;
  p = p.substr(0, p.length - 10);
  return p + full;
};


/** Stop the currently playing media. */
pn.mob.AudioPlayer.prototype.stop = function() {
  if (this.html5Audio_) {
    this.html5Audio_['stop']();
  } else {
    this.media_['stop']();
    delete this.media_;
  }
};

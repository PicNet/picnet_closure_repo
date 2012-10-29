;
goog.provide('pn.mob.AudioPlayer');

goog.require('goog.Disposable');



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
  this.html5Audio_ = !window['Media'] ? new window['Audio']() : null;
};
goog.inherits(pn.mob.AudioPlayer, goog.Disposable);


/** @param {string} src The media file to play. */
pn.mob.AudioPlayer.prototype.play = function(src) {
  pn.assStr(src);

  var fullsrc = this.dir_ + src;
  if (this.html5Audio_) {
    this.html5Audio_['src'] = fullsrc;
    this.html5Audio_['play']();
  } else {
    this.media_ = new window['Media'](fullsrc);
    this.media_['play']();
  }
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

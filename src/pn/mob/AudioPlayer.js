;
goog.provide('pn.mob.AudioPlayer');

goog.require('goog.Disposable');
goog.require('pn.mob.Utils');



/**
 * @constructor
 * @extends {goog.Disposable}
 * @param {string} dir The optional directory containing the audio media.
 */
pn.mob.AudioPlayer = function(dir) {
  pn.assStr(dir);

  goog.Disposable.call(this);

  /**
   * @private
   * @type {string}
   */
  this.dir_ = dir;

  /**
   * @private
   * @type {!Object.<!Object>}
   */
  this.medias_ = {};

  /**
   * @private
   * @type {!Object}
   */
  this.html5Audio_ = !pn.mob.Utils.isPhonegap() ? new window['Audio']() : null;
};
goog.inherits(pn.mob.AudioPlayer, goog.Disposable);


/** @param {string} src The media file to preload. */
pn.mob.AudioPlayer.prototype.preload = function(src) {
  pn.ass(!(src in this.medias_), '%s - already loaded'.pnsubs(src));

  // Preloading only supported in phonegap environment
  if (!pn.mob.Utils.isPhonegap()) return;
  this.medias_[src] = new window['Media'](this.getPath_(src));
};


/** @param {string} src The media file to play. */
pn.mob.AudioPlayer.prototype.play = function(src) {
  pn.assStr(src);

  if (this.html5Audio_) {
    this.html5Audio_['src'] = this.getPath_(src);
    this.html5Audio_['play']();
  } else {
    var media = this.medias_[src];
    if (!media) {
      media = this.medias_[src] = new window['Media'](this.getPath_(src));
    }
    media['play']();
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


/** @param {string} src The media file to stop. */
pn.mob.AudioPlayer.prototype.stop = function(src) {
  if (this.html5Audio_) {
    pn.ass(goog.string.endsWith(this.html5Audio_['src'], src));
    this.html5Audio_['stop']();
  } else {
    pn.ass(src in this.medias_);

    this.medias_[src]['stop']();
  }
};


/** @override */
pn.mob.AudioPlayer.prototype.disposeInternal = function() {
  for (var i in this.medias_) { this.medias_[i]['release'](); }
  this.medias_ = {};

  pn.mob.AudioPlayer.superClass_.disposeInternal.call(this);
};

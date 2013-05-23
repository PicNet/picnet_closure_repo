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
   * @type {boolean}
   */
  this.usePg_ = 1 === 2 && pn.mob.Utils.isPhonegap();

  /**
   * @private
   * @type {!Object.<!Object>}
   */
  this.medias_ = {};
};
goog.inherits(pn.mob.AudioPlayer, goog.Disposable);


/** @param {string} src The media file to preload. */
pn.mob.AudioPlayer.prototype.preload = function(src) {
  pn.ass(!(src in this.medias_), src + ' - already loaded');

  var media = this.medias_[src] = this.createMedia_(src);
  if (!this.usePg_) {
    media['volume'] = 0;
    media['play']();
  }
};


/** @param {string} src The media file to play. */
pn.mob.AudioPlayer.prototype.play = function(src) {
  pn.assStr(src);

  var media = this.medias_[src];
  if (!media) { media = this.medias_[src] = this.createMedia_(src); }
  else { try { media['currentTime'] = 0; } catch (ex) {}} // catch for tests
  media['play']();
};


/**
 * @private
 * @param {string} src The media file to preload.
 * @return {!Object} The created media.
 */
pn.mob.AudioPlayer.prototype.createMedia_ = function(src) {
  var media = this.usePg_ ?
      new window['Media'](this.getPath_(src)) :
      new window['Audio']();
  if (!this.usePg_) {
    media['preload'] = 'auto';
    media['autobuffer'] = 'true';
    media['src'] = this.getPath_(src);
  }
  return media;
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
  if (!this.usePg_) return full;

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
  if (this.usePg_) {
    for (var i in this.medias_) { this.medias_[i]['release'](); }
  }
  this.medias_ = {};

  pn.mob.AudioPlayer.superClass_.disposeInternal.call(this);
};

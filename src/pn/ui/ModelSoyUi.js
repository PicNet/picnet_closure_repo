
goog.provide('pn.ui.ModelSoyUi');

/**
 * @param {!Element} el The element that will hold the html.
 * @param {string} html The template html.
 * @param {!pn.model.ModelBase} model The model to synchronize to this view
 */
pn.ui.ModelSoyUi = function(el, html, model) {

  /**
   * @private
   * @type {string}
   */
  this.el_ = el;

  /**
   * @private
   * @type {string}
   */
  this.html_ = html;

  /**
   * @private
   * @type {!goog.events.EventHandler}
   */
  this.eh_ = new goog.events.EventHandler();
  this.registerDisposable(this.eh_);

  /**
   * @private
   * @type {!pn.model.ModelBase}
   */
  this.model_ = model;

  this.refresh_(true);
};

/** 
 * @private
 * @param {boolean} attachEvents Wether to attach event listeners to the 
 *    generated control.
 */
pn.ui.ModelSoyUi.prototype.refresh_ = function(attachEvents) {
  var newhtml = this.html_.replace(/{([^{}]*)}/g, goog.bind(function(a, b) {
    var r = this.model_[b];    
    if (attachEvents && goog.isString(r) && 
        goog.string.startsWith(r, 'listen:')) { 

      return r; 
    }
    return typeof r === 'string' || typeof r === 'number' ? r : a;
  }, this));
};

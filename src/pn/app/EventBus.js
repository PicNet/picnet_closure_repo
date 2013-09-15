;
goog.provide('pn.app.EventBus');

goog.require('goog.debug.Logger');
goog.require('goog.pubsub.PubSub');



/**
 * @constructor
 * @extends {goog.Disposable}
 * @param {boolean} async Wether the pub sub functionality should be async.
 */
pn.app.EventBus = function(async) {
  goog.Disposable.call(this);

  /**
   * @private
   * @const
   * @type {boolean}
   */
  this.async_ = async;

  /**
   * @private
   * @type {goog.debug.Logger}
   */
  this.log_ = pn.log.getLogger('pn.app.BaseApp');

  /**
   * @private
   * @type {goog.pubsub.PubSub}
   */
  this.pubsub_ = new goog.pubsub.PubSub();
  this.registerDisposable(this.pubsub_);
};
goog.inherits(pn.app.EventBus, goog.Disposable);


/**
 * @param {string} topic Topic to publish to.
 * @param {...*} var_args Arguments that are applied to each subscription
 *    function.
 */
pn.app.EventBus.prototype.pub = function(topic, var_args) {
  pn.ass(topic);
  pn.ass(this.pubsub_.getCount(topic) > 0,
      'No subscribers found [' + topic + ']');

  var msg = topic;
  if (var_args && typeof(var_args) === 'string' && var_args.length < 20)
    msg += ' ' + var_args;
  this.log_.fine(msg);

  this.pubsub_.publish.apply(this.pubsub_, arguments);
};


/**
 * Use this method to to subscribe to the stream of events.
 *
 * @param {string} topic The topic to subscribe to.
 * @param {Function} callback The callback to call on the publishing
 *    of the specified topic.
 * @param {Object=} opt_handler The optional object to use as the callback
 *    context.
 */
pn.app.EventBus.prototype.sub = function(topic, callback, opt_handler) {
  var handler = opt_handler || this;
  var cb = goog.bind(callback, handler);
  if (this.asyncPubSub_) {
    this.pubsub_.subscribe(topic, function() { goog.Timer.callOnce(cb, 0); });
  } else {
    this.pubsub_.subscribe(topic, cb);
  }
};

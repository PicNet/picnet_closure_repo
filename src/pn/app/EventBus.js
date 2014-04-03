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

  /**
   * @private
   * @type {string}
   */
  this.topic_ = '';
};
goog.inherits(pn.app.EventBus, goog.Disposable);


/**
 * @param {string} topic Topic to publish to.
 * @param {...*} var_args Arguments that are applied to each subscription
 *    function.
 */
pn.app.EventBus.prototype.pub = function(topic, var_args) {
  pn.ass(topic);

  var cnt = this.pubsub_.getCount(topic),
      msg = (this.topic_ = topic) + ' subscribers[' + cnt + '] ';
  if (var_args && typeof(var_args) === 'string' && var_args.length < 20)
    msg += ' ' + var_args;

  this.log_.fine(msg);

  if (cnt === 0) { return; }

  this.pubsub_.publish.apply(this.pubsub_, arguments);
};


/**
 * Use this method to to subscribe to the stream of events.
 *
 * @param {string} topic The topic to subscribe to.
 * @param {Function} cb The callback to call on the publishing
 *    of the specified topic.
 */
pn.app.EventBus.prototype.sub = function(topic, cb) {
  if (this.asyncPubSub_) {
    this.pubsub_.subscribe(topic, function() { goog.Timer.callOnce(cb, 0); });
  } else {
    this.pubsub_.subscribe(topic, cb);
  }
};


/**
 * Use this method to to subscribe to the stream of events.
 *
 * @param {string} topic The topic to subscribe to.
 * @param {Function} cb The callback to call on the publishing
 *    of the specified topic.
 */
pn.app.EventBus.prototype.unsub = function(topic, cb) {
  if (this.asyncPubSub_) {
    throw new Error('Unsubscribe not supported in async EventBus mode.');
  }
  this.pubsub_.unsubscribe(topic, cb);
};


/** @return {string} The current topic being submitted. */
pn.app.EventBus.prototype.topic = function() { return this.topic_; };

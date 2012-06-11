
goog.provide('pn.rx');

goog.require('goog.events');
goog.require('goog.events.EventHandler');
goog.require('goog.net.EventType');
goog.require('goog.net.XhrIo');


/**
 * @private
 * @type {goog.events.EventHandler}
 */
pn.rx.eh_;


/**
 * Adds a listener to the specified target
 * @param  {!goog.events.EventHandler} target The target to add the event
 *    listener to.
 * @param  {string} type The event type to subscribe to.
 * @return {!Rx.Observable} The RxJS Observable object.
 */
pn.rx.listen = function(target, type) {
  if (!pn.rx.eh_) pn.rx.eh_ = new goog.events.EventHandler();
  return Rx.Observable.create(function(observer) {
    var handler = function(eventObject) {
      observer.onNext(eventObject);
    };
    pn.rx.eh_.listen(target, type, handler);
    return function() {
      pn.rx.eh_.unlisten(target, type, handler);
    };
  });
};


/**
 * Converts an array to an RxJS Observable.
 * @param  {!Array} arr The array to convert to an Observable object.
 * @return {!Rx.Observable} The RxJS Observable object.
 */
pn.rx.array = function(arr) {
  return Rx.Observable.fromArray(arr);
};


/**
 * Creates an RxJS Observable from an ajax request.
 * @param  {string} url The ajax request url.
 * @param  {goog.net.XhrIo=} opt_xhr An optional instance of a goog.net.XhrIo
 *   this should really only be used for testing.
 * @return {!Rx.Observable} The RxJS Observable object.
 */
pn.rx.ajax = function(url, opt_xhr) {
  if (!pn.rx.eh_) pn.rx.eh_ = new goog.events.EventHandler();

  var as = new Rx.AsyncSubject();
  var xhr = opt_xhr || new goog.net.XhrIo();
  var onComplete = function(e) {
    if (xhr.isSuccess()) {
      as.onNext(xhr);
      as.onCompleted();
      pn.rx.eh_.unlisten(xhr, goog.net.EventType.COMPLETE, onComplete);
      goog.dispose(xhr);
    } else {
      as.onError(xhr);
      pn.rx.eh_.unlisten(xhr, goog.net.EventType.COMPLETE, onComplete);
      goog.dispose(xhr);
    }
  };
  pn.rx.eh_.listen(xhr, goog.net.EventType.COMPLETE, onComplete);
  xhr.send(url);
  return as;
};

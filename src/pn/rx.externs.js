// TODO: The externs should be generated from the rx-vsdoc.js file included in 
// the rx.js distributable.  This was generated from the actual Rx namespace
// object and is hence lacking in any type information and documentation which 
// is available in the rx-vsdoc.js file.


var Rx = function() {};

/** 
 * @constructor 
 * @extends {Rx.Disposable}
 */
Rx.CompositeDisposable = function() {};

/** @type {Rx.CompositeDisposable} */
Rx.prototype.CompositeDisposable;

/** 
 * @constructor
 * @implements {goog.disposable.IDisposable}
 */
Rx.Disposable = function() {};

/** @inheritDoc */
Rx.Disposable.prototype.dispose = function() {};

/** @inheritDoc */
Rx.Disposable.prototype.isDisposed = function() {};

/** @type {Rx.Disposable} */
Rx.prototype.Disposable;

/**
 * @param {*} a
 * @return {!Rx.Disposable}
 */
Rx.Disposable.create = function(a) {};

/** @constructor */
function empty() {};

/** @type {empty} */
Rx.Disposable.prototype.empty;
empty.prototype.dispose = function() {};

/** 
 * @constructor 
 * @extends {Rx.Disposable}
 */
Rx.SingleAssignmentDisposable = function() {};

/** @type {Rx.SingleAssignmentDisposable} */
Rx.prototype.SingleAssignmentDisposable;

/** @constructor */
Rx.SerialDisposable = function() {};

/** @type {Rx.SerialDisposable} */
Rx.prototype.SerialDisposable;

/** @constructor */
Rx.RefCountDisposable = function() {};

/** @type {Rx.RefCountDisposable} */
Rx.prototype.RefCountDisposable;

/** @constructor */
Rx.Scheduler = function() {};

/** @type {Rx.Scheduler} */
Rx.prototype.Scheduler;
Rx.Scheduler.prototype.now = function() {};

/**
 * @param {*} a
 * @return {*}
 */
Rx.Scheduler.prototype.normalize = function(a) {};

/** @constructor */
Rx.VirtualTimeScheduler = function() {};

/** @type {Rx.VirtualTimeScheduler} */
Rx.prototype.VirtualTimeScheduler;
Rx.VirtualTimeScheduler.prototype.now = function() {};

/**
 * @param {*} a
 * @return {*}
 */
Rx.VirtualTimeScheduler.prototype.normalize = function(a) {};

/** @constructor */
Rx.Notification = function() {};

/** @type {Rx.Notification} */
Rx.prototype.Notification;

/**
 * @param {*} a
 * @return {*}
 */
Rx.Notification.createOnNext = function(a) {};

/**
 * @param {*} a
 * @return {*}
 */
Rx.Notification.createOnError = function(a) {};

/**
 * @return {*}
 */
Rx.Notification.createOnCompleted = function() {};

/** 
 * @constructor 
 * @extends {Rx.Disposable}
 */
Rx.Observer = function() {};

/** @type {Rx.Observer} */
Rx.prototype.Observer;

/**
 * @param {*} a
 * @param {*} b
 * @param {*} c
 * @return {!Rx.Observer}
 */
Rx.Observer.create = function(a,b,c) {};

/**
 * @param {*} a
 * @return {*}
 */
Rx.Observer.fromNotifier = function(a) {};

/**
 * @param {*} a
 */
Rx.Observer.prototype.onNext = function(a) {};

/** 
 * @constructor 
 * @extends {Rx.Disposable}
 */
Rx.Observable = function() {};

/** @type {Rx.Observable} */
Rx.prototype.Observable;

/**
 * @param {*} a
 */
Rx.Observable.prototype.onNext = function(a) {};

/**
 * @param {*} a
 */
Rx.Observable.prototype.onCompleted = function(a) {};

/**
 * @param {*} a
 */
Rx.Observable.prototype.onError = function(a) {};

/**
 * @param {*} a
 * @param {*} b
 * @param {*} c
 * @param {*} d
 * @return {*}
 */
Rx.Observable.prototype.start = function(a,b,c,d) {};

/**
 * @param {*} a
 * @param {*} b
 * @return {*}
 */
Rx.Observable.prototype.toAsync = function(a,b) {};

/**
 * @return {*}
 */
Rx.Observable.prototype.never = function() {};

/**
 * @param {*} a
 * @param {*} b
 * @return {*}
 */
Rx.Observable.prototype.returnValue = function(a,b) {};

/**
 * @param {*} a
 * @param {*} b
 * @return {*}
 */
Rx.Observable.prototype.throwException = function(a,b) {};

/**
 * @param {*} a
 * @param {*} b
 * @param {*} c
 * @param {*} d
 * @param {*} e
 * @return {*}
 */
Rx.Observable.prototype.generate = function(a,b,c,d,e) {};

/**
 * @param {*} a
 * @return {*}
 */
Rx.Observable.prototype.defer = function(a) {};

/**
 * @param {*} a
 * @param {*} b
 * @return {*}
 */
Rx.Observable.prototype.using = function(a,b) {};

/**
 * @param {*} a
 * @param {*=} opt_b
 * @return {!Rx.Observable}
 */
Rx.Observable.fromArray = function(a,opt_b) {};

/**
 * @param {*} a
 * @return {*}
 */
Rx.Observable.createWithDisposable = function(a) {};

/**
 * @param {*} a
 * @return {!Rx.Observable}
 */
Rx.Observable.create = function(a) {};

/**
 * @param {*} a
 * @param {*} b
 * @param {*} c
 * @return {*}
 */
Rx.Observable.prototype.range = function(a,b,c) {};

/**
 * @param {*} a
 * @param {*} b
 * @param {*} c
 * @return {*}
 */
Rx.Observable.prototype.repeat = function(a,b,c) {};

/**
 * @param {*} a
 * @return {*}
 */
Rx.Observable.prototype.merge = function(a) {};

/**
 * @return {*}
 */
Rx.Observable.prototype.concat = function() {};

/**
 * @return {*}
 */
Rx.Observable.prototype.catchException = function() {};

/**
 * @return {*}
 */
Rx.Observable.prototype.onErrorResumeNext = function() {};

/**
 * @return {*}
 */
Rx.Observable.prototype.amb = function() {};

/** 
 * @constructor 
 * @extends {Rx.Observable}
 */
Rx.Subject = function() {};

/** @type {Rx.Subject} */
Rx.prototype.Subject;

/**
 * @param {*} a
 * @param {*} c
 * @return {!Rx.Subject}
 */
Rx.Subject.create = function(a,c) {};

/**
 * @param {*} a
 * @return {!Rx.Subject}
 */
Rx.Subject.fromNotifier = function(a) {};

/** 
 * @constructor 
 * @extends {Rx.Subject}
 */
Rx.AsyncSubject = function() {};

/** @type {Rx.AsyncSubject} */
Rx.prototype.AsyncSubject;

/**
 * @param {*} a
 * @param {*} b
 * @param {*} c
 * @return {!Rx.AsyncSubject}
 */
Rx.AsyncSubject.create = function(a,b,c) {};

/**
 * @param {*} a
 * @return {!Rx.AsyncSubject}
 */
Rx.AsyncSubject.fromNotifier = function(a) {};

/** @constructor */
Rx.BehaviorSubject = function() {};

/** @type {Rx.BehaviorSubject} */
Rx.prototype.BehaviorSubject;

/**
 * @param {*} a
 * @param {*} b
 * @param {*} c
 * @return {!Rx.BehaviorSubject}
 */
Rx.BehaviorSubject.create = function(a,b,c) {};

/**
 * @param {*} a
 * @return {!Rx.BehaviorSubject}
 */
Rx.BehaviorSubject.fromNotifier = function(a) {};

/** @constructor */
Rx.ReplaySubject = function() {};

/** @type {Rx.ReplaySubject} */
Rx.prototype.ReplaySubject;
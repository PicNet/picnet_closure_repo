// TODO: The externs should be generated from the rx-vsdoc.js file included in 
// the rx.js distributable.  This was generated from the actual Rx namespace
// object and is hence lacking in any type information and documentation which 
// is available in the rx-vsdoc.js file.

var Rx = function() {};
/** @constructor */
Rx.CompositeDisposable = function() {};
/** @type {Rx.CompositeDisposable} */
Rx.prototype.CompositeDisposable;
/** @constructor */
Rx.Disposable = function() {};
/** @type {Rx.Disposable} */
Rx.prototype.Disposable;
/**
 * @param {*} a
 * @return {*}
 */
Rx.Disposable.prototype.create = function(a) {};
/** @constructor */
function empty() {};
/** @type {empty} */
Rx.Disposable.prototype.empty;
empty.prototype.dispose = function() {};
/** @constructor */
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
function base() {};
/** @type {base} */
Rx.VirtualTimeScheduler.prototype.base;
/**
 * @param {*} a
 * @return {*}
 */
base.prototype.schedule = function(a) {};
/**
 * @param {*} a
 * @param {*} b
 * @return {*}
 */
base.prototype.scheduleWithState = function(a,b) {};
/**
 * @param {*} a
 * @param {*} b
 * @return {*}
 */
base.prototype.scheduleWithRelative = function(a,b) {};
/**
 * @param {*} a
 * @param {*} b
 * @param {*} c
 * @return {*}
 */
base.prototype.scheduleWithRelativeAndState = function(a,b,c) {};
/**
 * @param {*} a
 * @param {*} b
 * @return {*}
 */
base.prototype.scheduleWithAbsolute = function(a,b) {};
/**
 * @param {*} a
 * @param {*} b
 * @param {*} c
 * @return {*}
 */
base.prototype.scheduleWithAbsoluteAndState = function(a,b,c) {};
/**
 * @param {*} a
 * @return {*}
 */
base.prototype.scheduleRecursive = function(a) {};
/**
 * @param {*} a
 * @param {*} c
 * @return {*}
 */
base.prototype.scheduleRecursiveWithState = function(a,c) {};
/**
 * @param {*} a
 * @param {*} b
 * @return {*}
 */
base.prototype.scheduleRecursiveWithRelative = function(a,b) {};
/**
 * @param {*} a
 * @param {*} b
 * @param {*} d
 * @return {*}
 */
base.prototype.scheduleRecursiveWithRelativeAndState = function(a,b,d) {};
/**
 * @param {*} a
 * @param {*} b
 * @return {*}
 */
base.prototype.scheduleRecursiveWithAbsolute = function(a,b) {};
/**
 * @param {*} a
 * @param {*} b
 * @param {*} c
 * @return {*}
 */
base.prototype.scheduleRecursiveWithAbsoluteAndState = function(a,b,c) {};
/** @constructor */
Rx.Notification = function() {};
/** @type {Rx.Notification} */
Rx.prototype.Notification;
/**
 * @param {*} a
 * @return {*}
 */
Rx.Notification.prototype.createOnNext = function(a) {};
/**
 * @param {*} a
 * @return {*}
 */
Rx.Notification.prototype.createOnError = function(a) {};
/**
 * @return {*}
 */
Rx.Notification.prototype.createOnCompleted = function() {};
/** @constructor */
Rx.Observer = function() {};
/** @type {Rx.Observer} */
Rx.prototype.Observer;
/**
 * @param {*} a
 * @param {*} b
 * @param {*} c
 * @return {Rx.Observer}
 */
Rx.Observer.prototype.create = function(a,b,c) {};
/**
 * @param {*} a
 * @return {*}
 */
Rx.Observer.prototype.fromNotifier = function(a) {};
/** @constructor */
Rx.Observable = function() {};
/** @type {Rx.Observable} */
Rx.prototype.Observable;
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
 * @return {*}
 */
Rx.Observable.prototype.empty = function(a) {};
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
 * @param {*} b
 * @return {*}
 */
Rx.Observable.prototype.fromArray = function(a,b) {};
/**
 * @param {*} a
 * @return {*}
 */
Rx.Observable.prototype.createWithDisposable = function(a) {};
/**
 * @param {*} a
 * @return {*}
 */
Rx.Observable.prototype.create = function(a) {};
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
/** @constructor */
Rx.Subject = function() {};
/** 
 * @constructor 
 * @extends {Rx.Observable}
 */
Rx.prototype.Subject;
/**
 * @param {*} a
 * @param {*} c
 * @return {*}
 */
Rx.Subject.prototype.create = function(a,c) {};
/**
 * @param {*} a
 * @return {*}
 */
Rx.Subject.prototype.fromNotifier = function(a) {};
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
 * @return {*}
 */
Rx.AsyncSubject.prototype.create = function(a,b,c) {};
/**
 * @param {*} a
 * @return {*}
 */
Rx.AsyncSubject.prototype.fromNotifier = function(a) {};
/** @constructor */
Rx.BehaviorSubject = function() {};
/** @type {Rx.BehaviorSubject} */
Rx.prototype.BehaviorSubject;
/**
 * @param {*} a
 * @param {*} b
 * @param {*} c
 * @return {*}
 */
Rx.BehaviorSubject.prototype.create = function(a,b,c) {};
/**
 * @param {*} a
 * @return {*}
 */
Rx.BehaviorSubject.prototype.fromNotifier = function(a) {};
/** @constructor */
Rx.ReplaySubject = function() {};
/** @type {Rx.ReplaySubject} */
Rx.prototype.ReplaySubject;
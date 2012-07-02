
goog.provide('pn.model.Collection');

goog.require('pn.model.Model');
goog.require('pn.model.ModelBase');
goog.require('pn.model.TimerInstance');



/**
 * @constructor
 * @extends {pn.model.ModelBase}
 * @param {!Array.<!Object>} src The source array to create the model from.
 */
pn.model.Collection = function(src) {
  goog.asserts.assert(goog.isArray(src));

  pn.model.ModelBase.call(this);

  /**
   * @private
   * @type {!Array.<!Object>}
   */
  this.src_ = src;

  this.models_ = goog.array.map(src, function(e) {
    return new pn.model.Model(e, false);
  });

  pn.model.TimerInstance.register(this);
};
goog.inherits(pn.model.Collection, pn.model.ModelBase);


/** @override */
pn.model.Collection.prototype.getChanges = function() {
  var changes = [],
      arridx = -1,
      last = null,
      now = null,
      len = this.models_.length;
  for (var idx = 0; idx < len; idx++) {
    var model = this.models_[idx];
    last = model.src_;
    now = this.src_[++arridx];

    if (!this.areSame(last, now)) {
      // Items at same index do not match
      if (!goog.isDef(now)) {
        // This this element is undefined then it was probably deleted with
        // delete array[idx] notation.  All indexes in this case remain the same
        changes.push({idx: idx, item: last, removed: true});
      } else if (this.areSame(last, this.src_[arridx + 1])) {
        arridx++;
        // If the expected item is the same as the next item in the current arr
        // then the current item was inserted.
        changes.push({idx: idx, item: now, inserted: true});
      } else if (this.areSame(this.models_[idx + 1].src_, now)) {
        // Otherwise if the current arr val is the same as the next 'last' value
        // then the 'last' value was removed.
        arridx--;
        changes.push({idx: idx, item: last, removed: true});
      } else {
        // Unfortunatelly the whole model will need to be reset as we cannot
        // determine what happened. This means that this algorithm only supports
        // single element insertion / deletion.
        return [{notsupported: true}];
      }
    } else {
      // Lets see if internal model details have changed.  I.e. Items could
      // be referentially the same but still have different property values.
      var mchanges = model.getChanges();
      if (mchanges.length) {
        changes.push({idx: idx, item: model.src_, changes: mchanges});
      }
    }
  }

  // Get all the new entities at the end of the array.
  while (now = this.src_[++arridx]) {
    changes.push({idx: arridx, item: now, inserted: true});
  }
  return changes;
};


/**
 * @typedef {
 *    {idx:number, item: !Object, changes: !Array.<pn.model.Model.Change>}
 *  }
 */
pn.model.Collection.CollectionChange;

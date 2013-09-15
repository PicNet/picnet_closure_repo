
goog.require('pn.ui.filter.FilterState');
goog.require('pn.ui.filter.GenericListFilterOptions');

goog.provide('pn.ui.filter.TableFilterOptions');



/**
 * @export
 * @extends {pn.ui.filter.GenericListFilterOptions}
 * @constructor
 */
pn.ui.filter.TableFilterOptions = function() {
  pn.ui.filter.GenericListFilterOptions.call(this);
};
goog.inherits(pn.ui.filter.TableFilterOptions,
    pn.ui.filter.GenericListFilterOptions);


/** @type {string} */
pn.ui.filter.TableFilterOptions.prototype['selectOptionLabel'] = 'Select...';


/** @type {Element} */
pn.ui.filter.TableFilterOptions.prototype['frozenHeaderTable'] = null;

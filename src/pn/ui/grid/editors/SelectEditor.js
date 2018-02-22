;
goog.provide('pn.ui.grid.editors.SelectEditor');



/**
 * @constructor
 * @param {{grid: Slick.Grid,
 *    column: {options: string, field: string }, container: !Element }}
 *    args The arguments for this editor.
 */
pn.ui.grid.editors.SelectEditor = function(args) {
  pn.assObj(args);
  pn.assObj(args['column']);

  /**
   * @private
   * @type {{grid: Slick.Grid,
   *    column: {options: string, field: string }, container: !Element }}
   */
  this.args_ = args;

  /**
   * @private
   * @type {jQuery}
   */
  this.ctl_;

  /**
   * @private
   * @type {string}
   */
  this.defaultv_;

  this.init_();
};


/** @private */
pn.ui.grid.editors.SelectEditor.prototype.init_ = function() {
  // Emptuy option for usability
  var values = ['', 'yes', 'no'];
  if (this.args_['column']['options']) {
    values = [''].pnconcat(this.args_['column']['options'].split(','));
  }
  var str = '';
  values.pnforEach(function(v) {
    str += "<OPTION value='" + v + "'>" + v + '</OPTION>';
  });
  this.ctl_ = $("<SELECT tabIndex='0' class='editor-select'>" +
      str + '</SELECT>');
  this.ctl_.appendTo(this.args_['container']);
  this.ctl_.focus();
  this.ctl_.change(this.args_['grid'].getEditorLock()['commitCurrentEdit']);
};


/** @export */
pn.ui.grid.editors.SelectEditor.prototype.destroy = function() {
  this.ctl_.remove();
};


/** @export */
pn.ui.grid.editors.SelectEditor.prototype.focus = function() {
  this.ctl_.focus();
};


/**
 * @export
 * @param {!Object} item The item to load.
 */
pn.ui.grid.editors.SelectEditor.prototype.loadValue = function(item) {
  pn.assObj(item);

  this.defaultv_ = item[this.args_['column']['field']] || '';
  this.ctl_.val(this.defaultv_);
};


/**
 * @export
 * @return {string|boolean} The value of the current select control.
 */
pn.ui.grid.editors.SelectEditor.prototype.serializeValue = function() {
  var val = /** @type {string} */ (this.ctl_.val());
  if (this.args_['column']['options']) {
    return val;
  } else {
    return (val == 'yes');
  }
};


/**
 * @export
 * @param {!Object} item The item to save the value to.
 * @param {string} state The value selected.
 */
pn.ui.grid.editors.SelectEditor.prototype.applyValue = function(item, state) {
  pn.assObj(item);
  pn.assStr(state);

  item[this.args_['column']['field']] = state;
};


/**
 * @export
 * @return {boolean} Wether the value is dirty (has changed).
 */
pn.ui.grid.editors.SelectEditor.prototype.isValueChanged = function() {
  return (this.ctl_.val() != this.defaultv_);
};


/**
 * @export
 * @return {{valid:boolean, msg:string?}} The validation information for
 *    this control.
 */
pn.ui.grid.editors.SelectEditor.prototype.validate = function() {
  return {
    'valid': true,
    'msg': null
  };
};

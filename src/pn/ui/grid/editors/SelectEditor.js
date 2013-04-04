;
goog.provide('pn.ui.grid.editors.SelectEditor');



/**
 * @constructor
 * @param {{
 *    column: {
 *      options: string,
 *      field: string
 *    },
 *    container: !Element
 * }} args The arguments for this editor.
 */
pn.ui.grid.editors.SelectEditor = function(args) {
  pn.assObj(args);
  pn.assObj(args.column);

  var $select,
      defaultValue,
      values,
      str;

  this.init = function() {
    if (args.column.options) { values = args.column.options.split(','); }
    else { values = ['yes', 'no']; }
    str = '';
    values.pnforEach(function(v) {
      str += "<OPTION value='" + v + "'>" + v + '</OPTION>';
    });
    $select = $("<SELECT tabIndex='0' class='editor-select'>" +
        str + '</SELECT>');
    $select.appendTo(args.container);
    $select.focus();
  };

  this.destroy = function() {
    $select.remove();
  };

  this.focus = function() {
    $select.focus();
  };

  this.loadValue = function(item) {
    defaultValue = item[args.column.field];
    $select.val(defaultValue);
  };

  this.serializeValue = function() {
    if (args.column.options) {
      return $select.val();
    } else {
      return ($select.val() == 'yes');
    }
  };

  this.applyValue = function(item, state) {
    item[args.column.field] = state;
  };

  this.isValueChanged = function() {
    return ($select.val() != defaultValue);
  };

  this.validate = function() {
    return {
      valid: true,
      msg: null
    };
  };

  this.init();
};

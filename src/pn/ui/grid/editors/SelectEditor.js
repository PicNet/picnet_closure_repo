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
  pn.assObj(args['column']);

  var $select,
      defaultValue,
      values,
      str;

  /** @expose */
  this.init = function() {
    if (args['column']['options']) { values = args['column']['options'].split(','); }
    else { values = ['yes', 'no']; }
    str = '';
    values.pnforEach(function(v) {
      str += "<OPTION value='" + v + "'>" + v + '</OPTION>';
    });
    $select = $("<SELECT tabIndex='0' class='editor-select'>%s</SELECT>".
        pnsubs(str));
    $select.appendTo(args['container']);
    $select.focus();
    $select.change(args.grid.getEditorLock().commitCurrentEdit);
  };

  /** @expose */
  this.destroy = function() {
    $select.remove();
  };

  /** @expose */
  this.focus = function() {
    $select.focus();
  };

  /** @expose */
  this.loadValue = function(item) {
    defaultValue = item[args['column']['field']];
    $select.val(defaultValue);
  };

  /** @expose */
  this.serializeValue = function() {
    if (args['column']['options']) {
      return $select.val();
    } else {
      return ($select.val() == 'yes');
    }
  };

  /** @expose */
  this.applyValue = function(item, state) {
    item[args['column']['field']] = state;
  };

  /** @expose */
  this.isValueChanged = function() {
    return ($select.val() != defaultValue);
  };

  /** @expose */
  this.validate = function() {
    return {
      valid: true,
      msg: null
    };
  };

  this.init();
};

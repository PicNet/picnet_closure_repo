;
goog.provide('pn.ui.WebDefaultRenderer');

goog.require('pn.ui.IDefaultRenderer');



/**
 * @constructor
 * @implements {pn.ui.IDefaultRenderer}
 */
pn.ui.WebDefaultRenderer = function() {};


/** @override */
pn.ui.WebDefaultRenderer.prototype.getDefaultRenderer =
    function(spec, opt_readonly) {
  var schema = spec.id.indexOf('.') >= 0 ? null :
      pn.data.TypeRegister.getFieldSchema(spec.entitySpec.type, spec.id),
      tatl = 0,
      st = schema ? schema.type : '',
      drofr = {},
      dfr = {};
  // In tests pn.app.ctx.cfg is usually not defined and also not important for
  // most tests.
  try {
    tatl = pn.app.ctx.cfg.defaultFieldRenderers.textAreaLengthThreshold;
    drofr = pn.app.ctx.cfg.defaultReadOnlyFieldRenderers;
    dfr = pn.app.ctx.cfg.defaultFieldRenderers;
  } catch (e) {}

  if (st === 'string' && tatl && schema.length > tatl) { st = 'LongString'; }
  var readonly = opt_readonly || spec.readonly;
  if (pn.data.EntityUtils.isParentProperty(spec.dataProperty) &&
      !spec.tableType) {
    return readonly ?
        pn.ui.edit.ReadOnlyFields.entityParentListField :
        pn.ui.edit.FieldRenderers.entityParentListField;
  } else if (spec.tableType) {
    return readonly ?
        pn.ui.edit.ReadOnlyFields.itemList :
        pn.ui.edit.FieldGridRenderers.childEntitiesTableRenderer;
  } else if (readonly) {
    if (!schema) throw Error('could not find schema for field: ' + spec.id);
    return drofr[st] || pn.ui.edit.ReadOnlyFields.textField;
  } else {
    if (!schema) throw Error('could not find schema for field: ' + spec.id);
    return dfr[st] || pn.ui.edit.FieldRenderers.textFieldRenderer;
  }
};


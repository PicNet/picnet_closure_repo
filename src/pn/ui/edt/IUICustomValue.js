
goog.require('goog.ui.Component');

goog.provide('picnet.ui.IUICustomValue');

/**
 * @interface
 */
picnet.ui.IUICustomValue = function() {};
/**
 * @param {!picnetdata.externs.FieldDescription} template
 * @param {!Element} parent
 * @return {undefined|!Element|!goog.ui.Component}
 */
picnet.ui.IUICustomValue.prototype.buildControl = function(template, parent) {};
/**
 * @param {!picnetdata.externs.IEntity} entity
 * @param {!picnetdata.externs.FieldDescription} template
 * @param {!Element|!goog.ui.Component} control
 * @return *
 */
picnet.ui.IUICustomValue.prototype.getControlValue = function(entity, template, control) {};
/**
 * @param {!picnetdata.externs.FieldDescription} template
 * @param {!Element|!goog.ui.Component} control
 * @param {!picnetdata.externs.IEntity} entity
 * @param {!*} value
 * @return {boolean}
 */
picnet.ui.IUICustomValue.prototype.setControlValue = function(template, control, entity, value) {};
/**
 * @param {!picnetdata.externs.FieldDescription} template
 * @param {!*} value
 * @return {string|undefined}
 */
picnet.ui.IUICustomValue.prototype.getDisplayValue = function(template, value) {};
/**
 * @param {!picnetdata.externs.FieldDescription} field
 * @param {!picnetdata.externs.IEntity} entityData
 * @return {string|undefined}
 */
picnet.ui.IUICustomValue.prototype.getEntityListCustomFieldValue = function(field, entityData) {};
/**
 * @param {!picnetdata.externs.FieldDescription} field
 * @return string
 */
picnet.ui.IUICustomValue.prototype.getEntityListCustomFieldDataType = function(field) {};

/**
 * @param {boolean} edit
 * @param {string} command
 * @param {!picnetdata.externs.IEntity} entity 
 * @return {boolean}
 */
picnet.ui.IUICustomValue.prototype.canShowCustomEntityEditCommand = function(edit, command, entity) {};

/**
 * @param {string} command
 * @param {!picnetdata.externs.IEntity} entity 
 */
picnet.ui.IUICustomValue.prototype.customEntityEditCommand = function(command, entity) {};
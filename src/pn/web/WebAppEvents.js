;
goog.provide('pn.web.WebAppEvents');


/** @enum {string} */
pn.web.WebAppEvents = {

  // MESSAGES
  CLEAR_MESSAGE: 'clear-message',
  SHOW_MESSAGE: 'show-message',
  SHOW_MESSAGES: 'show-messages',
  SHOW_ERROR: 'show-error',
  SHOW_ERRORS: 'show-errors',

  // EDIT / GRID
  ENTITY_SELECT: 'entity-select',
  LIST_EXPORT: 'list-export',
  LIST_ORDERED: 'list-ordered',
  ENTITY_ADD: 'entity-add',
  CHILD_ENTITY_ADD: 'child-entity-add',
  ENTITY_VALIDATION_ERROR: 'entity-validation-error',

  // DIALOG
  DALOG_SHOWN: 'dialog-shown',
  DALOG_HIDDEN: 'dialog-hidden'

};

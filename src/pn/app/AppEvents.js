;
goog.provide('pn.app.AppEvents');


/** @enum {string} */
pn.app.AppEvents = {
  // MESSAGES
  CLEAR_MESSAGE: 'clear-message',
  SHOW_MESSAGE: 'show-message',
  SHOW_MESSAGES: 'show-messages',
  SHOW_ERROR: 'show-error',
  SHOW_ERRORS: 'show-errors',
  ENTITY_VALIDATION_ERROR: 'entity-validation-error',

  // EDIT / GRID
  ENTITY_SELECT: 'entity-select',
  LIST_EXPORT: 'list-export',
  LIST_ORDERED: 'list-ordered',
  ENTITY_ADD: 'entity-add',
  CHILD_ENTITY_ADD: 'child-entity-add'
};

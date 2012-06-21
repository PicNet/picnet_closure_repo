;
goog.require('pn.data.GearsRepository');
goog.require('pn.data.IRepository');
goog.require('pn.data.IndexedDBRepository');
goog.require('pn.data.WebSQLRepository');

goog.provide('pn.data.DefaultRepositoryFactory');


/**
 * @private
 * @type {!pn.data.IRepository|undefined}
 */
pn.data.DefaultRepositoryFactory.rep_ = undefined;


/**
 * @param {string} databaseName The name of the database to open or create.
 * @return {!pn.data.IRepository} The created repository.
 */
pn.data.DefaultRepositoryFactory.getRepository = function(databaseName) {
  if (pn.data.DefaultRepositoryFactory.rep_) {
    return pn.data.DefaultRepositoryFactory.rep_;
  }
  var repository;
  // Find the best possible database provider
  if (pn.data.IndexedDBRepository.isSupported()) {
    repository = new pn.data.IndexedDBRepository(databaseName);
  } else if (pn.data.WebSQLRepository.isSupported()) {
    repository = new pn.data.WebSQLRepository(databaseName);
  } else {
    pn.data.GearsRepository.installGears(
        function() { repository = new pn.data.GearsRepository(databaseName); });
  }
  return /** @type {!pn.data.IRepository} */ (repository);
};


/**
 * @param {!pn.data.IRepository} repository The repository to use
 *    (for testing).
 */
pn.data.DefaultRepositoryFactory.setRepository = function(repository) {
  pn.data.DefaultRepositoryFactory.rep_ = repository;
};

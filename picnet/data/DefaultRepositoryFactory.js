;
goog.require('picnet.data.GearsRepository');
goog.require('picnet.data.IRepository');
goog.require('picnet.data.IndexedDBRepository');
goog.require('picnet.data.WebSQLRepository');

goog.provide('picnet.data.DefaultRepositoryFactory');



/**
 * @constructor
 */
picnet.data.DefaultRepositoryFactory = {};


/**
 * @private
 * @type {!picnet.data.IRepository|undefined}
 */
picnet.data.DefaultRepositoryFactory.rep_ = undefined;


/**
 * @param {string} databaseName The name of the database to open or create.
 * @return {!picnet.data.IRepository} The created repository.
 */
picnet.data.DefaultRepositoryFactory.getRepository = function(databaseName) {
  if (picnet.data.DefaultRepositoryFactory.rep_) {
    return picnet.data.DefaultRepositoryFactory.rep_;
  }
  var repository;
  // Find the best possible database provider
  if (picnet.data.WebSQLRepository.isSupported()) {
    repository = new picnet.data.WebSQLRepository(databaseName);
  } else if (picnet.data.IndexedDBRepository.isSupported()) {
    repository = new picnet.data.IndexedDBRepository(databaseName);
  } else {
    picnet.data.GearsRepository.installGears(
        function() {
          repository = new picnet.data.GearsRepository(databaseName);
        }
    );
  }
  return /** @type {!picnet.data.IRepository} */ (repository);
};


/**
 * @param {!picnet.data.IRepository} repository The repository to use
 *    (for testing).
 */
picnet.data.DefaultRepositoryFactory.setRepository = function(repository) {
  picnet.data.DefaultRepositoryFactory.rep_ = repository;
};

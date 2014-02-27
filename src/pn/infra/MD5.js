goog.provide('pn.infra.MD5');

goog.require('goog.crypt');
goog.require('goog.crypt.Md5');


/**
 * @param {string} str The string to hash.
 * @return {string} The hashed string.
 */
pn.infra.MD5.hash = function(str) {
  var md5 = new goog.crypt.Md5();
  md5.update(str);
  return goog.crypt.byteArrayToHex(md5.digest());
};

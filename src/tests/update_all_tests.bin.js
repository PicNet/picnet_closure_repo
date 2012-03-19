var fs = require('fs');

getAllTests(function(tests) {
  writeAllTestsJSFile(tests);
});

function getAllTests(callback) {
  var tests = [];
  fs.readdir(__dirname, function(err, files) {
    for (var i = 0, len = files.length; i < len; i++) {
      var f = files[i];
      if (f.indexOf('.html') > 0 && f !== 'all_tests.html') {        
        tests.push(f);
      }      
    }
    callback(tests);
  });  
};

function writeAllTestsJSFile(allFiles) {
  var contents = "var all_tests = ['" + allFiles.join("','") + "'];";  
  fs.writeFile('all_tests.js', contents, function(err) {    
    if (err)throw err;
    else { console.log('Successfuly updated the all_tests.js file with all tests in this directory'); }
  });  
};
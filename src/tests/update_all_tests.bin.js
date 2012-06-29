var fs = require('fs');

getAllTests(function(all) {
  writeAllTestsJSFile(all);
});

function getAllTests(callback) {
  var all = [];
  fs.readdir(__dirname, function(err, files) {
    for (var i = 0, len = files.length; i < len; i++) {
      var f = files[i];
      if (f.indexOf('.html') > 0 && f !== 'all_tests.html') {
        all.push(f);        
      }      
    }
    callback(all);
  });  
};

function writeAllTestsJSFile(all) {

  var all_contents = "var all_tests = ['" + all.join("','") + "'];";  
  writeContents(all_contents, 'all_tests.js')  ;
};

function writeContents(contents, file) {  
  fs.writeFile(file, contents, function(err) {    
    if (err)throw err;
    else { console.log('Successfuly updated the ' + file +' file with corresponding tests'); }
  });  
};
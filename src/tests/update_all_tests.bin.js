var fs = require('fs');

getAllTests(function(all, seq) {
  writeAllTestsJSFile(all, seq);
});

function getAllTests(callback) {
  var all = [];
  var seq = [];
  fs.readdir(__dirname, function(err, files) {
    for (var i = 0, len = files.length; i < len; i++) {
      var f = files[i];
      if (f.indexOf('.html') > 0 && f !== 'all_tests.html') {
        all.push(f);
        if (f.indexOf('Seq') === 0) {
          seq.push(f)
        }
      }      
    }
    callback(all, seq);
  });  
};

function writeAllTestsJSFile(all, seq) {

  var all_contents = "var all_tests = ['" + all.join("','") + "'];";  
  var seq_contents = "var all_tests = ['" + seq.join("','") + "'];";  
  writeContents(all_contents, 'all_tests.js')  
  writeContents(seq_contents, 'all_seq_tests.js')  
};

function writeContents(contents, file) {  
  fs.writeFile(file, contents, function(err) {    
    if (err)throw err;
    else { console.log('Successfuly updated the ' + file +' file with corresponding tests'); }
  });  
};
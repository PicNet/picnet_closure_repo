For assistance on tablefilter see:
http://www.picnet.com.au/picnet_table_filter.html


How to compile picnet.table.filter.min.js
=========================================
Checkout the closure-library project from SVN (put this anywhere):
svn checkout http://closure-library.googlecode.com/svn/trunk/

Download the closure compiler from:
http://closure-compiler.googlecode.com/files/compiler-latest.zip
Unzip the compiler.jar file and place anywhere.

Dowload and install Python 2.7 (if required) from http://www.python.org/getit/

Download closure templates from http://code.google.com/p/closure-templates/

Modify the compile.bat variables at the top of the file to point to your 
installation directories of the following tools:
PYTHON27_EXEC - Your Python 2.7 exe file
CLOSURE_LIBRARY - The path to your closure-library directory
CLOSURE_TEMPLATES - The path to your closure templates directory
CLOSURE_COMPILER - The path to your compiler.jar

Run the compile_tablefilter.bat file
@ECHO off
cd ..
del tablefilter.zip
cp src\demos\tablefilter_demo.htm tablefilter_demo.htm 
cp src\demos\css\demo.css demo.css
u:\shared\tools\7za a -tzip tablefilter.zip picnet.table.filter.min.js tablefilter_demo.htm tablefilter_readme.txt demo.css
del tablefilter_demo.htm 
del demo.css
cd build
SET /P =New release zip file created. Press Enter to continue...
@ECHO off
del tablefilter.zip
cp src\demos\tablefilter_demo.htm tablefilter_demo.htm 
u:\shared\tools\7za a -tzip tablefilter.zip picnet.table.filter.min.js tablefilter_demo.htm tablefilter_readme.txt
del tablefilter_demo.htm 
SET /P =New release zip file created. Press Enter to continue...
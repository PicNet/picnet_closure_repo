set ARGS=--strict -r src\ ^
-e tests,demos ^
-x src\deps.js,src\pn\slick.grid.externs.js ^
-x src\deps.js,src\pn\rx.externs.js

fixjsstyle %ARGS%
gjslint %ARGS%
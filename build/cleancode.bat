ECHO %CD%
set ARGS=--strict -r src\pn\ ^
--custom_jsdoc_tags expose ^
-x src\deps.js,src\pn\slick.grid.externs.js,src\pn\ui\soy\pn.compiled.soy.js

fixjsstyle %ARGS%
gjslint %ARGS%
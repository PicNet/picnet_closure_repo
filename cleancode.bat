set ARGS=--strict -r src\pn\ ^
-x src\deps.js,src\pn\slick.grid.externs.js,src\pn\rx.externs.js,src\pn\ui\soy\pn.compiled.soy.js

c:\python27\python.exe U:\shared\lib\closure-linter\closure_linter\fixjsstyle.py %ARGS%
c:\python27\python.exe U:\shared\lib\closure-linter\closure_linter\gjslint.py %ARGS%

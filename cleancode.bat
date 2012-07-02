set ARGS=--strict -r src\ ^
-e tests,demos ^
-x src\deps.js,src\pn\slick.grid.externs.js,src\pn\rx.externs.js

python U:\shared\lib\closure-linter\closure_linter\fixjsstyle.py %ARGS%
python U:\shared\lib\closure-linter\closure_linter\gjslint.py %ARGS%

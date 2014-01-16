set DRIVE=%cd:~0,3%
set CLOSURE_LIBRARY=%DRIVE%dev\shared\lib\closure-library\

set CLOSURE_TEMPLATES=%DRIVE%dev\shared\lib\closure-templates\

set CLOSURE_COMPILER=%DRIVE%dev\shared\lib\picnetcompiler.jar

set CLOSURE_TEMPLATES_RELATIVE_URL=../../../../../../../shared/closure-templates/
set BASE=../../../../isis/scripts/lib/picnet_closure_repo/src/

c:\Python27\python.exe ^
  %CLOSURE_LIBRARY%closure\bin\build\depswriter.py ^
  --root_with_prefix="src\ %BASE%" ^
  --root_with_prefix="%CLOSURE_TEMPLATES% %CLOSURE_TEMPLATES_RELATIVE_URL%" ^
  --output_file=src\deps.js
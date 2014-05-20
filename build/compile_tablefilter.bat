set DRIVE=%cd:~0,3%
set PYTHON27_EXEC=python.exe
set CLOSURE_LIBRARY=%DRIVE%dev\shared\lib\closure-library\
set CLOSURE_TEMPLATES=%DRIVE%dev\shared\lib\closure-templates\
set CLOSURE_COMPILER=%DRIVE%dev\shared\lib\compiler.jar

%PYTHON27_EXEC% ^
  %CLOSURE_LIBRARY%closure\bin\build\closurebuilder.py ^
  --namespace="pn.ui.filter.TableFilter" ^
  --namespace="pn.ui.filter.jQueryPlugin" ^
  --root=%CLOSURE_LIBRARY% ^
  --root=%CLOSURE_TEMPLATES% ^
  --root=..\src\ ^
  --output_mode=compiled ^
  --compiler_jar=%CLOSURE_COMPILER% ^
  --compiler_flags="--debug=true" ^
  --compiler_flags="--process_closure_primitives=true" ^
  --compiler_flags="--warning_level=VERBOSE" ^
  --compiler_flags="--jscomp_warning=accessControls" ^
  --compiler_flags="--jscomp_warning=checkRegExp" ^
  --compiler_flags="--jscomp_warning=checkTypes" ^
  --compiler_flags="--jscomp_warning=checkVars" ^
  --compiler_flags="--jscomp_warning=deprecated" ^
  --compiler_flags="--jscomp_warning=fileoverviewTags" ^
  --compiler_flags="--jscomp_warning=invalidCasts" ^
  --compiler_flags="--jscomp_warning=missingProperties" ^
  --compiler_flags="--jscomp_warning=nonStandardJsDocs" ^
  --compiler_flags="--jscomp_warning=strictModuleDepCheck" ^
  --compiler_flags="--jscomp_warning=undefinedVars" ^
  --compiler_flags="--jscomp_warning=unknownDefines" ^
  --compiler_flags="--summary_detail_level=3" ^
  --compiler_flags="--compilation_level=ADVANCED_OPTIMIZATIONS" ^
  --compiler_flags="--define=goog.NATIVE_ARRAY_PROTOTYPES=false" ^
  --output_file=..\picnet.table.filter.min.js

%PYTHON27_EXEC% ^
  %CLOSURE_LIBRARY%closure\bin\build\closurebuilder.py ^
  --namespace="pn.ui.filter.TableFilter" ^
  --namespace="pn.ui.filter.jQueryPlugin" ^
  --root=%CLOSURE_LIBRARY% ^
  --root=%CLOSURE_TEMPLATES% ^
  --root=..\src\ ^
  --output_mode=script ^
  --compiler_jar=%CLOSURE_COMPILER% ^
  --compiler_flags="--debug=true" ^
  --output_file=..\picnet.table.filter.full.js

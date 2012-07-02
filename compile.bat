c:\Python27\python.exe ^
  U:\shared\lib\closure-library\closure\bin\build\depswriter.py ^
  --root_with_prefix="src\ ../../../../projects/picnet_closure_repo/src/" ^
  --root_with_prefix="..\tablefilter\src\ ../../../../projects/tablefilter/src/" ^
  --output_file=src\deps.js && ^
c:\Python27\python.exe ^
  U:\shared\lib\closure-library\closure\bin\build\closurebuilder.py ^
  --namespace="pn.closure.repo.demoscripts" ^
  --root=U:\shared\lib\closure-library\ ^
  --root=..\tablefilter\src\pn\ ^
  --root=src\ ^
  --output_mode=compiled ^
  --compiler_jar=U:\shared\lib\picnetcompiler.jar ^
  --compiler_flags="--externs=src\pn\rx.externs.js" ^
  --compiler_flags="--externs=src\pn\slick.grid.externs.js" ^
  --compiler_flags="--externs=U:\shared\lib\closure-compiler-src\contrib\externs\jquery-1.6.js" ^
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
  --output_file=src\demos\scripts.min.js

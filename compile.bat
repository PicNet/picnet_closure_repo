c:\Python27\python.exe ^
  U:\shared\lib\closure-library\closure\bin\build\depswriter.py ^
  --root_with_prefix="src\ ../../../picnet_closure_repo_dev/src/" ^
  --root_with_prefix="..\tablefilter\src\ ../../../tablefilter/src/" ^
  --output_file=src\deps.js && ^
c:\Python27\python.exe ^
  U:\shared\lib\closure-library\closure\bin\build\closurebuilder.py ^
  --namespace="pn.closure.repo.demoscripts" ^
  --root=U:\shared\lib\closure-library\ ^
  --root=U:\shared\lib\tablefilter\src\pn\ ^
  --root=src\ ^
  --output_mode=compiled ^
  --compiler_jar=U:\shared\lib\picnetcompiler.jar ^
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
set BASE=../../../../projects/picnet_closure_repo/src/
REM set BASE=../../../../rr/resources/scripts/lib/picnet_closure_repo/src/

U:\shared\tools\misc_utils\MergeClosureTestFiles.exe src\tests\  && ^
java -jar u:\shared\lib\closure-templates\SoyToJsSrcCompiler.jar ^
  --shouldGenerateJsdoc ^
  --shouldProvideRequireSoyNamespaces ^
  --outputPathFormat src\pn\ui\soy\{INPUT_FILE_NAME_NO_EXT}.compiled.soy.js ^
  src\pn\ui\soy\pn.soy && ^
c:\Python27\python.exe ^
  U:\shared\lib\closure-library\closure\bin\build\depswriter.py ^
  --root_with_prefix="src\ %BASE%" ^
  --root_with_prefix="U:\shared\lib\closure-templates ../../../../../../../shared/closure-templates/" ^
  --output_file=src\deps.js && ^
c:\Python27\python.exe ^
  U:\shared\lib\closure-library\closure\bin\build\closurebuilder.py ^
  --namespace="pn.closure.repo.demoscripts" ^
  --root=U:\shared\lib\closure-library\ ^
  --root=U:\shared\lib\closure-templates\ ^
  --root=src\ ^
  --output_mode=compiled ^
  --compiler_jar=U:\shared\lib\picnetcompiler.jar ^
  --compiler_flags="--externs=U:\shared\lib\closure-compiler-src\contrib\externs\jquery-1.6.js" ^
  --compiler_flags="--externs=src\pn\rx.externs.js" ^
  --compiler_flags="--externs=src\pn\slick.grid.externs.js" ^
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
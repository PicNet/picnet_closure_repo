set CLOSURE_LIBRARY=U:\shared\lib\closure-library\
set CLOSURE_TEMPLATES=U:\shared\lib\closure-templates\
set CLOSURE_COMPILER=U:\shared\lib\picnetcompiler.jar
set CLOSURE_TEMPLATES_RELATIVE_URL=../../../../../../../shared/closure-templates/

REM set CLOSURE_LIBRARY=J:\dev\libs\closure-library\
REM set CLOSURE_TEMPLATES=J:\dev\libs\closure-templates\
REM set CLOSURE_COMPILER=J:\dev\libs\compiler.jar
REM set CLOSURE_TEMPLATES_RELATIVE_URL=../../../../../../../shared/closure-templates/

REM set BASE=../../../../projects/picnet_closure_repo/src/
set BASE=../../../../oms/resources/scripts/lib/picnet_closure_repo/src/

REM U:\shared\tools\misc_utils\MergeClosureTestFiles.exe src\tests\  && ^
java -jar %CLOSURE_TEMPLATES%SoyToJsSrcCompiler.jar ^
  --shouldGenerateJsdoc ^
  --shouldProvideRequireSoyNamespaces ^
  --outputPathFormat src\pn\ui\soy\{INPUT_FILE_NAME_NO_EXT}.compiled.soy.js ^
  src\pn\ui\soy\pn.soy && ^
c:\Python27\python.exe ^
  %CLOSURE_LIBRARY%closure\bin\build\depswriter.py ^
  --root_with_prefix="src\ %BASE%" ^
  --root_with_prefix="%CLOSURE_TEMPLATES% %CLOSURE_TEMPLATES_RELATIVE_URL%" ^
  --output_file=src\deps.js && ^
c:\Python27\python.exe ^
  %CLOSURE_LIBRARY%closure\bin\build\closurebuilder.py ^
  --namespace="pn.closure.repo.demoscripts" ^
  --root=%CLOSURE_LIBRARY% ^
  --root=%CLOSURE_TEMPLATES% ^
  --root=src\ ^
  --output_mode=compiled ^
  --compiler_jar=%CLOSURE_COMPILER% ^
  --compiler_flags="--externs=lib\jquery1.7.externs.js" ^
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
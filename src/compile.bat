c:\Python27\python.exe ^
	../lib/closure-library/closure/bin/calcdeps.py ^
	-i requirements.js ^
  -i ../lib/closure-library/closure/goog/deps.js ^
	-p ../lib/closure-library/closure/ ^
	-p . ^
  --output_file=demos/scripts.min.js ^
	-c ../lib/compiler.jar ^
	-f "--compilation_level=ADVANCED_OPTIMIZATIONS" ^
	-f "--debug=true" ^
	-f "--process_closure_primitives=true" ^
	-f "--manage_closure_dependencies=true" ^
	-f "--warning_level=VERBOSE" ^
	-f "--jscomp_warning=accessControls" ^
	-f "--jscomp_warning=checkRegExp" ^
	-f "--jscomp_warning=checkTypes" ^
	-f "--jscomp_warning=checkVars" ^
	-f "--jscomp_warning=deprecated" ^
	-f "--jscomp_warning=fileoverviewTags" ^
	-f "--jscomp_warning=invalidCasts" ^
	-f "--jscomp_warning=missingProperties" ^
	-f "--jscomp_warning=nonStandardJsDocs" ^
	-f "--jscomp_warning=strictModuleDepCheck" ^
	-f "--jscomp_warning=undefinedVars" ^
	-f "--jscomp_warning=unknownDefines" ^
	-o compiled
	

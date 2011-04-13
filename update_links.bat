set CLOSURE_LIB_SOURCE_DIR=c:\dev\Projects\Misc\picnet-closure-library-fork\closure_library
set CLOSURE_COMPILER_SOURCE_DIR=C:\dev\libs\closure-compiler\build\compiler.jar

set CLOSURE_LIB_TARGET_DIR=lib\closure_library
set CLOSURE_COMPILER_TARGET_DIR=lib\compiler.jar

rmdir %CLOSURE_LIB_TARGET_DIR%

mklink /D %CLOSURE_LIB_TARGET_DIR% %CLOSURE_LIB_SOURCE_DIR%
mklink %CLOSURE_COMPILER_TARGET_DIR% %CLOSURE_COMPILER_SOURCE_DIR%

@echo off
REM Build WASM module for production

echo Building WASM module...
cd /d "%~dp0..pic-compress-wasm"

REM Check if wasm-pack is installed
where wasm-pack >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo wasm-pack not found. Installing...
    curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
    if %ERRORLEVEL% NEQ 0 (
        echo Failed to install wasm-pack
        exit /b 1
    )
)

REM Build WASM module
echo Building with wasm-pack...
wasm-pack build --release --target web --out-dir pkg
if %ERRORLEVEL% NEQ 0 (
    echo WASM build failed
    exit /b 1
)

REM Copy WASM files to public directory
echo Copying WASM files to public/wasm...
if not exist "..\public\wasm" mkdir "..\public\wasm"
copy /Y "pkg\pic_compress_wasm.wasm" "..\public\wasm\"
copy /Y "pkg\pic_compress_wasm.js" "..\public\wasm\"
copy /Y "pkg\pic_compress_wasm.d.ts" "..\public\wasm\"

echo.
echo WASM build complete!
echo Output: public/wasm/

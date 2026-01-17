@echo off

@REM Ren "./index.html" "index2.html"
@REM Ren "./main.html" "index.html"

Start /B /Wait cmd /C npm run build

@REM Ren "./index.html" "main.html"
@REM Ren "./index2.html" "index.html"

@REM xcopy /E /I "./src/fonts" "./dist/fonts"

@REM xcopy /E /I "./src/scss" "./dist/scss"

@REM xcopy /E /I "./src/icons" "./dist/icons"
@REM xcopy /E /I "./src/imgs" "./dist/imgs"

@REM xcopy /E /I "./src/videos" "./dist/videos"
@REM xcopy /E /I /Y "./lang" "./dist/lang"

@REM setlocal enabledelayedexpansion

@REM set items=impressum policy gallery aboutUs contactFormular footer gofundme sponsoringRows sponsorings theCar whatIsStemracing sponsoringRows

@REM for %%i in (%items%) do (
@REM     xcopy /E /I /Y "./%%i/scss" "./dist/%%i/scss"
@REM     xcopy /E /I /Y "./%%i/imgs" "./dist/%%i/imgs"
@REM )

@REM xcopy /E /I /Y "./impressum" "./dist/impressum"
@REM xcopy /E /I /Y "./policy" "./dist/policy"
@REM xcopy /E /I /Y "./gallery" "./dist/gallery"

@REM xcopy /E /I /Y "./aboutUs" "./dist/aboutUs"
@REM xcopy /E /I /Y "./contactFormular" "./dist/contactFormular"
@REM xcopy /E /I /Y "./footer" "./dist/footer"
@REM xcopy /E /I /Y "./gofundme" "./dist/gofundme"
@REM xcopy /E /I /Y "./sponsoringRows" "./dist/sponsoringRows"
@REM xcopy /E /I /Y "./sponsorings" "./dist/sponsorings"
@REM xcopy /E /I /Y "./theCar" "./dist/theCar"
@REM xcopy /E /I /Y "./whatIsStemracing" "./dist/whatIsStemracing"

@REM mkdir "./dist/src"

@REM xcopy /E /I /Y "./sponsorings/sponsoringDocuments" "./dist/sponsorings/sponsoringDocuments"
@REM xcopy /E /I /Y "./src/imgs/showImageFullScreen" "./dist/showImageFullScreen"
@REM xcopy /E /I /Y "./gallery/ts" "./dist/gallery/ts"
@REM xcopy /E /I /Y "./theCar/videos" "./dist/theCar/videos"
@REM xcopy /E /I /Y "./src/fonts" "./dist/src/fonts"

@REM cd ./gallery

@REM copy "./galleryImagesWEB.json" "../dist/gallery/galleryImages.json"
copy ".\sitemap.xml" ".\dist\sitemap.xml"

@REM cd ..


@REM cd ./dist

@REM @REM Ren "./index.html" "main.html"

@REM cd ..

@REM @REM copy "./index.html" "./dist/index.h"
@REM cd ./src/imgs/countdown/
@REM copy "./Digit.svg" "../../../dist/assets/Digit.svg"

@REM cd ../../..

start python compile.py
start python resizeAllImages.py
start python convertToWebp.py

@REM cls
echo Alle Aufgaben erfolgreich abgeschlossen!
if exist "%homeDir%\HTMLReport" RMDIR /S /Q "%homeDir%\HTMLReport"
chdir /d %jmeterDir%
jmeter -g "%homeDir%\Report\result.csv" -o "%homeDir%\HTMLReport"
pause
for /f "tokens=*" %%a in ('dir *.jmx /b /s') do set scriptDir=%%a
ECHO Script dir - %scriptDir%
SET jmeterDir=D:\JMeter\apache-jmeter-5.0\apache-jmeter-5.0\bin
ECHO Jmeter dir - %jmeterDir%
chdir /d %jmeterDir%
jmeter -n -t "%scriptDir%" -l "%homeDir%\Report\testresults.jtl"
pause
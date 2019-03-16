@echo off
SET homeDir=%cd%
rem ECHO Home dir - %homeDir%
for /f "tokens=*" %%a in ('dir *.jmx /b /s') do set scriptDir=%%a
rem ECHO Script dir - %scriptDir%
SET jmeterDir=D:\JMeter\apache-jmeter-5.0\apache-jmeter-5.0\bin
rem ECHO Jmeter dir - %jmeterDir%

if exist "%homeDir%\Report" RMDIR /S /Q "%homeDir%\Report"
chdir /d %jmeterDir%
call jmeter -n -t "%scriptDir%" -l "%homeDir%\Report\testresults.jtl"

if exist "%homeDir%\HTMLReport" RMDIR /S /Q "%homeDir%\HTMLReport"
if exist "%homeDir%\ScreenShotReport" RMDIR /S /Q "%homeDir%\ScreenShotReport"
chdir /d %jmeterDir%

rem If you want full results (with samles) use result.jtl instead of testresults.jtl
SET resultsFile=testresults.jtl

call JMeterPluginsCMD.bat --generate-png "%homeDir%\ScreenShotReport\ResponseTimesOverTime.png" --input-jtl "%homeDir%\Report\%resultsFile%" --plugin-type ResponseTimesOverTime --width 800 --height 600
call JMeterPluginsCMD.bat --generate-png "%homeDir%\ScreenShotReport\ThreadsStateOverTime.png" --input-jtl "%homeDir%\Report\%resultsFile%" --plugin-type ThreadsStateOverTime   --width 800 --height 600
call JMeterPluginsCMD.bat --generate-png "%homeDir%\ScreenShotReport\BytesThroughputOverTime.png" --input-jtl "%homeDir%\Report\%resultsFile%" --plugin-type BytesThroughputOverTime   --width 800 --height 600
call JMeterPluginsCMD.bat --generate-png "%homeDir%\ScreenShotReport\HitsPerSecond.png" --input-jtl "%homeDir%\Report\%resultsFile%" --plugin-type HitsPerSecond   --width 800 --height 600
call JMeterPluginsCMD.bat --generate-png "%homeDir%\ScreenShotReport\LatenciesOverTime.png" --input-jtl "%homeDir%\Report\%resultsFile%" --plugin-type LatenciesOverTime   --width 800 --height 600
call JMeterPluginsCMD.bat --generate-png "%homeDir%\ScreenShotReport\ResponseCodesPerSecond.png" --input-jtl "%homeDir%\Report\%resultsFile%" --plugin-type ResponseCodesPerSecond   --width 800 --height 600
call JMeterPluginsCMD.bat --generate-png "%homeDir%\ScreenShotReport\ThroughputVsThreads.png" --input-jtl "%homeDir%\Report\%resultsFile%" --plugin-type ThroughputVsThreads   --width 800 --height 600
call JMeterPluginsCMD.bat --generate-png "%homeDir%\ScreenShotReport\TimesVsThreads.png" --input-jtl "%homeDir%\Report\%resultsFile%" --plugin-type TimesVsThreads    --width 800 --height 600
call JMeterPluginsCMD.bat --generate-png "%homeDir%\ScreenShotReport\TransactionsPerSecond .png" --input-jtl "%homeDir%\Report\%resultsFile%" --plugin-type TransactionsPerSecond    --width 800 --height 600


call JMeterPluginsCMD.bat --generate-png "%homeDir%\ScreenShotReport\CPU_PerfMonMetrics.png" --input-jtl "%homeDir%\Report\CPU_PerfMonMetrics.jtl" --plugin-type PerfMon --width 800 --height 600
call JMeterPluginsCMD.bat --generate-png "%homeDir%\ScreenShotReport\Memory_PerfMonMetrics.png" --input-jtl "%homeDir%\Report\Memory_PerfMonMetrics.jtl" --plugin-type PerfMon --width 800 --height 600
call JMeterPluginsCMD.bat --generate-png "%homeDir%\ScreenShotReport\Network_PerfMonMetrics.png" --input-jtl "%homeDir%\Report\Network_PerfMonMetrics.jtl" --plugin-type PerfMon --width 800 --height 600

call jmeter -g "%homeDir%\Report\result.jtl" -o "%homeDir%\HTMLReport"
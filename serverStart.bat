start cmd /k  "C:\Program Files\MongoDB\Server\3.6\bin\mongod.exe --dbpath %USERPROFILE%\source\repos\CS4770\CS4770\data"
TIMEOUT 10
start cmd /k "CD %USERPROFILE%\Source\Repos\CS4770\CS4770 & node app.js"

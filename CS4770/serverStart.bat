start cmd /k  "CD C:\Program Files\MongoDB\Server\3.6\bin && mongod --dbpath %USERPROFILE%\source\repos\CS4770\CS4770\data"
TIMEOUT 5
start cmd /k "CD %USERPROFILE%\source\repos\CS4770\CS4770 & node app.js"

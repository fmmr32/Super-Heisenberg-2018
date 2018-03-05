start cmd /k  "CD C:\Program Files\MongoDB\Server\3.6\bin && mongod --dbpath %USERPROFILE%\Source\repos\CS4770\CS4770\data"
TIMEOUT 10
start cmd /k "CD %USERPROFILE%\Source\Repos\CS4770\CS4770 & node app.js"

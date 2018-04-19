start cmd /k  "CD C:\Program Files\MongoDB\Server\3.6\bin && mongod --dbpath %cd%\CS4770\data"
TIMEOUT 5
start cmd /k "CD %cd%\CS4770 & node app.js"

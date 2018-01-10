var app = require('http').createServer(handler)
    , fs = require('fs')

app.listen(8000);

function handler(req, res) {
    fs.readFile(__dirname + req,
        function (err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading index.html');
            }

            res.writeHead(200);
            res.end(data);
        });
}
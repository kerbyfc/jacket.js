var fs = require('fs');
var util = require('util'),
  exec  = require('child_process').exec,
  child;

var start = function() {

  var connect = require('connect');
  var connectRoute = require("connect-route");
  var wrench = require('wrench');
  var open = require('open');

  var server = connect(
    
    connect.bodyParser(),
    connect.static(__dirname),

    connectRoute( function(app) {

      app.post('/error', function(req, res){
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('');
      });

      app.post('/save', function(req, res){
        var data = {'/markdown-edit/README.md':req.body.raw, './../README.md':req.body.md};
        for (var file in data) {
          fs.writeFile(file, data[file]);
        }
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('');
      });

      app.post('push', function(req, res) {
        child = exec("git add . && git commit -m 'update README.md' && git push -u origin markdown-edit && git checkout master && git checkout markdown-edit -- README.md && git add README.md && git commit -m 'update README.md' && git push origin master && git checkout markdown-edit",
        function (error, stdout, stderr) {
          if (error !== null) {
            console.log(' >> Exec error: ' + error);
            process.exit(0);
          }
        });
      });

      app.post('example', function(req, res) {
        fs.writeFileSync(req.body.filename, req.body.src);
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('');
      })
    })

  );

  var cleanup = function() {
    
    try {
      wrench.rmdirSyncRecursive('examples');
    } catch (e) {}

    fs.mkdirSync('examples');
  
  }

  process.on('exit', function () {
    cleanup();
  });

  setInterval(cleanup, 5000);

  server.listen(8008);

  open('http://localhost:8008/');

}

try {
  start();
} catch (e) {

  console.log(' >> Install local packages');

  child = exec('npm install --silent .',
    function (error, stdout, stderr) {
      if (error !== null) {
        console.log(' >> Exec error: ' + error);
        process.exit(0);
      } else {
        console.log(' >> Start server');
        setTimeout(function(){
          start();
        },500);
      }
  });

}


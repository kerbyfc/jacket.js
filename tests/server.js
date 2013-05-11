var start = function() {

  var connect = require('connect');
  var connectRoute = require("connect-route");
  var fs = require('fs');
  var open = require('open');


  var server = connect (
    
    connect.bodyParser(),
    connect['static'](__dirname),

    connectRoute( function(app) {
      app.post('/error', function(req, res){
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('');
      });
    })

  );

  if (process.cwd().match(/tests[\/]*$/) === null) {
    process.chdir('tests');
  }
    
  fs.createReadStream('../jacket.js').pipe(fs.createWriteStream('jacket.js'));

  server.listen(8008);

  console.log(' >> Open browser');
  setTimeout(function(){
    open('http://localhost:8008/');
  }, 200);
  
}

try {
  var connect = require('connect');
  start();

} catch (e) {

  var util   = require('util'),
      exec  = require('child_process').exec,
      child;

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




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

module.exports = open;
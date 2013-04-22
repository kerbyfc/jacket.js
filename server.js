var connect = require('connect');
var connectRoute = require("connect-route");

var server = connect (
  
  connect.bodyParser(),
  connect['static'](__dirname),

  connectRoute( function(app) {
    app.post('/error', function(req, res){
      console.log(req.body);
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end('');
    });
  })

);

server.listen(8080);
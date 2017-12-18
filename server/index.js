var express = require('express'),
  app = express(),
  routes = require('./routes')
  port = process.env.PORT || 3000;
routes(app)
app.listen(port);

console.log('todo list RESTful API server started on: ' + port);

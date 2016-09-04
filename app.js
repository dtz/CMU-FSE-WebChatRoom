var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');

var app = express();

var server = require('http').createServer(app);
var io = require('socket.io')(server);


// Sqlite3 Database Setup and CRUD operations
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('chatroom.db');
db.run('CREATE TABLE IF NOT EXISTS messages (author TEXT, bodytext TEXT, date TEXT)', function(err) {
  if (err !== null) {
    console.log("An error occured while creating Table 'messages' in chatroom.db");
  }
});

var insertMessageToDB = function(message){
  var stmt = db.prepare('INSERT INTO messages VALUES(?, ?, ?)');
  stmt.run(message.author, message.bodytext, message.date);
	stmt.finalize();
	console.log('[insertMessageToDB completed]');
}

var fetchMessagesFromDB = function(client){
	db.each('SELECT * FROM messages', function (err, row) {
      		client.emit('message_received', row);
        });
	console.log('[fetchMessagesFromDB completed]');
}


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// Server setup
server.listen(3000, function() {
  console.log('ChatRoom Server listening on Port #3000');
});

// Socket.io server side
io.on('connection', function(client) {
  client.on('user_entered', function(username) {
    console.log('-> ' + username + ' has entered the FSE Chat Room');
    client.username = username;
    fetchMessagesFromDB(client);
  });
  client.on('message_sent', function(message) {
    message.author = client.username;
    console.log('#'+ message.author + ' posted: ' + message.bodytext + ' @ ' + message.date);
    client.broadcast.emit('message_received', message);
    client.emit('message_received', message);
    insertMessageToDB(message);
  });
  client.on('disconnect', function() {
    console.log('<- ' + client.username + " exited the FSE Chat Room");
  });
});

module.exports = app;

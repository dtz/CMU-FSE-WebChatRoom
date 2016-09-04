var socket =  io.connect("http://localhost:3000");

$("#login_form" ).submit(function( event ) {
  event.preventDefault();
});

function login() {
	$('#login_Page').hide();
  var username = $('#username').val();
  $('#messages').empty();
	$('#MainChatPage').show();
	socket.emit('user_entered', $('#username').val());
}

function postButtonPressed() {
	var body = $('#post_bodytext').val();
	var options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute:'2-digit', hour12:'true' };
  var date = new Date().toLocaleString('en-US', options);
	$('#post_bodytext').val('');
	socket.emit('message_sent', {bodytext: body, date : date});
}

function logout(){
  $('#MainChatPage').hide();
  $('#username').val("");
	$('#login_Page').show();
}

socket.on('message_received',function(message){

  $('#messages').append(('<li> <br> <strong class="msg-user">'
  + message.author +'</strong> <small class="pull-right text">'
  + message.date +'</small> <p>' + message.bodytext +'</p> </li>'));

  $('#messages').animate({
    scrollTop:$('#messages').prop("scrollHeight")},1);
  }
);

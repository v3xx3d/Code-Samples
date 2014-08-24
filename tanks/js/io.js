var server = io.connect();

server.on('connect', function(){
	// console.log('connected');
});

server.on('onconnected', function(data){
	console.log('user id: ' + data.id );
});
//Cria variavel que cuida dos inputs, ouvindo a porta 8080
var io = require('socket.io').listen(8080);
//Conexão com o redis
var redis = require('redis');
var rClient = redis.createClient();
//Variavel que vai realizar as conversões do php
var php = require('locutus/php/var');
/*
	Conecta o redis
*/
rClient.on('connect', function() {
	console.log('redis conectado!');
});

/*
	cliente:
	Não interessa de onde veio a conexão, javascript, python, android, sempre passa por aqui.
*/
io.sockets.on('connection', function (socket) {
    socket.on('disconnect', function(message, callback) {
        console.log('cliente desconectado!');
    });
	//função para entrar em uma sala
    socket.on('join', function(message, callback){
    		socket.join(message);
    		console.log('Entrou em: '+message);
    });
    console.log('cliente conectado!');
});

/*
 * notificacoes
 * Todas as notificações do sistema são armazenadas inicialmente no redis, em uma pilha.
 * Quando uma notificação é adicionada, é armazenada em outra pilha, uma referencia para essa notificação.
 * Essa função retira os elementos da pilha de referencias, assim que são recebidos, e usa o tipo para retirar
 * os elementos da pilha onde esta a informação que deve ser enviada para os clientes
 */
function notificacoes()
{
	rClient.brpop('notificacao', 0, function(err, data){
		//depois de removido da pilha qual notificação sera usada, remove a serialização do php, para poder trabalhar com JSON
		data = php.unserialize(data[1]);
		data = JSON.parse(data);
		tipo = data.tipo;
		rClient.rpop(tipo, function(error, newdata){
			newdata = php.unserialize(newdata);
			newdata = JSON.parse(newdata);
			to = newdata.to;
			info = newdata.info;
			if (typeof to !== 'undefined') {
				// Envia para um destinatario especifico, ou uma sala especifica
				appio.sockets.to(to).emit(tipo, info);
			}else
			{
				//envia para todos
				appio.sockets.emit(tipo, info);
			};
		});
		process.nextTick(notificacoes);
	});
}
notificacoes();

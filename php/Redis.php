<?php

class Backend_Redis
{
	const DEFAULT_HOST = '127.0.0.1';

	const DEFAULT_PORT = 6379;

	const DEFAULT_DB = 0;

	const DEFAULT_PREFIX = '';

	/**
	 * Available options
	 *
	 * 'host' => (string) : the name of the Redis server
	 * 'port' => (int) : the port of the Redis server
	 * 'db' => (int) : database number to be used
	 *
	 * @var array available options
	 */
	protected $_options = array(
		'host' => self::DEFAULT_HOST,
		'port' => self::DEFAULT_PORT,
		'db' => self::DEFAULT_DB,
	);

	/**
	 * Constructor
	 * @return void
	 */
	public function __construct()
	{
		if (! extension_loaded('redis')) {
			throw new Exception('The redis extension must be loaded!');
		}
	}

	public function push($index, $to, $info)
	{
		//cria o objeto do redis
		$redis = new Redis();
		$redis->connect($this->_options['host'], $this->_options['port']);
		$redis->setOption(Redis::OPT_SERIALIZER, Redis::SERIALIZER_PHP);
		$redis->select($this->_options['db']);
		//codifica para json
		$data = json_encode(array('to'=>$to, 'info'=> $info));
		$result['index'] = $index;
		$result['data'] = $data;
		//salva a informação no indice certo
		$result['result'] = $redis->rPush($index, $data);
		//salva o indice numa pilha de notificações
		$redis->rPush('notificacao', json_encode(array('tipo'=>$index)));
		return $result;
	}
}

'use strict';

const amqplib = require('amqplib');

amqplib.connect('amqp://localhost').then(async connection => {
  let channel = await connection.createChannel();
  let exchangeName = 'logs';

  channel.assertExchange(exchangeName, 'topic', { durable: false });
  channel.publish(exchangeName, 'dasdsa.first', Buffer.from('abc'));
});

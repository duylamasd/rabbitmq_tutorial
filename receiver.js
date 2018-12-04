'use strict';

const amqplib = require('amqplib');

amqplib.connect('amqp://localhost').then(async connection => {
  let channel = await connection.createChannel();
  let exchangeName = 'logs';

  channel.assertExchange(exchangeName, 'topic', { durable: false });
  channel.assertQueue('', { exclusive: true }).then(async replies => {
    channel.bindQueue(replies.queue, exchangeName, '*.first');
    channel.consume(replies.queue, msg => {
      console.log(msg.fields.deliveryTag, msg.fields.routingKey, msg.content.toString());
    }, { noAck: true });
  });
});

'use strict';

const amqplib = require('amqplib');

amqplib.connect('amqp://localhost').then(async connection => {
  let channel = await connection.createChannel();
  channel.assertQueue('rpc', { durable: false });
  channel.prefetch(1);
  console.log('Awaiting requests');
  channel.consume('rpc', msg => {
    let input = parseInt(msg.content.toString());
    let result = input * input;
    channel.sendToQueue(msg.properties.replyTo, Buffer.from(result.toString()), { correlationId: msg.properties.correlationId });
    channel.ack(msg);
  });
});

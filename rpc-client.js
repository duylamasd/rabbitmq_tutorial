'use strict';

const amqplib = require('amqplib');
const express = require('express');
const uniqid = require('uniqid');
const EventEmitter = require('events');

amqplib.connect('amqp://localhost').then(async connection => {
  const app = express();

  let channel = await connection.createChannel();
  let replies = await channel.assertQueue('', { exclusive: true });

  channel.responseEmitter = new EventEmitter();
  channel.responseEmitter.setMaxListeners(0);
  channel.consume(replies.queue, msg => {
    channel.responseEmitter.emit(msg.properties.correlationId, msg.content);
  }, { noAck: true });

  app.get('/:n', (req, res, next) => {
    let n = req.params['n'];
    let id = uniqid();
    channel.responseEmitter.once(id, result => {
      res.json(Number(result.toString()));
    });
    channel.sendToQueue('rpc', Buffer.from(n), {
      correlationId: id,
      replyTo: replies.queue
    });
  });

  app.listen(3000, () => {
    console.log('app started');
  });
});

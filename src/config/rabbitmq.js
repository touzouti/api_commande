const amqp = require('amqplib/callback_api');

const RABBITMQ_URL = 'amqp://host.docker.internal:5672'; 
// const RABBITMQ_URL = 'amqp://localhost';

// Fonction pour publier un message dans une queue RabbitMQ
function publishToQueue(queueName, message) {
    amqp.connect(RABBITMQ_URL, (err, connection) => {
        if (err) {
            console.error("Erreur de connexion à RabbitMQ : ", err);
            return;
        }
        connection.createChannel((err, channel) => {
            if (err) {
                console.error("Erreur lors de la création du canal : ", err);
                return;
            }

            // Déclarer la queue avant de publier un message
            channel.assertQueue(queueName, { durable: true }, (err, ok) => {
                if (err) {
                    console.error(`Erreur lors de la déclaration de la queue ${queueName} :`, err);
                    return;
                }
                console.log(`Queue ${queueName} déclarée avec succès.`);

                // Publier le message dans la queue
                channel.sendToQueue(queueName, Buffer.from(message), { persistent: true });
                // console.log(`Message envoyé à la queue ${queueName}: ${message}`);
            });
        });
    });
}

// Fonction pour consommer des messages depuis une queue RabbitMQ
function consumeFromQueue(queueName, callback) {
    amqp.connect(RABBITMQ_URL, (err, connection) => {
        if (err) {
            console.error("Erreur de connexion à RabbitMQ : ", err);
            return;
        }
        connection.createChannel((err, channel) => {
            if (err) {
                console.error("Erreur lors de la création du canal : ", err);
                return;
            }

            // Déclarer la queue
            channel.assertQueue(queueName, { durable: true }, (err, ok) => {
                if (err) {
                    console.error(`Erreur lors de la déclaration de la queue ${queueName} :`, err);
                    return;
                }
                console.log(`Queue ${queueName} déclarée avec succès.`);

                // Consommer les messages de la queue
                channel.consume(queueName, (msg) => {
                    if (msg !== null) {
                        // console.log(`Message reçu de la queue ${queueName}: ${msg.content.toString()}`);
                        callback(msg.content.toString());
                        channel.ack(msg); 
                    }
                }, {
                    noAck: false
                });
            });
        });
    });
}

module.exports = { publishToQueue, consumeFromQueue };
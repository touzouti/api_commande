const amqp = require('amqplib/callback_api');
const { publishToQueue, consumeFromQueue } = require('../config/rabbitmq');

jest.mock('amqplib/callback_api');


describe('RabbitMQ Utility Functions', () => {

    describe('publishToQueue', () => {
        it('devrait publier un message avec succès dans la queue', () => {
            const mockChannel = {
                assertQueue: jest.fn((queueName, options, callback) => callback(null, {})),
                sendToQueue: jest.fn(),
            };

            const mockConnection = {
                createChannel: jest.fn((callback) => callback(null, mockChannel)),
            };

            amqp.connect.mockImplementation((url, callback) => callback(null, mockConnection));

            publishToQueue('testQueue', 'testMessage');

            expect(amqp.connect).toHaveBeenCalledWith('amqp://host.docker.internal:5672', expect.any(Function));
            expect(mockConnection.createChannel).toHaveBeenCalledWith(expect.any(Function));
            expect(mockChannel.assertQueue).toHaveBeenCalledWith('testQueue', { durable: true }, expect.any(Function));
            expect(mockChannel.sendToQueue).toHaveBeenCalledWith('testQueue', Buffer.from('testMessage'), { persistent: true });
        });

        it('devrait gérer les erreurs de connexion à RabbitMQ', () => {
            const errorMessage = 'Erreur de connexion';

            amqp.connect.mockImplementation((url, callback) => callback(new Error(errorMessage)));

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            publishToQueue('testQueue', 'testMessage');

            expect(consoleSpy).toHaveBeenCalledWith('Erreur de connexion à RabbitMQ : ', expect.any(Error));
            consoleSpy.mockRestore();
        });

        it('devrait gérer les erreurs lors de la création du canal', () => {
            const mockConnection = {
                createChannel: jest.fn((callback) => callback(new Error('Erreur de création de canal'))),
            };

            amqp.connect.mockImplementation((url, callback) => callback(null, mockConnection));

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            publishToQueue('testQueue', 'testMessage');

            expect(consoleSpy).toHaveBeenCalledWith('Erreur lors de la création du canal : ', expect.any(Error));
            consoleSpy.mockRestore();
        });

        it('devrait gérer les erreurs lors de la déclaration de la queue', () => {
            const mockChannel = {
                assertQueue: jest.fn((queueName, options, callback) => callback(new Error('Erreur de déclaration de queue'))),
                sendToQueue: jest.fn(),
            };

            const mockConnection = {
                createChannel: jest.fn((callback) => callback(null, mockChannel)),
            };

            amqp.connect.mockImplementation((url, callback) => callback(null, mockConnection));

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            publishToQueue('testQueue', 'testMessage');

            expect(consoleSpy).toHaveBeenCalledWith('Erreur lors de la déclaration de la queue testQueue :', expect.any(Error));
            consoleSpy.mockRestore();
        });
    });

    describe('consumeFromQueue', () => {
        it('devrait consommer un message avec succès de la queue', () => {
            const mockMessage = {
                content: Buffer.from('testMessage'),
            };

            const mockChannel = {
                assertQueue: jest.fn((queueName, options, callback) => callback(null, {})),
                consume: jest.fn((queueName, onMessage) => {
                    onMessage(mockMessage);
                }),
                ack: jest.fn(),
            };

            const mockConnection = {
                createChannel: jest.fn((callback) => callback(null, mockChannel)),
            };

            amqp.connect.mockImplementation((url, callback) => callback(null, mockConnection));

            const callback = jest.fn();
            consumeFromQueue('testQueue', callback);

            expect(amqp.connect).toHaveBeenCalledWith('amqp://host.docker.internal:5672', expect.any(Function));
            expect(mockConnection.createChannel).toHaveBeenCalledWith(expect.any(Function));
            expect(mockChannel.assertQueue).toHaveBeenCalledWith('testQueue', { durable: true }, expect.any(Function));
            expect(mockChannel.consume).toHaveBeenCalledWith('testQueue', expect.any(Function), { noAck: false });
            expect(callback).toHaveBeenCalledWith('testMessage');
            expect(mockChannel.ack).toHaveBeenCalledWith(mockMessage);
        });

        it('devrait gérer les erreurs de connexion à RabbitMQ lors de la consommation', () => {
            const errorMessage = 'Erreur de connexion';

            amqp.connect.mockImplementation((url, callback) => callback(new Error(errorMessage)));

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            consumeFromQueue('testQueue', jest.fn());

            expect(consoleSpy).toHaveBeenCalledWith('Erreur de connexion à RabbitMQ : ', expect.any(Error));
            consoleSpy.mockRestore();
        });

        it('devrait gérer les erreurs lors de la création du canal pour consommer des messages', () => {
            const mockConnection = {
                createChannel: jest.fn((callback) => callback(new Error('Erreur de création de canal'))),
            };

            amqp.connect.mockImplementation((url, callback) => callback(null, mockConnection));

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            consumeFromQueue('testQueue', jest.fn());

            expect(consoleSpy).toHaveBeenCalledWith('Erreur lors de la création du canal : ', expect.any(Error));
            consoleSpy.mockRestore();
        });

        it('devrait gérer les erreurs lors de la déclaration de la queue pour consommer', () => {
            const mockChannel = {
                assertQueue: jest.fn((queueName, options, callback) => callback(new Error('Erreur de déclaration de queue'))),
                consume: jest.fn(),
            };

            const mockConnection = {
                createChannel: jest.fn((callback) => callback(null, mockChannel)),
            };

            amqp.connect.mockImplementation((url, callback) => callback(null, mockConnection));

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            consumeFromQueue('testQueue', jest.fn());

            expect(consoleSpy).toHaveBeenCalledWith('Erreur lors de la déclaration de la queue testQueue :', expect.any(Error));
            consoleSpy.mockRestore();
        });
    });
});

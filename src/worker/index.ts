import { Kafka, Consumer } from 'kafkajs';
import { Database } from '../db';
import { Truck } from '@kaplego/floatcommon';
import { readFileSync } from 'fs';

export class FloatWorkerNode {
	private db: Database;
	private kafka: Kafka;
	private kafkaConsumer: Consumer;

	constructor() {
		this.db = new Database();
		this.db.ensure_db_synced();

		this.kafka = new Kafka({
			clientId: process.env.HOSTNAME || 'float-manager-server',
			brokers: (process.env.KAFKA_BROKERS || '').split(';'),
			ssl: {
				rejectUnauthorized: false,
				ca: [readFileSync('certs/ca.crt')],
				key: readFileSync('certs/privkey.pem'),
				cert: readFileSync('certs/fullchain.pem'),
			},
		});

		this.kafkaConsumer = this.kafka.consumer({
			groupId: 'float-manager-server',
		});
	}

	async start() {
		console.log('Starting worker');

		await this.kafkaConsumer.connect();
		await this.kafkaConsumer.subscribe({
			topics: ['truck-telemetry'],
		});

		await this.kafkaConsumer.run({
			eachMessage: async ({ topic, partition, message }) => {
				console.log(
					`[${partition}] [${topic}] ${message.value?.toString()}`,
				);

				if (message.value == null) {
					console.log('Got empty message!');
					return;
				}

				const data = JSON.parse(message.value.toString());
				const { truck_id } = data;

				if (truck_id == undefined) {
					console.log('Got message without any truck_id!');
					return;
				}

				switch (topic) {
					case 'truck-telemetry': {
						const {
							longitude,
							latitude,
							state,
							fuel_quantity,
							timestamp,
						} = data;

						await this.db.update_truck({
							id: truck_id,
							longitude,
							latitude,
							fuel_quantity,
							state,
						} as Truck);

						await this.db.insert_location({
							truck_id,
							timestamp,
							longitude,
							latitude,
						});

						break;
					}
				}
			},
		});
	}
}

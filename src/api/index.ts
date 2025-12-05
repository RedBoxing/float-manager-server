import express from 'express';
import { createServer, Server as HttpServer } from 'node:http';
import { TruckModel, TruckState } from '@kaplego/floatcommon';
import cors from 'cors';
import { Database } from '../db';
import { Decimal } from '@prisma/client/runtime/library';
import nocache from 'nocache';

export class FloatManagerAPIServer {
	private db: Database;
	private api: express.Application;
	private server: HttpServer;

	constructor() {
		this.db = new Database();
		this.db.ensure_db_synced();

		this.api = express();
		this.server = createServer(this.api);
		this.api.use(cors());
		this.api.use(nocache());

		this.api.get('/health', (req, res) => {
			res.send('OK');
		});

		this.api.get('/version', (req, res) => {
			const isProduction =
				process.env.NODE_ENV === 'production' ||
				process.env.APP_ENV === 'production';

			let version: string;
			if (isProduction) {
				version = process.env.VERSION || 'v0.0.0';
			} else {
				version = process.env.GIT_COMMIT || 'dev';
			}

			res.json({ version });
		});

		this.api.post('/trucks/models', async (req, res) => {
			try {
				const data: TruckModel = req.body;
				res.json(
					await this.db.insert_model({
						...data,
						fuel_capacity: new Decimal(data.fuel_capacity),
						storage_capacity: new Decimal(data.storage_capacity),
					}),
				);
			} catch (err) {
				res.json({
					error: true,
					message: err,
				});
			}
		});

		this.api.get('/trucks/models', async (req, res) => {
			try {
				res.json(await this.db.get_all_models());
			} catch (err) {
				res.json({
					error: true,
					message: err,
				});
			}
		});

		this.api.get('/trucks', async (req, res) => {
			res.json(await this.db.get_all_trucks());
		});

		this.api.get('/trucks/:truck_id', async (req, res) => {
			const { truck_id } = req.params;
			res.json(await this.db.get_truck_joined(truck_id));
		});

		this.api.post('/trucks', async (req, res) => {
			const model = await this.db.get_random_model();
			if (model == null) {
				res.status(404).json({
					message: 'No models were founds',
				});
				return;
			}
			const address = await this.db.get_random_address();
			if (address == null) {
				res.status(404).json({
					message: 'No addresses were founds',
				});
				return;
			}

			const truck = await this.db.insert_truck({
				model_id: model.id,
				fuel_quantity: model.fuel_capacity,
				departure_address_id: address.id,
				longitude: new Decimal(0.0),
				latitude: new Decimal(0.0),
				state: TruckState.Normal,
				current_order_id: null,
			});

			res.json({
				...truck,
				model,
				address,
			});
		});

		this.api.get('/truck-name/:truck_id', async (req, res) => {
			const { truck_id } = req.params;

			// Two lists of words
			const adjectives = [
				'Quantum',
				'Neural',
				'Celestial',
				'Shadow',
				'Phantom',
				'Cyber',
				'Void',
				'Eldritch',
				'Nebula',
				'Solar',
				'Luminous',
				'Frost',
				'Plasma',
				'Rune',
				'Nano',
				'Stellar',
				'Mystic',
				'Holographic',
				'Dimensional',
				'Iron',
				'Crystal',
				'Chaos',
				'Ethereal',
				'Glowing',
				'Mech',
				'Spectral',
				'Infinite',
				'Dark',
				'Radiant',
				'Cosmic',
				'Digital',
			] as const;
			const names = [
				'Blade',
				'Core',
				'Matrix',
				'Orb',
				'Scepter',
				'Pulse',
				'Nexus',
				'Gauntlet',
				'Drone',
				'Sphere',
				'Circuit',
				'Titan',
				'Wraith',
				'Beacon',
				'Rift',
				'Golem',
				'Haven',
				'Star',
				'Portal',
				'Phantom',
				'Reactor',
				'Sentinel',
				'Storm',
				'Vault',
				'Echo',
				'Monolith',
				'Hologram',
				'Relic',
				'Catalyst',
				'Dragon',
				'Array',
			] as const;

			const getSeedBasedRandom = (s: string, index: number): number => {
				let hash = 0;
				for (let i = 0; i < s.length; i++) {
					hash = (hash << 5) - hash + s.charCodeAt(i);
					hash |= 0;
				}

				return Math.abs(hash) % (index + 1);
			};

			const getRandomElement = (
				list: typeof adjectives | typeof names,
				seed: string,
			): string => {
				const randomValue = getSeedBasedRandom(seed, list.length);
				return list[randomValue];
			};

			const word1: string = getRandomElement(adjectives, truck_id);
			const word2: string = getRandomElement(names, truck_id);

			const generatedName: string = `${word1} ${word2}`;

			res.send(generatedName);
		});
	}

	start() {
		console.log('Starting API server');

		this.server.listen(3000, () => {
			console.log('server running at http://localhost:3000');
		});
	}
}

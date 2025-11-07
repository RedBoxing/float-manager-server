import {
	Address,
	HasUndefined,
	Order,
	DBTruck,
	Truck,
	TruckLocation,
	WithOneAddress,
	WithOneTruckModel,
	WithOneOrder,
	DBOrder,
	HasNullable,
	DBAddress,
	DBTruckModel,
	DBTruckLocation,
} from '@kaplego/floatcommon';
import { PrismaClient } from '@prisma/client';
import { exec } from 'node:child_process';

export class Database {
	private db: PrismaClient;

	constructor() {
		this.db = new PrismaClient();
	}

	async ensure_db_synced() {
		try {
			console.log('Migrating database...');
			await exec('npx prisma migrate deploy');
		} catch (err) {
			console.log('Failed to migrate database: ' + err);
			process.exit(1);
		}
	}

	async get_truck(truck_id: string): Promise<DBTruck | null> {
		return await this.db.truck.findUnique({
			where: {
				id: truck_id,
			},
		});
	}

	async get_truck_joined(
		truck_id: string,
	): Promise<
		| (DBTruck &
				WithOneAddress<DBTruck, false, DBAddress> &
				WithOneTruckModel<DBTruck, false, DBTruckModel> &
				WithOneOrder<
					DBTruck,
					true,
					DBOrder & WithOneAddress<DBOrder, false, DBAddress>
				>)
		| null
	> {
		return await this.db.truck.findUnique({
			where: {
				id: truck_id,
			},
			include: {
				departure_address: true,
				model: true,
				current_order: {
					include: {
						address: true,
					},
				},
			},
		});
	}

	async get_all_trucks(): Promise<DBTruck[]> {
		return await this.db.truck.findMany();
	}

	async insert_truck(truck: HasUndefined<DBTruck, 'id'>): Promise<DBTruck> {
		return await this.db.truck.create({
			data: truck,
		});
	}

	async update_truck(truck: DBTruck): Promise<void> {
		await this.db.truck.update({
			where: {
				id: truck.id,
			},
			data: truck,
		});
	}

	async get_model(model_id: number): Promise<DBTruckModel | null> {
		return await this.db.truckModel.findUnique({
			where: {
				id: model_id,
			},
		});
	}

	async get_all_models(): Promise<DBTruckModel[]> {
		return await this.db.truckModel.findMany();
	}

	async get_random_model(): Promise<DBTruckModel | null> {
		return await this.db.truckModel.findFirst({
			orderBy: {
				id: 'desc',
			},
			skip: Math.floor(
				Math.random() * (await this.db.truckModel.count()),
			),
		});
	}

	async insert_model(
		model: HasUndefined<DBTruckModel, 'id'>,
	): Promise<DBTruckModel> {
		return await this.db.truckModel.create({
			data: model,
		});
	}

	async insert_location(
		location: DBTruckLocation,
	): Promise<DBTruckLocation<Date>> {
		return await this.db.truckLocation.create({
			data: location,
		});
	}

	async get_random_address(): Promise<DBAddress | null> {
		return await this.db.address.findFirst({
			orderBy: {
				id: 'desc',
			},
			skip: Math.floor(Math.random() * (await this.db.address.count())),
		});
	}
}

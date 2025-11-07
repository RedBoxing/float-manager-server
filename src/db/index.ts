import {
	Address,
	Order,
	Truck,
	TruckModel,
	WithOneAddress,
	WithOneModel,
	WithOneOrder,
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

	async get_truck(truck_id: string): Promise<Truck | null> {
		const truck = await this.db.trucks.findUnique({
			where: {
				id: truck_id,
			},
		});

		return truck == null
			? null
			: {
					...truck,
					longitude: truck.longitude.toNumber(),
					latitude: truck.latitude.toNumber(),
					fuel_quantity: truck.fuel_quantity.toNumber(),
				};
	}

	async get_truck_joined(
		truck_id: string,
	): Promise<
		| WithOneModel<
				WithOneAddress<WithOneOrder<Truck, WithOneAddress<Order>>>
		  >
		| (WithOneModel<WithOneAddress<Truck>> & { current_order: null })
		| null
	> {
		const truck = await this.db.trucks.findUnique({
			where: {
				id: truck_id,
			},
			include: {
				addresses: true,
				truckModels: true,
				orders: {
					include: {
						addresses: true,
					},
				},
			},
		});

		return truck == null
			? null
			: {
					...truck,
					longitude: truck.longitude.toNumber(),
					latitude: truck.latitude.toNumber(),
					fuel_quantity: truck.fuel_quantity.toNumber(),
					model: {
						...truck.truckModels,
						fuel_capacity:
							truck.truckModels.fuel_capacity.toNumber(),
						storage_capacity:
							truck.truckModels.fuel_capacity.toNumber(),
					},
					departure_address: {
						...truck.addresses,
						longitude: truck.addresses.longitude.toNumber(),
						latitude: truck.addresses.latitude.toNumber(),
					},
					current_order:
						truck.orders == null
							? null
							: {
									...truck.orders,
									total_cost:
										truck.orders.total_cost.toNumber(),
									total_weight:
										truck.orders.total_weight.toNumber(),
									address: {
										...truck.orders.addresses,
										longitude:
											truck.orders.addresses.longitude.toNumber(),
										latitude:
											truck.orders.addresses.latitude.toNumber(),
									},
								},
				};
	}

	async get_all_trucks(): Promise<Truck[]> {
		const trucks = await this.db.trucks.findMany();
		return trucks.map((truck) => {
			return {
				...truck,
				longitude: truck.longitude.toNumber(),
				latitude: truck.latitude.toNumber(),
				fuel_quantity: truck.fuel_quantity.toNumber(),
			};
		});
	}

	async insert_truck(truck: Truck): Promise<Truck> {
		const newTruck = await this.db.trucks.create({
			data: truck,
		});

		return {
			...newTruck,
			longitude: newTruck.longitude.toNumber(),
			latitude: newTruck.latitude.toNumber(),
			fuel_quantity: newTruck.fuel_quantity.toNumber(),
		};
	}

	async update_truck(truck: Truck): Promise<void> {
		await this.db.trucks.update({
			where: {
				id: truck.id,
			},
			data: truck,
		});
	}

	async get_model(model_id: number): Promise<TruckModel | null> {
		const model = await this.db.truckModels.findUnique({
			where: {
				id: model_id,
			},
		});

		return model == null
			? null
			: {
					...model,
					fuel_capacity: model.fuel_capacity.toNumber(),
					storage_capacity: model.storage_capacity.toNumber(),
				};
	}

	async get_all_models(): Promise<TruckModel[]> {
		return (await this.db.truckModels.findMany()).map((model) => {
			return {
				...model,
				fuel_capacity: model.fuel_capacity.toNumber(),
				storage_capacity: model.storage_capacity.toNumber(),
			};
		});
	}

	async get_random_model(): Promise<TruckModel | null> {
		const model = await this.db.truckModels.findFirst({
			orderBy: {
				id: 'desc',
			},
			skip: Math.floor(
				Math.random() * (await this.db.truckModels.count()),
			),
		});

		return model == null
			? null
			: {
					...model,
					fuel_capacity: model.fuel_capacity.toNumber(),
					storage_capacity: model.storage_capacity.toNumber(),
				};
	}

	async insert_model(model: TruckModel): Promise<TruckModel> {
		const newModel = await this.db.truckModels.create({
			data: model,
		});

		return {
			...newModel,
			fuel_capacity: newModel.fuel_capacity.toNumber(),
			storage_capacity: newModel.storage_capacity.toNumber(),
		};
	}

	async insert_location(location: any): Promise<any> {
		return await this.db.truckLocations.create({
			data: location,
		});
	}

	async get_random_address(): Promise<Address | null> {
		const address = await this.db.addresses.findFirst({
			orderBy: {
				id: 'desc',
			},
			skip: Math.floor(Math.random() * (await this.db.addresses.count())),
		});

		return address == null
			? null
			: {
					...address,
					longitude: address.longitude.toNumber(),
					latitude: address.latitude.toNumber(),
				};
	}
}

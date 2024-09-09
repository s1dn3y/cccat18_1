import crypto from "crypto";
import pgp from "pg-promise";
import express from "express";
import { validateSignUpInput, validateExistingUser } from './signup-validator';

const app = express();
app.use(express.json());

app.post("/signup", async function (req, res) {
	const connection = pgp()("postgres://postgres:123456@localhost:5432/app");

	try {
		validateSignUpInput(req.body);
		await validateExistingUser(req.body, connection);
		const id = await createNewUser({id: crypto.randomUUID(), ...req.body}, connection);

		res.json({
			accountId: id
		});
	} catch (e: unknown) {
		let messages: string[];
		if (Array.isArray(e)) {
			messages = e;
		} else {
			if (e instanceof Error) {
				messages = [e.message];
			} else {
				messages = [`catastrophic error: ${e}`];
			}
		}
		res.status(422).json({ messages });
	} finally {
		await connection.$pool.end();
	}
});

async function createNewUser({id, name, email, cpf, carPlate, isPassenger, isDriver, password}: {id: string, name: string, email: string, cpf: string, carPlate: string, isPassenger: boolean, isDriver: boolean, password: string}, connection: any): Promise<string> {
	await connection.query(
		"insert into ccca.account (account_id, name, email, cpf, car_plate, is_passenger, is_driver, password) values ($1, $2, $3, $4, $5, $6, $7, $8)",
		[id, name, email, cpf, carPlate, !!isPassenger, !!isDriver, password]
	);
	return id;
}

export default app;

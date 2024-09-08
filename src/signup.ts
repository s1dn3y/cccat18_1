import crypto from "crypto";
import pgp from "pg-promise";
import express from "express";
import { validateCpf } from "./validateCpf";
import { validateSignUpInput, SignUpValidationCriterion, SignUpValidationData } from './signup-validator';

const app = express();
app.use(express.json());

app.post("/signup", async function (req, res) {
	const input = req.body;
	const connection = pgp()("postgres://postgres:123456@localhost:5432/app");

	try {
		if (!input.name.match(/[a-zA-Z] [a-zA-Z]+/)) {
			throw Error('invalid name')
		}

		if (!input.email.match(/^(.+)@(.+)$/)) {
			throw Error('invalid email')
		}

		if (!validateCpf(input.cpf)) {
			throw Error('invalid cpf')
		}

		if (input.isDriver && !input.carPlate.match(/[A-Z]{3}[0-9]{4}/)) {
			throw Error('invalid car plate')
		}

		const [acc] = await connection.query("select * from ccca.account where email = $1", [input.email]);

		if (acc) {
			throw Error('already exists')
		}

		const id = crypto.randomUUID();
		await connection.query("insert into ccca.account (account_id, name, email, cpf, car_plate, is_passenger, is_driver, password) values ($1, $2, $3, $4, $5, $6, $7, $8)", [id, input.name, input.email, input.cpf, input.carPlate, !!input.isPassenger, !!input.isDriver, input.password]);

		res.json({
			accountId: id
		});
	} catch (e: unknown) {
		const message = e instanceof Error ? e.message : `catastrophic error: ${e}`;
		res.status(422).json({ message });
	} finally {
		await connection.$pool.end();
	}
});

if (process.env.NODE_ENV !== 'test') {
	app.listen(3000);
}

export default app;

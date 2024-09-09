import { validateCpf } from "./validateCpf";

export function validateSignUpInput(data: ValidationData = {name: '', email: '', cpf: ''}) {
	const errors = validate(data, [
		{check: data => !data.name?.match(/[a-zA-Z] [a-zA-Z]+/), message: 'invalid name'},
		{check: data => !data.email?.match(/^(.+)@(.+)$/), message: 'invalid email'},
		{check: data => !validateCpf(data.cpf), message: 'invalid cpf'},
		{check: data => Boolean(data.isDriver) && !data.carPlate?.match(/[A-Z]{3}[0-9]{4}/), message: 'invalid car plate'}
	]);

	if (errors.length) {
		throw errors;
	}
}

export async function validateExistingUser({email} : {email: string}, connection: any) {
	const [acc] = await connection.query("select * from ccca.account where email = $1", [email]);
	if (acc) {
		throw Error('already exists')
	}
}

function validate(data: ValidationData = {name: '', email: '', cpf: ''}, criteria: ValidationCriterion[] = []): string[] {
	return criteria.filter(criterion => criterion.check(data)).map(criterion => criterion.message)
}

interface ValidationData {
	name: string,
	email: string,
	cpf: string,
	isDriver?: boolean,
	carPlate?: string,
}

interface ValidationCriterion {
	check(data: ValidationData): boolean,
	message: string
}

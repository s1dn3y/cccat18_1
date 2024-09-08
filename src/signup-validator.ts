// function validateInput(data: ValidationData = {}, criteria: ValidationCriterion[] = []): string[] {
// 	const result: string[] = [];
// 	criteria.forEach(criterion => {
// 		if (!criterion.check(data)) {
// 			result.push(criterion.message)
// 		}
// 	})
// 	return result;
// }

function validateSignUpInput(data: SignUpValidationData = {}, criteria: SignUpValidationCriterion[] = []): string[] {
	return criteria.filter(criterion => !criterion.check(data)).map(criterion => criterion.message)
}

interface SignUpValidationData {
	name?: string,
	email?: string,
	cpf?: string,
	isDriver?: boolean,
	carPlate?: string,
}

interface SignUpValidationCriterion {
	check(data: SignUpValidationData): boolean,
	message: string
}

export {
    validateSignUpInput,
    SignUpValidationData,
    SignUpValidationCriterion
}
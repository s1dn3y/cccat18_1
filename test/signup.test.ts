import app from "../src/signup";
import request from 'supertest';
import pgp from 'pg-promise';

jest.mock('pg-promise');

test("Não deve cadastrar novo usuário com nome inválido", async () => {
    mockPgp();

    const response = await request(app).post('/signup')
        .send({
            name: "##$@ %%&&&",
        });

    expect(response.status).toBe(422);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe(-3);
});

test("Não deve cadastrar novo usuário com email inválido", async () => {
    mockPgp();

    const response = await request(app).post('/signup')
        .send({
            name: "John Doe",
            email: "johndoe...",
        });

    expect(response.status).toBe(422);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe(-2);
});

test("Não deve cadastrar novo usuário com CPF inválido", async () => {
    mockPgp();

    const response = await request(app).post('/signup')
        .send({
            name: "John Doe",
            email: "johndoe@example.com",
            cpf: "111.111.111-11",
            carPlate: "ABC1234",
            isPassenger: true,
            isDriver: false,
            password: "p@ssw0rd"
        });

    expect(response.status).toBe(422);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe(-1);
});

test("Não deve cadastrar usuário já cadastrado", async () => {
    mockPgp({queryResult: [{
        name: "Blah blah",
        email: "blahe@bla.com",
        someOtherField: 'blah' 
    }]});

    const response = await request(app).post('/signup')
        .send("some content");

    expect(response.status).toBe(422);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe(-4);
});

function mockPgp({queryResult}: {queryResult: any[]} = {queryResult: []}) {
    (pgp as any).mockImplementation(() => () => ({
        query: () => Promise.resolve(queryResult),
        $pool: {
            end: () => null
        }
    }));
}
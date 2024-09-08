import app from '../src/signup';
import request from 'supertest';
import pgp from 'pg-promise';

jest.mock('pg-promise');

test('Não deve cadastrar novo usuário com nome inválido', async () => {
    mockPgpQueryResult();

    const response = await request(app).post('/signup')
        .send({
            name: '##$@ %%&&&',
        });

    expect(response.status).toBe(422);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('invalid name');
});

test('Não deve cadastrar novo usuário com email inválido', async () => {
    mockPgpQueryResult();

    const response = await request(app).post('/signup')
        .send({
            name: 'John Doe',
            email: 'johndoe...',
        });

    expect(response.status).toBe(422);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('invalid email');
});

test('Não deve cadastrar novo usuário com CPF inválido', async () => {
    mockPgpQueryResult();

    const response = await request(app).post('/signup')
        .send({
            name: 'John Doe',
            email: 'johndoe@example.com',
            cpf: '111.111.111-11',
        });

    expect(response.status).toBe(422);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('invalid cpf');
});

test('Não deve cadastrar usuário já cadastrado', async () => {
    mockPgpQueryResult({
        queryResults: [
            [{
                name: 'Blah blah',
                email: 'blahe@bla.com',
                someOtherField: 'blah'
            }]
        ]
    });

    const response = await request(app).post('/signup')
        .send({
            name: 'John Doe',
            email: 'johndoe@example.com',
            cpf: '123.456.789-09',
        });

    expect(response.status).toBe(422);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('already exists');
});

test('Não deve cadastrar novo motorista com placa de carro inválida', async () => {
    mockPgpQueryResult();

    const response = await request(app).post('/signup')
        .send({
            name: 'John Doe',
            email: 'johndoe@example.com',
            cpf: '123.456.789-09',
            isDriver: true,
            carPlate: '123#$%&',
        });

    expect(response.status).toBe(422);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('invalid car plate');
});

test('Deve cadastrar novo motorista com placa de carro válida', async () => {
    mockPgpQueryResult({
        queryResults: [
            [],
            {}
        ]
    });

    const response = await request(app).post('/signup').send({
        name: 'John Doe',
        email: 'johndoe@example.com',
        cpf: '123.456.789-09',
        isDriver: true,
        carPlate: 'XYZ5678',
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accountId');
    expect(response.body.accountId).toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/);
});

test('Deve cadastrar novo passageiro com dados válidos', async () => {
    mockPgpQueryResult({
        queryResults: [
            [],
            {}
        ]
    });

    const response = await request(app).post('/signup').send({
        name: 'John Doe',
        email: 'johndoe@example.com',
        cpf: '123.456.789-09',
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accountId');
    expect(response.body.accountId).toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/);
});

function mockPgpQueryResult({ queryResults }: { queryResults: any[] } = { queryResults: [] }) {
    let lastQueryResult = 0;
    const result = queryResults.length > lastQueryResult ? queryResults[lastQueryResult++] : queryResults;

    (pgp as any).mockImplementation(() => () => ({
        query: () => Promise.resolve(result),
        $pool: {
            end: () => null
        }
    }));
}

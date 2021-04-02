process.env.NODE_ENV = "test"

const request = require("supertest")
const db = require('../db')
const app = require("../app")

beforeEach(async () => {
    await db.query(`INSERT INTO companies
        VALUES ('apple', 'Apple Computer', 'Maker of OSX.')`)
    await db.query(`INSERT INTO invoices (comp_code, amt)
        VALUES ('apple', '300')`)
})

afterEach(async () => {
    await db.query(`DELETE FROM companies`)
    await db.query(`DELETE FROM invoices`)
})

describe('GET /invoices', () => {
    test('gets a list of invoices', async () => {
        const res = await request(app).get("/invoices")
        expect(res.body["invoices"]).toHaveLength(1)
    })
    
    test('gets an invoice', async () => {
        const idUrl = await request(app).get("/invoices")
        const id = idUrl.body.invoices[0]["id"]
        const res = await request(app).get(`/invoices/${id}`)
        expect(res.status).toBe(200)
        expect(res.body.invoice["id"]).toBe(id)
    })
    
})

describe('POST /invoices', () => {
    test('add a new invoice', async () => {
        const res = await request(app).post("/invoices").send({
            comp_code: "apple",
            amt: "400"
        })
        expect(res.status).toBe(200)
        const invoices = await request(app).get("/invoices")
        expect(invoices.body["invoices"]).toHaveLength(2)
    })
})

describe('PUT /invoices', () => {
    test('updates an invoice', async () => {
        const idUrl = await request(app).get("/invoices")
        const id = idUrl.body.invoices[0]["id"]
        const res = await request(app).put(`/invoices/${id}`).send({
            amt: "300"
        })
        expect(res.body["invoice"]["paid"]).toBe(true)
    })
})

describe('DELETE /invoices', () => {
    test('deletes an invoice', async () => {
        const idUrl = await request(app).get("/invoices")
        const id = idUrl.body.invoices[0]["id"]
        const res = await request(app).del(`/invoices/${id}`)
        expect(res.status).toBe(200)
    })
})
process.env.NODE_ENV = "test"

const request = require("supertest")
const db = require('../db')
const app = require("../app")

beforeEach(async () => {
    await db.query(`INSERT INTO companies
        VALUES ('apple', 'Apple Computer', 'Maker of OSX.')`)
})

afterEach(async () => {
    await db.query(`DELETE FROM companies`)
})

describe('GET /companies', () => {
    test('gets a list of companies', async () => {
        const res = await request(app).get("/companies")
        expect(res.body["companies"]).toHaveLength(1)
    })

    test('gets a specific company', async () => {
        const res = await request(app).get("/companies/apple")
        expect(res.status).toBe(200)
    })
    
    
})

describe('POST /companies', () => {
    test('add a new company', async () => {
        const res = await request(app).post("/companies").send({
            code: "microsoft",
            name: "Microsoft",
            description: "Creator of Windows"
        })
        expect(res.status).toBe(200)
    })
    
})

describe('PUT /companies', () => {
    test('update company', async () => {
        const res = await request(app).put("/companies/apple").send({
            name: "Apple Inc.",
            description: "Creator of Macs"
        })
        expect(res.status).toBe(200)

        const getComp = await request(app).get("/companies/apple")
        expect(getComp.body["company"]["name"]).toBe("Apple Inc.")
        expect(getComp.body["company"]["description"]).toBe("Creator of Macs")
    })
    
})

describe('DELETE /companies', () => {
    test('delete company', async () => {
        const res = await request(app).del("/companies/apple")
        expect(res.status).toBe(200)
        expect(res.body["status"]).toBe("deleted")
    })
    
})
process.env.NODE_ENV = "test"

const request = require("supertest")
const db = require('../db')
const app = require("../app")

beforeEach(async () => {
    await db.query(`INSERT INTO industries
        VALUES ('acct', 'Accounting')`)
})

afterEach(async () => {
    await db.query(`DELETE FROM comp_industry`)
    await db.query(`DELETE FROM companies`)
    await db.query(`DELETE FROM industries`)
})

describe('GET /industries', () => {
    test('gets a list of industries', async () => {
        const res = await request(app).get("/industries")
        expect(res.body["industries"]).toHaveLength(1)
    })
    
    
})

describe('POST /industries', () => {
    test('add a new industry', async () => {
        const res = await request(app).post("/industries").send({
            code: "sales",
            industry: "Sales"
        })
        expect(res.status).toBe(200)
        expect(res.body.industry["code"]).toBe("sales")
        expect(res.body.industry["industry"]).toBe("Sales")
    })
    
    test('add a company to an industry', async () => {
        await db.query(`INSERT INTO companies
        VALUES ('apple', 'Apple Computer', 'Maker of OSX.')`)
        const res = await request(app).post("/industries/acct").send({
            comp_code: "apple"
        })
        expect(res.status).toBe(200)
        expect(res.body.added["comp_code"]).toBe("apple")
        expect(res.body.added["industry_code"]).toBe("acct")
    })

})

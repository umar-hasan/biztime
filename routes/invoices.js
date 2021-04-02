const express = require('express')
const db = require('../db')
const invoices = new express.Router()

invoices.get("", async function (req, res, next) {
    try {
        const results = await db.query(`SELECT * FROM invoices`)
        return res.json({invoices: results.rows})
    } catch (error) {
        return next(error)
    }
    
})

invoices.get("/:id", async function (req, res, next) {
    try {
        const comp = await db.query(`SELECT comp_code FROM invoices WHERE id=$1`, [req.params.id])
        const results = await db.query(`SELECT id, amt, paid, add_date, paid_date FROM invoices WHERE id=$1`, [req.params.id])
        let invoice = {}
        invoice["id"] = results.rows[0]["id"]
        invoice["amt"] = results.rows[0]["amt"]
        invoice["paid"] = results.rows[0]["paid"]
        invoice["add_date"] = results.rows[0]["add_date"]
        invoice["paid_date"] = results.rows[0]["paid_date"]
        invoice["company"] = comp.rows[0]
        return res.json({invoice: invoice})
    } catch (error) {
        return next(error)
    }
})

invoices.post("", async function(req, res, next) {
    try {
        let { comp_code, amt } = req.body
        const result = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING *`, [comp_code, amt])
        return res.status(200).json({invoice: result.rows[0]})
    } catch (error) {
        return next(error)
    }
})

invoices.put("/:id", async function(req, res, next) {
    try {
        let amt  = parseFloat(req.body.amt)
        
        const remaining = await db.query(`SELECT amt, paid FROM invoices WHERE id=$1`, [req.params.id])
        const amount = parseFloat(remaining.rows[0]["amt"])
        const paid = remaining.rows[0]["paid"]

        if (!paid && amount - amt === 0) {
            const a = amount - amt
            const result = await db.query(`UPDATE invoices SET amt=$1, paid_date=CURRENT_DATE, paid=true WHERE id=$2 RETURNING *`, [a, req.params.id])
            return res.status(200).json({invoice: result.rows[0]})
        }
        else if (!paid && amount - amt > 0) {
            const a = amount - amt
            const result = await db.query(`UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING *`, [a, req.params.id])
            return res.status(200).json({invoice: result.rows[0]})
        }
        else {
            const result = await db.query(`SELECT * FROM invoices WHERE id=$1`, [req.params.id])
            return res.status(200).json({invoice: result.rows[0]})
        }
        
    } catch (error) {
        console.log(error)
        return next(error)
    }
})

invoices.delete("/:id", async function(req, res, next) {
    try {
        let { name, description } = req.body
        const result = await db.query(`DELETE FROM invoices WHERE id=${req.params.id} RETURNING *`)
        return res.status(200).json({status: "deleted"})
    } catch (error) {
        return next(error)
    }
})

module.exports = invoices
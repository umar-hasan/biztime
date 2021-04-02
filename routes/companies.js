const express = require('express')
const ExpressError = require('../expressError')
const db = require('../db')
const invoices = require('./invoices')
const companies = new express.Router()


companies.get("", async function (req, res, next) {
    try {
        const results = await db.query(`SELECT * FROM companies`)
        return res.json({companies: results.rows})
    } catch (error) {
        return next(error)
    }
    
})

companies.get("/:code", async function (req, res, next) {
    try {
        const results = await db.query(`SELECT * FROM companies WHERE code=$1`, [req.params.code])
        const invoice = await db.query(`SELECT * FROM invoices WHERE comp_code=$1`, [req.params.code])
        if (results.rows.length === 0) {
            throw new ExpressError("company with that code not found", 404)
        }
        let company = {}
        company["code"] = results.rows[0]["code"]
        company["name"] = results.rows[0]["name"]
        company["description"] = results.rows[0]["description"]
        if (invoice.rows.length > 0) {
            company["invoices"] = invoice.rows
        }
        return res.json({company: company})
    } catch (error) {
        return next(error)
    }
})

companies.post("", async function(req, res, next) {
    try {
        let { code, name, description } = req.body
        const result = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING *`, [code, name, description])
        return res.status(200).json({company: result.rows[0]})
    } catch (error) {
        return next(error)
    }
})

companies.put("/:code", async function(req, res, next) {
    try {
        let { name, description } = req.body
        const result = await db.query(`UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING *`, [name, description, req.params.code])
        return res.status(200).json({company: result.rows[0]})
    } catch (error) {
        return next(error)
    }
})

companies.delete("/:code", async function(req, res, next) {
    try {
        const result = await db.query(`DELETE FROM companies WHERE code=$1 RETURNING *`, [req.params.code])
        if (result.rows.length === 0) {
            throw new ExpressError("company with that code not found", 404)
        }
        return res.status(200).json({status: "deleted"})
    } catch (error) {
        return next(error)
    }
})

module.exports = companies
const express = require('express')
const db = require('../db')
const industries = new express.Router()

industries.get("", async function (req, res, next) {
    try {
        const results = await db.query(`
            SELECT i.code, i.industry, ci.comp_code FROM industries AS i
            LEFT JOIN comp_industry AS ci
            ON i.code = ci.industry_code
        `)
        return res.json({ industries: results.rows })
    } catch (error) {
        return next(error)
    }


})

industries.post("", async function (req, res, next) {
    try {
        let { code, industry } = req.body
        const result = await db.query(`INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING *`, [code, industry])
        return res.status(200).json({ industry: result.rows[0] })
    } catch (error) {
        return next(error)
    }
})

industries.post("/:code", async function (req, res, next) {
    try {
        let { comp_code } = req.body
        const result = await db.query(`INSERT INTO comp_industry (comp_code, industry_code) VALUES ($1, $2) RETURNING *`, [comp_code, req.params.code])
        return res.json({ added: result.rows[0] })
    } catch (error) {
        return next(error)
    }
})




module.exports = industries
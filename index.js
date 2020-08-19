#!/usr/bin/node

const express = require('express')
const fs = require('fs')

const app = express()

const config = JSON.parse(fs.readFileSync("config.json"))
const index = fs.readFileSync("pages/index.html")

app.get("/", (req, res) => {
    res.send(index)
})

app.listen(config.port, () => {
    console.log('App open at port ' + config.port)
})

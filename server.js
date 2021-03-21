const bi = require('./bitvavo-interface')
const schedule = require("node-schedule")
const dbi = require('./db-interface')

const CryptoJob = schedule.scheduleJob("*/15 * * * * *", UpdateCrypto)

function UpdateCrypto() {
    bi.GetTick((data) => {
        data.forEach(marketTick => { dbi.InsertHistorical(marketTick) })
    })
}

let express = require('express')
let app = express()
let path = require('path')

app.get('/get-market/', (req, res) => {
    res.sendFile(path.resolve('./views/get-market.html'))
})

app.get('/market/:market/', (req, res) => {
    dbi.RetrieveHistorical(req.params.market, req.query, (data) => {
        res.send(data)
    })
})

app.listen(7000, () => { console.log('Started') })
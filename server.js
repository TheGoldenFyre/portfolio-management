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

app.get('/market/:market/', (req, res) => {
    dbi.RetrieveHistorical(req.params.market, (data) => {
        res.send(data)
    })
})
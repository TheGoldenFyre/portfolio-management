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
let cors = require('cors')

app.use(express.static(path.resolve('./public')))

app.get('/get-market/', (req, res) => {
    res.sendFile(path.resolve('./views/get-market.html'))
})

app.get('/user/:userid/assets/' )

app.get('/market/:type/:symbol/latest/', cors(), (req, res) => {
    dbi.RetrieveLatest(req.params.symbol, req.params.type, req.query, (data) => {
        res.send(data)
    })
})

app.get('/market/:type/:symbol/', cors(), (req, res) => {
    dbi.RetrieveHistorical(req.params.symbol, req.params.type, req.query, (data) => {
        res.send(data)
    })
})

app.listen(7000, () => { console.log('Started') })
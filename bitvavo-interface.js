let fs = require('fs')
let path = require('path')

let bvkeys = {}
bvkeys.public = fs.readFileSync(path.resolve('./bitvavo-public.key')).toString()
bvkeys.secret = fs.readFileSync(path.resolve('./bitvavo-secret.key')).toString()

const bitvavo = require('bitvavo')().options({
    APIKEY: bvkeys.public,
    APISECRET: bvkeys.secret
})


function GetTick(cb) {
    bitvavo.tickerPrice({}, (tickerError, tick) => {
        let data = []

        for (let marketTick of tick) {

            //Ignore any markets which aren't represented in euros
            if (marketTick.market.slice(-4) !== "-EUR") continue

            let price = parseFloat(marketTick.price)
            let d = new Date()
            data.push({
                name: marketTick.market,
                time: d,
                value: price
            })
        }

        if (typeof cb === "function")
            cb(data)
    })
}

module.exports = {
    GetTick: GetTick
}
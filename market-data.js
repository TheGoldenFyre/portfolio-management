let fs = require('fs')
let path = require('path')

let bvkeys = {}
bvkeys.public = fs.readFileSync(path.resolve('./bitvavo-public.key')).toString()
bvkeys.secret = fs.readFileSync(path.resolve('./bitvavo-secret.key')).toString()

const bitvavo = require('bitvavo')().options({
    APIKEY: bvkeys.public,
    APISECRET: bvkeys.secret
})

let dbi = require("./db-interface")

bitvavo.assets({}, (error, response) => {
    if (error === null) {
        for (let object of response) {
            dbi.InsertNewMarket({
                type: "crypto",
                symbol: object.symbol,
                name: object.name,
                endpoint: object.symbol + "-EUR"
            })
        }
    } else {
        console.log(error)
    }
})
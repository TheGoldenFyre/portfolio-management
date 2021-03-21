const bi = require('./bitvavo-interface')
const schedule = require("node-schedule")
const mysql = require("mysql")

var pool = mysql.createPool({
    host: "192.168.2.35",
    user: "crypto",
    password: "CryptoStonks",
    database: "portfoliotracker"
})

const CryptoJob = schedule.scheduleJob("*/15 * * * * *", UpdateCrypto)

function UpdateCrypto() {
    bi.GetTick((data) => {
        data.forEach(marketTick => { InsertHD(marketTick) })
    })
}

//Handles the insertion of historical data into the database
function InsertHD(marketTick, cb) {
    pool.query(`
        INSERT INTO HistoricalData
        VAlUES (''${marketTick.time}', ${marketTick.name}', '${marketTick.value}')`,
        (err, res) => {
            if (err) throw err;

            cb(MD)
        })
}
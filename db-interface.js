const mysql = require("mysql")

var pool = mysql.createPool({
    host: "192.168.2.35",
    user: "crypto",
    password: "CryptoStonks",
    database: "portfoliotracker",
    multipleStatements: true
})

//Handles the insertion of historical data into the database
function InsertHistorical(marketTick, cb) {
    pool.query(`
        INSERT INTO HistoricalData
        VAlUES (${pool.escape(marketTick.time)}, ${pool.escape(marketTick.name)}, ${pool.escape(marketTick.value)})`,
        (err, res) => {
            if (err) throw err;

            if (typeof cb === "function")
                cb(marketTick)
        })
}

function RetrieveLatest(market, options, cb) {
    let latest = {market: market}

    pool.query(`
            SELECT DataTime, Value
            FROM HistoricalData
            WHERE MarketID = ${pool.escape(market)}
            ORDER BY DataTime DESC LIMIT 1
            `,
        (err, res) => {
            if (err) throw err;

            console.log(res)

            latest.data = res[1]

            if (typeof arguments[arguments.length-1] === "function")
                arguments[arguments.length-1](latest)
        })
}

function RetrieveHistorical(market, options, cb) {
    let hd = { market: market }

    pool.query(`
            SET @a=-1;
            SELECT DataTime, Value
            FROM HistoricalData
            WHERE MarketID = ${pool.escape(market)}
            ${options.start ? `AND DataTime >= ${pool.escape(options.start)}` : ''}
            ${options.end ? `AND DataTime <= ${pool.escape(options.end)}` : ''}
            ${options.res ? `AND (@a := @a + 1) % ${pool.escape(options.res)} = 0` : ''};
            `,
        (err, res) => {
            if (err) throw err;

            hd.data = res[1]

            if (typeof cb === "function")
                cb(hd)
        })
}

module.exports = {
    InsertHistorical: InsertHistorical,
    RetrieveHistorical: RetrieveHistorical,
    RetrieveLatest: RetrieveLatest
}
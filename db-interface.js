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
        VAlUES ('${marketTick.time}', '${marketTick.name}', '${marketTick.value}')`,
        (err, res) => {
            if (err) throw err;

            if (typeof cb === "function")
                cb(marketTick)
        })
}

//TODO: sanitize sql input
function RetrieveHistorical(market, options, cb) {
    let hd = { market: market }

    console.log(pool.escape(options.res))

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

            hd.data = res

            if (typeof cb === "function")
                cb(hd)
        })
}

module.exports = {
    InsertHistorical: InsertHistorical,
    RetrieveHistorical: RetrieveHistorical
}
const mysql = require("mysql")

var pool = mysql.createPool({
    host: "192.168.2.35",
    user: "crypto",
    password: "CryptoStonks",
    database: "portfoliotracker"
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

function RetrieveHistorical(market, options, cb) {
    let hd = { market: market }

    pool.query(`
        SET @rownum
        SELECT DataTime, Value
        FROM HistoricalData
        WHERE MarketID = '${market}'
        ${options.start ? `AND DataTime >= '${options.start}'` : ''}
        ${options.end ? `AND DataTime <= '${options.start}'` : ''}
        ${options.res ? `AND (@rownum := @rownum + 1) % ${options.res} = 0` : ''}
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
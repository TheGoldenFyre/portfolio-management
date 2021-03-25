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
        VAlUES (${pool.escape(marketTick.time)}, ${pool.escape(marketTick.symbol)}, ${pool.escape(marketTick.value)}, ${pool.escape(marketTick.type)})`,
        (err, res) => {
            if (err) throw err;

            if (typeof cb === "function")
                cb(marketTick)
        })
}

function InsertNewMarket(market, cb) {
    pool.query(
        `INSERT INTO Markets
        VALUES (${pool.escape(market.type)}, ${pool.escape(market.symbol)}, ${pool.escape(market.name)}, ${pool.escape(market.endpoint)})`,
        (err, res) => {
            if (err) throw err;

            if (typeof cb === "function")
                cb(market)
        }
    )
}

function RetrieveLatest(symbol, type, options, cb) {
    let latest = {symbol: symbol, type: type}

    RetrieveName(symbol, type, (name) => {
        latest.name = name

        pool.query(`
                SELECT DataTime, Value
                FROM HistoricalData
                WHERE MarketType = ${pool.escape(type)} AND MarketSymbol = ${pool.escape(symbol)}
                ORDER BY DataTime DESC LIMIT 1
                `,
            (err, res) => {
                if (err) throw err;

                latest.data = res

                if (typeof arguments[arguments.length-1] === "function")
                    arguments[arguments.length-1](latest)
            })
    })
}

function RetrieveHistorical(symbol, type, options, cb) {
    let hd = { symbol: symbol, type: type }

    RetrieveName(symbol, type, (name) => {
        hd.name = name

        pool.query(`
                SET @a=-1;
                SELECT DataTime, Value
                FROM HistoricalData
                WHERE MarketType = ${pool.escape(type)} AND MarketSymbol = ${pool.escape(symbol)}
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
    })
}

function RetrieveName(symbol, type, cb) {
    pool.query(`
            SELECT MarketName
            FROM Markets
            WHERE MarketType=${pool.escape(type)} AND MarketSymbol=${pool.escape(symbol)};
            `,
        (err, res) => {
            if (err) throw err;

            console.log(res)

            if (typeof cb === "function")
                cb(res[0].MarketName)
    })
}

module.exports = {
    InsertHistorical: InsertHistorical,
    RetrieveHistorical: RetrieveHistorical,
    RetrieveLatest: RetrieveLatest,
    InsertNewMarket: InsertNewMarket
}
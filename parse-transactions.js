let fs = require("fs")
let path = require("path")

let d = fs.readFileSync(path.resolve("./transactions.csv")).toString()

parse(d, "bitvavo")

function parse(data, type) {
    if (typeof type !== 'string')
        throw new Error("No type specified for the parser")

    switch(type) {
        case "bitvavo": 
            return parseBitvavo(data)
        default:
            throw new Error("Invalid type specified.")
    }
}

function parseBitvavo(data) {
    //Bitvavo is a csv spreadsheet, with the following data structure: 
    //"timestamp","type","currency","amount","status","address","method","txid"

    let rows = data.split("\n")
    let obj = {}

    for (let i = rows.length-1; i > 0; i--) {
        let cells = rows[i].replace(/"/g, '').split(",")

        //Deposits are ignored, as they are not seen as part of the portfolio unless they are actually invested
        if (cells[1] === "deposit") continue
        if (cells[1] === "trade") {
            if (obj[cells[2]]) {
                let p = -parseFloat(rows[i-1].replace(/"/g, '').split(",")[3])

                //If a coin was sold, the new price needs to be adjusted accordingly
                if (p < 0) {
                    obj[cells[2]].price += obj[cells[2]].price * (parseFloat(cells[3]) / obj[cells[2]].value)
                    console.log((parseFloat(cells[3]) / obj[cells[2]].value));
                    console.log(obj[cells[2]].price);
                }
                else {
                    obj[cells[2]].price += p
                }
                obj[cells[2]].value += parseFloat(cells[3])
            }
            else obj[cells[2]] = {
                value: parseFloat(cells[3]),
                price: -parseFloat(rows[i-1].replace(/"/g, '').split(",")[3])
            }

            i--
        }
    }

    let arr = []

    for (let key in obj) {
        arr.push({
            type: "crypto",
            symbol: key,
            amount: obj[key].value,
            price: obj[key].price
        })
    }

    console.log(arr);
}

module.exports = parse
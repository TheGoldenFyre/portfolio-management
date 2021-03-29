import {DateFromSQLString, DateToSQLString} from '/script/sql-date.js'
import * as tl from '/script/transaction-loader.js'

let socket = io()

//The main graph is always [0]
let activeGraphs = [
    {
        type: "crypto",
        symbol: "ADA",
        draw: SVG().addTo('#maingraph').size(document.getElementById('maingraph').clientWidth, window.innerHeight * 0.5),
        data: []
    }
]

let activeInvestments = []

function PlaceSideGraphs(graphs) {
    for (let i = 0; i < graphs.length; i++) {
        $('.sidemarkets').append(`
            <div class="sidemarkets--item"> 
                <h2>${graphs[i]}</h2>
                <div class="sidemarkets--graph sgraph-${graphs[i]}"></div>
            </div>
        `)


        activeGraphs.push({
            type: "crypto",
            symbol: graphs[i],
            draw: SVG().addTo(`.sgraph-${graphs[i]}`).size(document.getElementsByClassName('sidemarkets')[0].clientWidth * 0.8, window.innerHeight * 0.15),
            data: []
        })

        let start = new Date(new Date().valueOf() - 24 * 60 * 60000)

        $.getJSON(`http://portfolio.plopfyre.studio/market/crypto/${graphs[i]}?res=150&start=${DateToSQLString(start)}`, (data) => {
            UpdateGraph(i+1, data.data)
        })
    }
}

//Takes a target index within the activegraphs
function UpdateGraph(target, data) {
    let t = activeGraphs[target]
    data = data ?? t.data

    $(t.draw.node).empty()

    let ds = ""
    let dfs = ""
    
    let values = data.map(e => e.Value)
    let times = data.map(e => DateFromSQLString(e.DataTime).valueOf())
    
    let dims = {}

    dims.xmin = Math.min(...times)
    dims.xmax = Math.max(...times)
    dims.ymin = Math.min(...values)
    dims.ymax = Math.max(...values)
    dims.width = t.draw.width()
    dims.height = t.draw.height()

    //Keep track of min and max price labels
    let topLabel = true, bottomLabel = true

    //Start path for the gradient filled polygon
    let pStartFilled = ScalePoint({x: dims.xmax, y: dims.ymin}, dims)
    dfs += `${pStartFilled.x},${pStartFilled.y} `

    for (let i = data.length - 1; i >= 0; i--) {
        let p = ScalePoint({x: DateFromSQLString(data[i].DataTime).valueOf(), y: data[i].Value}, dims)
        ds += `${p.x},${p.y} `
        dfs += `${p.x},${p.y} `

        if (data[i].Value == dims.ymax && topLabel) {
            t.draw.text(`€${dims.ymax}`)
                .move(p.x, p.y - 20)
                .font({ fill: '#ab22eb', family: 'Inconsolata' })
            
            topLabel = false
        }
        if (data[i].Value == dims.ymin && bottomLabel) {
            t.draw.text(`€${dims.ymin}`)
                .move(p.x, p.y)
                .font({ fill: '#ab22eb', family: 'Inconsolata' })
            
            bottomLabel = false
        }
    }

    //End path for the gradient filled polygon
    let pEndFilled = ScalePoint({x: dims.xmin, y: dims.ymin}, dims)
    dfs += `${pEndFilled.x},${pEndFilled.y} `

    var linear = t.draw.gradient('linear', function(add) {
        add.stop(0, '#62008f')
        add.stop(1, '#1b1b1b')
      }).from(0,0).to(0,1)

    let filled = t.draw.polygon(dfs)
        .fill(linear)
    
    let path = t.draw.polyline(ds)
        .stroke({ color: '#ab22eb', width: 2, linecap: 'round', linejoin: 'round'})
        .fill('none')

    t.data = data
}

function ScalePoint(p, dims) {
    let vPadding = 0.08 //Specifies the percentage of the canvas at the top and bottom which is not used for the graph lines 
    let hPadding = 0 //Specifies the percentage of the canvas on the sides which is not used for the graph lines

    let ret = { x: 0, y: 0 }
    ret.x = hPadding * dims.width + (((p.x - dims.xmin) / (dims.xmax - dims.xmin)) * (dims.width * (1 - 2 * hPadding)))
    
    if (dims.ymin == dims.ymax) {
        ret.y = dims.height * 0.5
    } else {
        ret.y = dims.height * (1 - vPadding) - ((p.y - dims.ymin) / (dims.ymax - dims.ymin) * dims.height * (1 - 2 * vPadding))
    }
    return ret
}

function AddInvestments(investments) {
    investments.forEach(inv => {
        $.getJSON(`http://portfolio.plopfyre.studio/market/${inv.type}/${inv.symbol}/latest`, (latest) => {
            activeInvestments.push( {
                type: latest.type,
                symbol: latest.symbol,
                amount: inv.amount,
                price: inv.price,
                name: latest.name
            })

            let value = latest.data[0].Value * inv.amount;
            let changep = ((value / inv.price) - 1) * 100

            $('.investments').append(`
                <div class="investments--row" id="${latest.type}-${latest.symbol}">
                    <div class="investments--title">
                        <span>${latest.name}</span>
                        <span>${latest.type.toUpperCase()}-${inv.symbol}</span>
                    </div>
                    <div class="investments--data">
                        <div>
                            <span>€${value.toFixed(2)}</span>
                        </div>
                        <div>
                            <span>€${latest.data[0].Value}</span>
                            <span class="investments--changep ${changep > 0 ? "investments--changep__pos" : "investments--changep__neg"}">${changep.toFixed(2)}%</span>
                        </div>
                    </div>
                </div>
            `)
        })
    })
}

window.HandleButton = (obj) => {
    let res = 1, start = "", end = "";

    switch (obj.firstChild.textContent) {
        case '~': {
            res = 1;
            end = new Date()
            start = new Date(end.valueOf() - 15 * 60000)
            break;
        }
        case 'H': {
            res = 4;
            end = new Date()
            start = new Date(end.valueOf() - 60 * 60000)
            break;
        }
        case 'D': {
            res = 60;
            end = new Date()
            start = new Date(end.valueOf() - 24 * 60 * 60000)
            break;
        }
        case 'W': {
            res = 450;
            end = new Date()
            start = new Date(end.valueOf() - 7 * 24 * 60 * 60000)
            break;
        }
        case 'M': {
            res = 1500;
            end = new Date()
            start = new Date(end.valueOf() - 30 * 24 * 60 * 60000)
            break;
        }
    }

    $('.ts-button-selected').removeClass('ts-button-selected')
    $(obj).addClass('ts-button-selected')

    $.getJSON(`http://portfolio.plopfyre.studio/market/crypto/ADA/?res=${res}&start=${DateToSQLString(start)}&end=${DateToSQLString(end)}`, (data) => {
        UpdateGraph(0, data.data)
    })
}

window.addEventListener('resize', () => {
    activeGraphs[0].draw.size(document.getElementById('maingraph').clientWidth, window.innerHeight * 0.5)
    UpdateGraph(0)

    for (let i = 1; i < activeGraphs.length; i++) {
        activeGraphs[i].draw.size(document.getElementsByClassName('sidemarkets')[0].clientWidth * 0.8, window.innerHeight * 0.15)
        UpdateGraph(i)
    }
});

socket.on('market-update', (mu) => {
    //First, handle the updating of the graphs
    let graphsToUpdate = []
    let wentUp = false

    activeGraphs.forEach((e, i) => {
        if (e.type === mu.type && e.symbol === mu.symbol) {
            wentUp = mu.value > activeGraphs[i].data[activeGraphs[i].data.length - 1]
            graphsToUpdate.push(i)
        }
    })
    graphsToUpdate.forEach(i => {
        activeGraphs[i].data.push({Value: mu.value, DataTime: mu.time})
        UpdateGraph(i)
    })

    //then, handle the updating of investments
    let investmentsToUpdate = []
    activeInvestments.forEach((e, i) => {
        if (e.type === mu.type && e.symbol === mu.symbol)
            investmentsToUpdate.push(i)
    })
    investmentsToUpdate.forEach(i => {
        let ai = activeInvestments[i]

        let value = mu.value * ai.amount
        let changep = ((value / ai.price) - 1) * 100

        $(`#${ai.type}-${ai.symbol}`).replaceWith(`
            <div class="investments--row" id="${ai.type}-${ai.symbol}">
                <div class="investments--title">
                    <span>${ai.name}</span>
                    <span>${ai.type.toUpperCase()}-${ai.symbol}</span>
                </div>
                <div class="investments--data">
                    <div>
                        <span>€${value.toFixed(2)}</span>
                    </div>
                    <div>
                        <span>€${mu.value}</span>
                        <span class="investments--changep 
                            ${changep > 0 ? "investments--changep__pos" : "investments--changep__neg"}
                            ${wentUp > 0 ? "investments--changed__pos" : "investments--changed__neg"}">${changep.toFixed(2)}%</span>
                    </div>
                </div>
            </div>
        `)
    })
})

tl.ReadInvestmentsFromCookie('.main-display', '#drop-area', (inv) => {
    AddInvestments(inv)
    PlaceSideGraphs(inv.map(e => e.symbol))
})
tl.InitializeTransactionUpload('#drop-area', (inv) => {
    AddInvestments(inv)
    PlaceSideGraphs(activeInvestments.map(e => e.symbol))
})
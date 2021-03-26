function DateToSQLString (d) {
    return d.toISOString().slice(0, 19).replace('T', ' ')
}

function DateFromSQLString(sqlstring) {
    var a = sqlstring.split("T");
    var d = a[0].split("-");
    var t = a[1].slice(0, -1).split(":");
    return new Date(d[0], (d[1] - 1), d[2], t[0], t[1], t[2]);
}

export {DateFromSQLString, DateToSQLString}
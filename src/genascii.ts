let table = [];

for(var code = 0; code < 127; code++)
{
    var chr = String.fromCharCode(code);

    table.push(chr)
}

console.log(JSON.stringify(table, null, 2))
const fs = require('fs')

const writejson = (timeDMY,isi) => {
    var val = JSON.stringify(isi)
    fs.writeFile(`./data/${timeDMY}.json`, val, function(err, result) {
        if(err) console.log('error', err);
    });
}

const existsSync = (timeDMY, timeHM, value) => {
    var isi = {
        value : value,
        time : `${timeHM} | ${timeDMY}`
    }
    if (fs.existsSync(`./data/${timeDMY}.json`)){
        console.log(`./data/${timeDMY}.json exist!`)
        try{
            const filejson = require(`./data/${timeDMY}.json`)
            filejson.moisture.push(isi)
            writejson(timeDMY,filejson)
            
        }catch (e) {console.log("Error" + e);}
        
    }else if (!fs.existsSync(`./data/${timeDMY}.json`)){
        console.log(`./data/${timeDMY}.json doesnt exist, creating new!`)

        var val = { moisture:[] }

        try{
            val.moisture.push(isi)
            writejson(timeDMY,val)
        } catch (e) {console.log("Error" + e);}
    }
}

module.exports = { existsSync }
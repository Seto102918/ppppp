const fs = require('fs')

const writejson = (timeDMY,isi) => {
    var val = JSON.stringify(isi)
    fs.writeFileSync(`./data/${timeDMY}.json`, val, function(err, result) {
        if(err) console.log('error', err);
    });
}

const existsSync = (timeDMY, timeHM, value, moistureYangMana) => {
    var isi = {
        value : value,
        time : `${timeHM}`
    }

    if (fs.existsSync(`./data/${timeDMY}.json`)){
        console.log(`./data/${timeDMY}.json exist!`)
        try{
            const file = require(`./data/${timeDMY}.json`)
            switch (moistureYangMana){
                case 1:
                    file.moisture.push(isi)
                    break
                case 2:
                    file.moisture2.push(isi)
                    break
            }
            writejson(timeDMY,file)
            
        }catch (e) {console.log("Error" + e);}
        
    }else if (!fs.existsSync(`./data/${timeDMY}.json`)){
        console.log(`./data/${timeDMY}.json doesnt exist, creating new!`)
        var val = { moisture:[] , moisture2: []}
        try{
            switch (moistureYangMana){
                case 1:
                    val.moisture.push(isi)
                    break
                case 2:
                    val.moisture2.push(isi)
                    break
            }
            writejson(timeDMY,val)
        } catch (e) {console.log("Error" + e);}
    }
}

module.exports = { existsSync }
const getDate = () => {
    const date_ob = new Date()
    let date = date_ob.getDate();
    let month = date_ob.getMonth() + 1;

        if(month == 1) month = 'Jan'
        if(month == 2) month = 'Feb'
        if(month == 3) month = 'Mar'
        if(month == 4) month = 'Apr'
        if(month == 5) month = 'May'
        if(month == 6) month = 'Jun'
        if(month == 7) month = 'Jul'
        if(month == 8) month = 'Aug'
        if(month == 9) month = 'Sep'
        if(month == 10) month = 'Oct'
        if(month == 11) month = 'Nov'
        if(month == 12) month = 'Dec'

    let year = date_ob.getFullYear();
    return `${date}-${month}-${year}`
}

const getTime = () => {
    const date_ob = new Date()
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    return `${hours}:${minutes}`;

}
module.exports = { getDate , getTime }
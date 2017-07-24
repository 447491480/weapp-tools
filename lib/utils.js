/**
 * Created by chang on 2017/7/24.
 */
const parseString = require('xml2js').parseString;

module.exports = {
    parseXml : function(xml) {
        return new Promise((resolve,reject)=>{
            parseString(xml,(err,ret) => {
                if(err) {
                    reject(err);
                }
                resolve(ret);
            })
        })
    }
};
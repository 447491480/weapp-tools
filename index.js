/**
 * Created by chang on 2017/7/22.
 */

const crypto = require('crypto');

function paysignjs(appid, nonceStr, pkg, signType, timeStamp) {
    let ret = {
        appId: appid,
        nonceStr: nonceStr,
        package: pkg,
        signType: signType,
        timeStamp: timeStamp
    };

    let string = raw1(ret);
    string = string + '&key='+key;
    console.log(string);

    return crypto.createHash('md5').update(string, 'utf8').digest('hex');
}

function raw1(args) {
    let keys = Object.keys(args);
    keys = keys.sort();
    let newArgs = {};
    keys.forEach(function(key) {
        newArgs[key] = args[key];
    });

    let string = '';
    for(let k in newArgs) {
        string += '&' + k + '=' + newArgs[k];
    }
    string = string.substr(1);
    return string;
}

function paysignjsapi(appid, attach, body, mch_id, nonce_str, notify_url, openid, out_trade_no, spbill_create_ip, total_fee, trade_type) {
    let ret = {
        appid: appid,
        attach: attach,
        body: body,
        mch_id: mch_id,
        nonce_str: nonce_str,
        notify_url: notify_url,
        openid: openid,
        out_trade_no: out_trade_no,
        spbill_create_ip: spbill_create_ip,
        total_fee: total_fee,
        trade_type: trade_type
    };
    let string = raw(ret);
    string = string + '&key='+key;
    return crypto.createHash('md5').update(string, 'utf8').digest('hex');
}

function raw(args) {
    let keys = Object.keys(args);
    keys = keys.sort();
    let newArgs = {};
    keys.forEach(function(key) {
        newArgs[key.toLowerCase()] = args[key];
    });

    let string = '';
    for(let k in newArgs) {
        string += '&' + k + '=' + newArgs[k];
    }
    string = string.substr(1);
    return string;
}

function getXMLNodeValue(node_name, xml) {
    let tmp = xml.split("<" + node_name + ">");
    let _tmp = tmp[1].split("</" + node_name + ">");
    return _tmp[0];
}

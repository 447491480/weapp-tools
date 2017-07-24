/**
 * Created by chang on 2017/7/22.
 */

const pay = require('./lib/pay');
const config = require('./lib/config');
const request = require('request-promise-any');
const xmltojs = require('xml2js');

async function getSession(app_id, app_secret, code, grant_type = 'authorization_code') {
    let sessionRet = await request.post(config.WX_GET_SESSION_KEY).form({
        appid: app_id,
        secret: app_secret,
        js_code: code,
        grant_type: grant_type
    });

    return JSON.parse(sessionRet);
}

async function doPrepay(tid, total_fee, body, openid, app_id, mch_id, device_ip, notify_url='', attach = '', trade_type = 'JSAPI') {
    let nonce_str = Math.random();

    let formData = "<xml>";
    formData += "<appid>" + app_id + "</appid>";
    formData += "<attach>" + attach + "</attach>";
    formData += "<body>" + body + "</body>";
    formData += "<mch_id>" + mch_id + "</mch_id>";
    formData += "<nonce_str>" + nonce_str + "</nonce_str>";
    formData += "<notify_url>" + notify_url + "</notify_url>";
    formData += "<openid>" + openid + "</openid>";
    formData += "<out_trade_no>" + tid + "</out_trade_no>";
    formData += "<spbill_create_ip>" + device_ip + "</spbill_create_ip>";
    formData += "<total_fee>" + total_fee + "</total_fee>";
    formData += "<trade_type>" + trade_type + "</trade_type>";
    formData += "<sign>" + pay.paysignjsapi(app_id, attach, body, mch_id, nonce_str, notify_url, openid, tid, device_ip, total_fee, trade_type) + "</sign>";
    formData += "</xml>";

    let prepayRes =  await request({
        url: config.WX_GET_UNIFIED_ORDER,
        method: 'POST',
        body: formData
    });

    return await xmltojs.parseString(prepayRes);
}

exports.getSession = getSession;
exports.doPrepay = doPrepay;



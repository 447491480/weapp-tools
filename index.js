/**
 * Created by chang on 2017/7/22.
 */

const pay = require('./lib/pay');
const config = require('./lib/config');
const utils = require('./lib/utils');

const request = require('request-promise-any');

async function getSession(app_id, app_secret, code, grant_type = 'authorization_code') {
    let sessionRet = await request.post(config.WX_GET_SESSION_KEY).form({
        appid: app_id,
        secret: app_secret,
        js_code: code,
        grant_type: grant_type
    });

    return JSON.parse(sessionRet);
}

async function doPrepay(tid, total_fee, body, openid, app_id, mch_id, api_key, attach = 'test', notify_url = '/notify', device_ip = '0.0.0.0', trade_type = 'JSAPI') {
    let nonce_str = Math.random().toString().substr(0, 10);
    total_fee = Math.floor(total_fee * 100);

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
    formData += "<sign>" + pay.paysignjsapi(app_id, attach, body, mch_id, nonce_str, notify_url, openid, tid, device_ip, total_fee, trade_type, api_key) + "</sign>";
    formData += "</xml>";

    let prepayRes = await request({
        url: config.WX_GET_UNIFIED_ORDER,
        method: 'POST',
        body: formData
    });

    let pResObj = await utils.parseXml(prepayRes);

    if (pResObj.xml.return_code[0] === 'FAIL') {
        throw pResObj.xml.return_msg[0]
    } else if (pResObj.xml.return_code[0] === 'SUCCESS') {
        let args = {};
        let retData = {};
        args.package = 'prepay_id=' + pResObj.xml.prepay_id[0];
        args.timeStamp = Math.floor((new Date()).getTime() / 1000).toString();
        args.nonceStr = Math.random().toString().substr(0, 10);
        args.signType = 'MD5';
        args.prepayid = pResObj.xml.prepay_id[0];
        args.appPackage='Sign=WXPay';

        if(trade_type==='JSAPI') {
            args.paySign = pay.paysignjs(app_id, args.nonceStr, args.package, args.signType, args.timeStamp, api_key);

            retData.package = args.package;
            retData.timeStamp = args.timeStamp;
            retData.nonceStr = args.nonceStr;
            retData.signType = args.signType;
            retData.paySign = args.paySign;
        } else if(trade_type === 'APP') {
            args.sign = pay.paysignapp(app_id,mch_id,args.prepayid,args.appPackage,args.nonceStr,args.timeStamp,api_key);

            retData.appid=app_id;
            retData.partnerid = mch_id;
            retData.prepayid = args.prepayid;
            retData.package = args.appPackage;
            retData.noncestr = args.nonceStr;
            retData.timestamp = args.timeStamp;
            retData.sign = args.sign;
        }

        return retData;
    } else {
        throw '支付服务异常'
    }
}

exports.getSession = getSession;
exports.doPrepay = doPrepay;



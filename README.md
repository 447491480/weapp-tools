### weapp-tools 微信小程序工具集

```
 重要信息全部在服务端，安全等级高
 使用了async / await特性，使用请升级node.js to 7.6.0以上。
```

### 配置文件格式demo(wxapp.json)
```
{
    "app_id":"",
    "app_secret":"",
    "mch_id":"",
    "api_key":"",
    "notify_url":"https://****/app/pay/notify" #支付成功回调通知
}
```

### 获取openid  —— wxappTools.getSession()
小程序端wx.login()获取code,将code传入服务端，获取session信息
```javascript
const wxappTools = require('wxapp-tools');

// [配置文件中保存了小程序的appid和appsecret，这些信息不应该放到小程序中，应该放到服务端，提高安全性]
const config = require('little-man-config').get('wxapp');// 读取配置文件

module.exports = {

    // 查询并创建小程序用户
    findAndCreate: async function(data) {
        // [调用方法获取openid]
        let sessionRet = await wxappTools.getSession(config.app_id,config.app_secret,data.code);
        if(sessionRet['errcode']) {
            throw sessionRet['errmsg'];
        }

        delete data['code'];
        data.wx_id = sessionRet['openid'];

        let user = await db().app_user.findOne({where:{wx_id:data.wx_id}});

        if(!user) {
            data.id = helper.uuid(data.wx_id);
            return await db().app_user.create(data);
        }

        return user;
    }
};

```

### 微信支付 —— wxappTools.doPrepay()
小程序将用户选择的商品信息传到服务端，服务端生成订单，再到微信支付平台生成预支付订单
生成预付单后，将参数和签名打包返回给微信小程序，小程序直接使用参数完成支付。


```javascript
const wxappTools = require('wxapp-tools');
const config = require('little-man-config').get('wxapp');

module.exports = {
    // 创建内部订单，支付需要
    genTrade: async function (args) {
        let trade = {};
        trade.id = helper.uuid(args.wx_id);
        trade.wx_id = args.wx_id;
        trade.flow_no = helper.rdmFlowNo();

        if (args.resource_id) {
            trade.resource_id = args.resource_id;
        }
        if (args.resource_category) {
            trade.resource_category = args.resource_category;
        }
        if (args.category_type) {
            trade.category_type = args.category_type;
        }
        trade.payment = args.payment;
        trade.body = args.body;
        trade.status = 0;

        return db().app_pay.create(trade);
    },

    wxPrepay: async function (trade_args, prepay_args) {
        let trade = await this.genTrade(trade_args);
        if (!trade) throw '订单创建失败';


        // 此步骤返回小程序支付所需要的5个参数和签名
        return await wxappTools.doPrepay(trade.flow_no, prepay_args.total_fee, prepay_args.body, trade.wx_id, config.app_id, config.mch_id,config.api_key,trade.id)
    }
};
```

小程序中的处理
```
wx.requestPayment(
    {
        'timeStamp': prepayRet.data.timeStamp,
        'nonceStr': prepayRet.data.nonceStr,
        'package': prepayRet.data.package,
        'signType': prepayRet.data.signType,
        'paySign': prepayRet.data.paySign,
        'success':(res) => {
            console.log(res);
        },
        'fail':(res) => {
            console.log(res);
        },
        'complete':(res) => {
            console.log(res);
        }
    }
)
```

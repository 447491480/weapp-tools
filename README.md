### weapp-tools 微信小程序工具集
### 使用了async / await特性，使用请升级node.js to 8.0以上。


### 获取openid  —— wxappTools.getSession()
小程序端wx.login()获取code,
```javascript
const wxappTools = require('wxapp-tools');

// [配置文件中保存了小程序的appid和appsecret，这些信息不应该放到小程序中，应该放到服务端，提高安全性]
const config = require('little-man-config').get('wxapp');

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
```javascript
const wxappTools = require('wxapp-tools');
const config = require('little-man-config').get('wxapp');

module.exports = {
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


        return await wxappTools.doPrepay(trade.flow_no, prepay_args.total_fee, prepay_args.body, trade.wx_id, config.app_id, config.mch_id,trade.id)
    }
};
```

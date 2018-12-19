let resHandler = require('../utils/resHandler');
let utils = require('../utils/utils');
let dbModel = require('../mongodb/dbConnect');


let pwdManager = {

    sendSms: function(req, res, next) {
        let params = {
            mobile: req.body.mobile
        };
        for (let param in params){
            if (!params[param]){
                const err = 'miss required param ' + param;
                return resHandler(res, 403, null, err, err);
            }
        }

        const sms = utils.makeSmsCode();
        const ticket = utils.makeRandomTicket();
        let regSms = {
            mobile: params.mobile,
            sms:sms,
            ticket:ticket
        };
        console.log('regSms', regSms);

        dbModel.smsCodeModel.create(regSms, function(err, doc) {
            if(err){
                console.log('insert database error', err);
                return resHandler(res, 500, null, '内部错误', err);
            }
            console.log('insert database success');
            utils.sendSms(params.mobile, sms, function(err, msg){
                if(err){
                    console.log('sendSms error', err, msg);
                    return resHandler(res, 507, null, '短信验证码发送失败', err);
                }
                const data = {ticket:ticket};
                console.log(data)
                return resHandler(res, 200, data, '短信验证码发送成功', null);

            });

        });

    }



}




module.exports = pwdManager;
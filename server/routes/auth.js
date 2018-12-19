let resHandler = require('../utils/resHandler');
let utils = require('../utils/utils');
let dbModel = require('../mongodb/dbConnect');


let auth = {

    register: function(req, res, next) {
        let params = {
            name: req.body.name.trim(),
            mobile: req.body.mobile.trim(),
            sms: req.body.sms,
            ticket: req.body.ticket,
            password: req.body.password.trim()
        };
        for (let param in params){
            if (!params[param]){
                const err = 'miss required param ' + param;
                return resHandler(res, 403, null, err, err);
            }
        }

        let user = req.body;
        let isExsist = [
            { mobile :  user.mobile}
        ]

        if (!!user.email) {
            user.email = user.email.trim().toLowerCase();
            isExsist.push({email: user.email})
        }

        dbModel.smsCodeModel.findOne({ticket: user.ticket, sms: user.sms},function(err, smsDoc) {
            if (err) {
                console.log('read database error', err);
                return resHandler(res, 500, null, '内部错误', err);
            }
            if (!smsDoc) {
                let msg = '哎呀，没有这个验证码';
                return resHandler(res, 503, null, msg, msg);
            }
            if(!!smsDoc.checkedTime){
                let msg = '哎呀，验证码已经使用过了';
                return resHandler(res, 505, null, msg, msg);
            }
            let now = Date.now();
            if(now - smsDoc.createTime > 15*60*1000){ //15 minutes
                let msg = '哎呀，验证码已经过期了';
                return resHandler(res, 505, null, msg, msg);
            }

            dbModel.userModel.findOne({
                $or: isExsist
            }, function (err, doc) {
                if (err) {
                    console.log('read database error', err);
                    return resHandler(res, 500, null, '内部错误', err);
                }
                if (!!doc){
                    let msg = '手机号码或邮箱已被注册过';
                    return resHandler(res, 400, null, msg, msg);
                }

                utils.cryptPwd(user.password, function(err, hash) {
                    if (err) {
                        console.log('crypt pwd error', err);
                        return resHandler(res, 500, null, '内部错误', err);
                    }

                    user.password = hash;
                    delete user.ticket;
                    delete user.sms;
                    dbModel.userModel.create(user, function(err, userDoc) {
                        if (err) {
                            console.log('create database error', err);
                            return resHandler(res, 500, null, '内部错误', err);
                        }
                        dbModel.smsCodeModel.updateOne({_id: smsDoc._id}, {$set:{checkedTime: now}}, function(err, doc) {
                            if (err) {
                                console.log('update database error', err);
                                return resHandler(res, 500, null, '内部错误', err);
                            }
                            let msg = '注册成功';
                            return resHandler(res, 200, userDoc, msg, null);
                        });

                    });

                });

            });

        });

    },


    login: function(req, res, next) {
        let params = {
            email: req.body.email,
            password: req.body.password
        };
        for (let param in params){
            if (!params[param]){
                const err = 'miss required param ' + param;
                return resHandler(res, 403, null, err, err);
            }
        }

        dbModel.userModel.findOne({
            $or: [
                { email :  params.email},
                { mobile : params.email }
            ]
        },function(err, doc) {
            if (err) {
                console.log('read database error', err);
                return resHandler(res, 500, null, '内部错误', err);
            }

            if (!doc){
                let msg = '没有找到该用户';
                return resHandler(res, 403, null, msg, msg);
            }

            utils.comparePwd(params.password, doc.password, function (err, isPwdMatch) {
                if (err) {
                    console.log('comparePwd error', err);
                    return resHandler(res, 500, null, '内部错误', err);
                }

                if (!isPwdMatch){
                    let msg = '密码错误';
                    return resHandler(res, 403, null, msg, msg);
                }

                let theUser = doc;

                let expires = utils.genExpiresIn(7); // 7 days
                let token = utils.genToken({
                    _id : theUser._id, //读出来就是string 写进去需要转换
                    mobile : theUser.mobile,
                }, expires);

                let userConfig = utils.getUserConfig(theUser);

                let resObj = {
                    user: theUser,
                    token: token,
                    expires: expires,
                    userConfig: userConfig
                };

                return resHandler(res, 200, resObj, '登陆成功！', null);

            });

        });

    }

};

module.exports = auth;
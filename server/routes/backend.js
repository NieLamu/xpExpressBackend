let express = require('express');
let router = express.Router();
let stringRandom = require('string-random');
let session = require('express-session');
const request = require('request');
const qs = require('querystring');



let utils = require('../utils/utils');
let resHandler = require('../utils/resHandler');


let dbModel = require('../mongodb/dbConnect');


let backend = {

    index: function (req, res, next) {
        res.render("backend", {userName: req.session.user.name})
    },


    login: function (req, res, next) {
        let params = { //必要的参数
            name: req.body.loginName,
            password: req.body.loginPassword
        };
        for (let param in params){
            if (!params[param]){
                const err = 'miss required param ' + param;
                return resHandler(res, 201, null, '缺少必要参数' + param, err);
            }
        }
        dbModel.staffModel.findOne({name: params.name}, function (err, doc) {
            if (err) {
                console.log('read database error', err);
                return resHandler(res, 201, null, '内部错误，请稍后再试', err);
            }
            if (!doc) {
                let msg = '哎呀，没有这个用户';
                return resHandler(res, 201, null, msg, msg);
            }
            utils.comparePwd(params.password, doc.password, function(err, isPwdMatch){
                if (err){
                    console.log('comparePwd error', err);
                    return resHandler(res, 201, null, '内部错误，请稍后再试', err);
                }
                if (!isPwdMatch){
                    let msg = '用户名与密码不匹配';
                    return resHandler(res, 201, null, msg, msg);
                }

                req.session.isLogin = true;
                req.session.user = doc;

                return resHandler(res, 200, doc, '登陆成功！', null);

            })

        })
    },


    logout: function (req, res, next) {
        req.session.isLogin = false;
        req.session.user = null;
        req.session.url = null;
        return res.redirect('/backend');
    },


    genRedeemCode: function (req, res, next) { //  如果使用jQueryForm的话必须给出2xx码
        let params = { //必要的参数
            redeemCodeType: req.body.redeemCodeType,
            redeemCodeNum: req.body.redeemCodeNum
        };
        for (let param in params){
            if (!params[param]){
                const err = 'miss required param ' + param;
                return resHandler(res, 201, null, '缺少必要参数' + param, err);
            }
        }

        let existCodes = [],
            outputCodes = [],
            newCodes = [];

        // read db
        dbModel.redeemCodeModel.find({codeType: params.redeemCodeType}, {code: 1, _id: 0}, function (err, docs) {
            if (err){
                console.log('read database error', err);
                return resHandler(res, 201, null, '内部错误', err);
            }
            console.log('read database success', docs);
            docs.forEach(function (doc, i) {
                existCodes.push(doc.code);
            });
            console.log('existCodes', existCodes)
            while(outputCodes.length<params.redeemCodeNum){
                let tempCode = stringRandom(10, {numbers: false});  // AgfPTKheCgMvwNqX
                if (existCodes.indexOf(tempCode)<0){
                    outputCodes.push(tempCode);
                    newCodes.push({
                        codeType: params.redeemCodeType,
                        code: tempCode
                    })
                }
            }
            console.log('outputCodes', outputCodes);
            // write db
            dbModel.redeemCodeModel.insertMany(newCodes, function (err, docs) {
                if (err){
                    console.log('insert database error', err);
                    return resHandler(res, 201, null, '内部错误', err);
                }
                console.log('insert database success');

                return resHandler(res, 200, {redeemCodes: outputCodes}, 'success', null);

            });

        });

    }
};


let tempBackend = {

    login: function (req, res, next) {
        let params = { //必要的参数
            name: req.body.loginName,
            password: req.body.loginPassword
        };
        for (let param in params){
            if (!params[param]){
                const err = 'miss required param ' + param;
                return resHandler(res, 201, null, '缺少必要参数' + param, err);
            }
        }


        remoteServer.login({"email": params.name,"password": params.password}, function (err, data) {
            console.log('login', err, data)
            if (data.error){
                return resHandler(res, 201, data.data, data.message, data.error);
            }
            req.session.isLogin = true;
            req.session.user = data.data.user;
            return resHandler(res, 200, data.data, data.message, data.error);

        })
    },

    genRedeemCode: function (req, res, next) { //  如果使用jQueryForm的话必须给出2xx码
        let params = { //必要的参数
            redeemCodeType: req.body.redeemCodeType,
            redeemCodeNum: req.body.redeemCodeNum
        };
        for (let param in params){
            if (!params[param]){
                const err = 'miss required param ' + param;
                return resHandler(res, 201, null, '缺少必要参数' + param, err);
            }
        }

        params.creater = req.session.user._id;
        console.log(req.session, params);

        remoteServer.genRedeemCode(params, function (err, data) {
            console.log('genRedeemCode', err, data)
            if (err || data.error){
                return resHandler(res, 201, data.data, data.message, data.error);
            }
            return resHandler(res, 200, data.data, data.message, data.error);
        })

    },


    searchUser: function (req, res, next) { //  如果使用jQueryForm的话必须给出2xx码
        let params = { //必要的参数
            role: req.body.UserRole,
            name: req.body.UserName,
            mobile: req.body.UserMobile,
            email: req.body.UserEmail
        };

        console.log('req.body', req.body)

        // for (let param in params){
        //     if (!params[param]){
        //         const err = 'miss required param ' + param;
        //         return resHandler(res, 201, null, '缺少必要参数' + param, err);
        //     }
        // }

        remoteServer.searchUser(params, function (err, data) {
            console.log('searchUser', err, data)
            if (err || data.error){
                return resHandler(res, 201, data.data, data.message, data.error);
            }
            return resHandler(res, 200, data.data, data.message, data.error);
        })

    }
};



let remoteServer = {

    serverOpts: {
        url: 'https://5ibody.com:3249/',
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json",
        },
    },

    oneReq: function (method, path, data, callback) {
        let options = { ... this.serverOpts };
        let that = this;
        options.method = method;

        if (method === 'GET'){
            const content = qs.stringify(data);
            options.url += `${path}?${content}`;
        }else{
            options.url += path;
            options.body = data;
        }

        console.log('options', options)

        request(options, function(error, response, body) {
            if (!error && response.statusCode === 200) {
                if (typeof callback === "function") {
                    if (path === 'login'){
                        let data = body.data;
                        that.serverOpts.headers['X-Access-Token'] = data.token;
                        that.serverOpts.headers['X-Key'] = data.user.mobile;
                    }
                    return callback(null, body);
                }
            }
            return callback(error || 'error', body);
        });


    },

    login: function (data, callback) {
        this.oneReq('POST', 'login', data, callback)
    },

    genRedeemCode: function (data, callback) {
        this.oneReq('GET', 'api/v1/genRedeemCode', data, callback)
    },

    searchUser: function (data, callback) {
        this.oneReq('GET', 'api/v1/searchuser', data, callback)
    }
};



router.use(session({
    secret: 'session cat',//与cookieParser中的一致
    resave: false,
    saveUninitialized:true
}));

//登录拦截器
router.use(function (req, res, next) {
    const url = req.originalUrl;
    if (!url.startsWith("/backend/login") && !req.session.isLogin) {
        req.session.url = url;
        console.log("not login yet.", req.session);
        return res.render("backendLogin", {userName: "游客"})
    }
    console.log('already login or goto login page.');
    next();
});


// 数据库在本地时的接口
// router.get('', backend.index);
// router.post('/login', backend.login);
// router.get('/logout', backend.logout);
// router.post('/genRedeemCode', backend.genRedeemCode);

// 数据库在远程时的接口
router.get('', backend.index);
router.post('/login', tempBackend.login);
router.get('/logout', backend.logout);
router.post('/genRedeemCode', tempBackend.genRedeemCode);
router.post('/searchUser', tempBackend.searchUser);


module.exports = router;







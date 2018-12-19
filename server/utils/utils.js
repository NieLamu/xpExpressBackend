let stringRandom = require('string-random');
let bcrypt = require('bcryptjs');
let fs = require('fs');
let CryptoJS = require('crypto-js');
let queryString = require('querystring');
let http = require('http');
let path = require('path');
let jwt = require('jwt-simple');


let smsConfigJson =  path.resolve(__dirname, '../config/smsConfig.json');
let secretKeyJson =  path.resolve(__dirname, '../config/secretKey.json');
let userConfigJson =  path.resolve(__dirname, '../config/userConfig.json');


let utils = {

    makeSmsCode: function(len){
        if (!len) len = 6;
        return stringRandom(len, {letters: false});  // 0889014544916637
    },


    makeRandomTicket: function(len){
        if (!len) len = 40;
        return stringRandom(len, {numbers: false});  // AgfPTKheCgMvwNqX
    },


    cryptPwd: function(password, callback) {
        bcrypt.genSalt(10, function(err, salt) {
            if (err) return callback(err);
            bcrypt.hash(password, salt, function(err, hash) {
                return callback(err, hash);
            });

        });
    },


    comparePwd: function(password, userPassword, callback) {
        bcrypt.compare(password, userPassword, function(err, isPwdMatch) {
            if (err) return callback(err);
            return callback(null, isPwdMatch);
        });
    },


    sendSms: function(mobile, sms, callback){
        let smsConfig = JSON.parse(fs.readFileSync(smsConfigJson));

        let content = "【弦圃智能】您的验证码是";
        let data = {
            account: smsConfig.username,
            password: CryptoJS.MD5(smsConfig.pwd).toString().toUpperCase(),
            mobile: mobile,
            sendTime: '',
            content: content + sms
        };

        data = queryString.stringify(data);
        const options = {
            hostname: 'api.chanzor.com',
            path: '/send?' + data,
            method: 'GET'
        };
        //发送http请求
        const req = http.request(options, function (res) {
            let response = '';
            // console.log(`状态码: ${res.statusCode}`);
            // console.log(`响应头: ${JSON.stringify(res.headers)}`);
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                console.log('响应主体: ', chunk, typeof chunk);
                response += chunk;
            });
            res.on('end', () => {
                // console.log('响应中已无数据。');
                response = JSON.parse(response);
                if(0!==response.status){
                    return callback(response.desc, response.desc);
                }
                return callback(null, response.desc);
            });
        });
        req.on('error', function (err) {
            console.log('problem with request: ', err);
            return callback(err);
        });
        req.end();
    },


    genExpiresIn: function(numDays) {
        let dateObj = new Date();
        const y = dateObj.setDate(dateObj.getDate() + numDays);
        return 1000*Math.floor(y/1000)
    },


    genToken: function(user, expires) {
        let secretKey = JSON.parse(fs.readFileSync(secretKeyJson)).secretKey;
        return jwt.encode({
            exp: expires,
            user: user,
        }, secretKey);
    },


    getUserConfig: function (user) {
        let Config = JSON.parse(fs.readFileSync(userConfigJson));
        let userConfig = Config.user;
        let tempConfig = Config.temp;

        userConfig.mqtt.clientId = tempConfig.mqtt.groupId +'@@@'+ user._id; //GroupId@@@DeviceId，由控制台创建的 Group ID 和自己指定的 Device ID 组合构成
        userConfig.mqtt.passWord = CryptoJS.HmacSHA1(tempConfig.mqtt.groupId,tempConfig.mqtt.secretKey).toString(CryptoJS.enc.Base64);

        return userConfig
    }
};








module.exports = utils;
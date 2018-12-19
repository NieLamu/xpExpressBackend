//加载路由文件
let backend = require('./routes/backend');
let apis = require('./routes/apis');
let auth = require('./routes/auth');
let pwdManager = require('./routes/pwdManager');

function indexs(app) {

    app.get("/", function (req, res) {
        // res.send('haha');
        res.render("index", {title:"育知同创abc"})
    });

    app.get("/abc", function (req, res) {
        res.render("index", {title:"育知同创" + "<a href='" + req.path + "'>百度</a>"})
    });

    // backend
    app.use('/backend', backend);



    //旧 regSms 注册时发验证码
    app.post('/regsms', pwdManager.sendSms); //mobile
    //旧 sendsms 找回密码时发验证码
    app.post('/sendsms', pwdManager.sendSms); //mobile
    //新 pwdSms
    app.post('/sendSms', pwdManager.sendSms); //mobile

    //旧 register
    //新 register
    app.post('/register', auth.register); //name, mobile, sms, ticket, password, **others

    //旧 login
    //新 login
    app.post('/login', auth.login);



    // api/v1
    app.use('/api/v1', apis); //旧
    app.use('/api', apis); //新

};



module.exports = indexs;

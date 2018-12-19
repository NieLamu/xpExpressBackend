let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let http = require('http');
let https = require('https');
let fs = require('fs');


// 生产一个express的实例
let app = express();


//加载日志中间件
app.use(logger('dev'));
//加载解析json
app.use(express.json());
//加载解析urlencoded请求体
app.use(express.urlencoded({ extended: false }));
//加载解析cookie的中间件
app.use(cookieParser('session cat'));


// uncomment after placing your favicon in /static
app.use(favicon(path.join(__dirname, 'static', 'favicon.ico')));


//设置static文件夹为放置静态文件的目录
app.use('/static', express.static(path.join(__dirname, 'static')));


// view engine setup
/*
设置 views 文件夹为存放视图文件的目录,
即存放模板文件的地方,__dirname 为全局变量,
存储当前正在执行的脚本所在的目录。
 */
app.set('views', path.join(__dirname, 'server/views'));
app.engine('.html', require('ejs').renderFile);  // 注册html模板引擎
app.set('view engine', 'html');  // 将模板引擎换成html


//使用静态文件作为网站页面
app.use('/', express.static(path.join(__dirname, 'server/www')));


// 跨域
app.all('/*', function(req, res, next) {
    // CORS headers
    res.header('Access-Control-Allow-Origin', '*'); // restrict it to the required domain
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    // Set custom headers for CORS
    res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
    // When performing a cross domain request, you will recieve
    // a preflighted request first. This is to check if our the app
    // is safe.
    if (req.method === 'OPTIONS') {
        res.status(200).end();
    } else {
        next();
    }
});


//加载路由
let routes = require('./server/index');
routes(app);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});


// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 403);
    res.send('API not found.');
});




/**
 * Get port from environment and store in Express.
 */
let port = (process.env.PORT || '3249');
app.set('port', port);
/**
 * Create HTTP server.
 */
let options = {
    // key: fs.readFileSync(__dirname + '/keys/ws5ibody/5ibody.com.key'),
    // cert: fs.readFileSync(__dirname + '/keys/ws5ibody/5ibody.com.crt'),
    // ca:[
    //     fs.readFileSync(__dirname + '/keys/ws5ibody/issuer.crt'),
    //     fs.readFileSync(__dirname + '/keys/ws5ibody/cross.crt'),
    //     fs.readFileSync(__dirname + '/keys/ws5ibody/root.crt')
    // ]
};
let server = http.createServer(options, app);
/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port, function () {
    let addr = server.address().address;
    console.log("Web实例访问地址为 http://%s:%s", addr==='::'?'127.0.0.1':addr, server.address().port)
});


module.exports = app;

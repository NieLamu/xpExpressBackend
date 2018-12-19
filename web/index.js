//加载路由文件
let users = require('./routes/users');

function indexs(app) {

    app.get("/", function (req, res) {
        res.render("index", {title:"育知同创"})
    });

    app.get("/webabc", function (req, res) {
        res.render("index", {title:"育知同创" + "<a href='" + req.path + "'>百度</a>"})
    });

    app.use('/webusers', users);

};



module.exports = indexs;

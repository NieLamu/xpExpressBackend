//引入mongoose模块
let mongoose = require('mongoose')

//数据库连接地址  链接到myStudent数据库
let DB_URL = 'mongodb://user:password@localhost:27017/firstDb';
//数据库连接

mongoose.connect(DB_URL, {useNewUrlParser:true});

//连接成功终端显示消息
mongoose.connection.once('open',function () {
    console.log('mongoose connection open to '+ DB_URL)
})

//连接失败终端显示消息
mongoose.connection.on('error',function () {
    console.log('mongoose connection error.')
})

//连接断开终端显示消息
mongoose.connection.on('disconnected',function () {
    console.log('mongoose disconnected')
})

/**** Schema start ****/
//创建一个Schema  每一个schema会一一对应mongo中的collection
let Schema = mongoose.Schema;

/**** userSchema ****/
//实例化一个Schema  //类型不对会报错 字段传多不会写入多余字段 传少不会写未传字段
let userSchema = new Schema(
    {
        //设置userSchema信息的数据格式
        name: { type: String },
        mobile: { type: String },
        password: { type: String },
        email: { type: String, default: '' , lowercase: true, trim: true},
        ossurl: { type: String, default: '' },
        role: { type: String, default: '' },
        sex: { type: String, default: '男' },
        birthday: { type: Date, default: Date.now },
        height: { type: Number, default: 170 },
        weight: { type: Number, default: 70 , min:10, max: 200},
        address: { type: String, default: '' },
        jjmobile: { type: String, default: '' },
        adminrole: { type: String, default: '' },
        mypatient: Object,
        mydoctor: Object,
        myfriend: Object,
        myparent: Object,
        mychild: Object,
        redeemCode: Object
    },
    //{versionKey: false}是干嘛用？如果不加这个设置，我们通过mongoose第一次创建某个集合时，
    // 它会给这个集合设定一个versionKey属性值，我们不需要，所以不让它显示
    {
        versionKey:false
    }
)


/**** redeemCodeSchema ****/
let redeemCodeSchema = new Schema(
    {
        codeType: String,
        code: {type:String},
        createTime: { type: Date, default: Date.now },
        creater: { type: String, default: 'unkown'},
        auther: { type: String, default: null},
        authTime: { type: Date, default: null }
    },
    {
        versionKey:false
    }
)
// NOTE: methods must be added to the Schema before compiling it with mongoose.model()
redeemCodeSchema.methods.speak = function () {
    var greeting = this.name === 'unkown'
        ? 'redeemCode is created by ' + this.creater
        : 'redeemCode doesn"t have a creater.';
    console.log(greeting);
};


/**** smsCodeSchema ****/
let smsCodeSchema = new Schema(
    {
        mobile: {type:String},
        sms: {type:String},
        ticket: {type:String},
        createTime: { type: Date, default: Date.now },
        checkedTime: { type: Date, default: null}
    },
    {
        versionKey:false
    }
)
/**** Schema end ****/



/**** staffSchema ****/
let staffSchema = new Schema(
    {
        mobile: {type:String, default: ""},
        name: {type:String},
        password: {type:String},
        joinTime: {type: Date, default: Date.now}
    },
    {
        versionKey:false
    }
)
/**** Schema end ****/


//生成一个具体User的model并导出
//第一个参数是Model名，第三个参数时数据库collection名

let dbModel = {
    userModel: mongoose.model('user', userSchema, 'users'),
    redeemCodeModel: mongoose.model('redeemCode', redeemCodeSchema, 'redeemCodes'),
    smsCodeModel: mongoose.model('smsCode', smsCodeSchema, 'smsCodes'),
    staffModel: mongoose.model('staff', staffSchema, 'staffs')
}

//将user的model导出
module.exports = dbModel;
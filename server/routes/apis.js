let express = require('express');
let router = express.Router();


let dbModel = require('../mongodb/dbConnect');


let backend = {

    index: function (req, res, next) {
        res.render("backend", {userName:"游客"})
    },

    genRedeemCode: function (req, res, next) { //只有对接外部的时候带redeem
        let codeType = req.query.redeemCodeType,
            codeNum = req.query.redeemCodeNum,
            existCodes = [],
            outputCodes = [],
            newCodes = [];

        // read db
        dbModel.redeemCodeModel.find({codeType: codeType}, {code: 1, _id: 0}, function (err, docs) {
            if (err){
                console.log('read database error', err);
                res.send({status: 'read database error', redeemCodes: []});
            }else{
                console.log('read database success', docs);
                docs.forEach(function (v, i) {
                    existCodes.push(v.code);
                })
                console.log('existCodes', existCodes)
                while(outputCodes.length<codeNum){
                    let tempCode = stringRandom(10, {numbers: false});  // AgfPTKheCgMvwNqX
                    if (existCodes.indexOf(tempCode)<0){
                        outputCodes.push(tempCode)
                        newCodes.push({
                            codeType: codeType,
                            code: tempCode
                        })
                    }
                }
                console.log('outputCodes', outputCodes);
                // write db
                dbModel.redeemCodeModel.insertMany(newCodes, function (err, docs) {
                    if (err){
                        console.log('insert database error', err);
                        res.send({status: 'insert database error', redeemCodes: []});
                    }else{
                        console.log('insert database success', err);
                        res.send({status: 'success', redeemCodes: outputCodes});
                    }

                })
            }
        });

    }
}


router.get('/*', backend.index);
router.get('/genRedeemCode', backend.genRedeemCode);


module.exports = router;
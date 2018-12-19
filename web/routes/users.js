let express = require('express');
let router = express.Router();


let users = {

    index: function(req, res, next) {
        res.send('respond with a resource');
    },

    x: function(req, res, next) {
        res.send('respond with a resource');
    },

}


router.get('', users.index);
router.get('/', users.index);
router.get('/x', users.x);
router.get('/x/', users.x);


module.exports = router;


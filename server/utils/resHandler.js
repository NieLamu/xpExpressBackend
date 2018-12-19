let resHandler = function(res, status, data, message, error) {

    let respObj = {
        error: error,
        data: data,
        message: message
    };

    // res.status(status);
    res.status(status).json(respObj);
};


module.exports = resHandler;
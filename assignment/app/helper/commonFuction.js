const constant = require("../helper/constant");// set constant from file

module.exports = {

  // common response for api`s
  setResponseObject: async (req, success, message, data) => {
    let resp = {}
    if (success.status === false) {
      resp = {
        success: false,
        dateCheck: constant.dateCheck,
        typeStatus: 1
      };
    } else {
      resp = {
        success: success,
        dateCheck: constant.dateCheck,
      };
    }

    if (message) {
      resp["message"] = message;
    }
    if (data) {
      resp["data"] = data;
    }
    req.newRespData = await resp;
    return;
  },

};



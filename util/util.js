// File dedicated to generic helper methods that can be reused in several places
var util = (function() {
	/*
	* Default handler to be used inside routes. Return a function for callbacks of the format function(err, data).
	* If an error occour send a default json error response in the format {error : err}.
	* If no error occur, it will call the callback passing the resulting data. If no callback is passed, will send the data in a json by default.  
	*/
	var defaultApiHandler = function(res, callback) {
		var errorHandler = function(err, data) {
			if (err) {
				res.json({error : err});
			} else {
				if (callback) {
					callback(data);
				} else {
					res.json(data);
				}
			}
		}
		return errorHandler;
	}

	return {
		defaultApiHandler : defaultApiHandler
	}
})();

module.exports = util;
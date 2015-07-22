exports.errorHandler = function (err, req, res, next) {
	'use strict';
	var generic = { status: 500, msg: 'generic error' };

	res
		.status(err.status || generic.status)
  	.json(err || generic);
}
var ErrorHandler = require('./error').errorHandler;
var Service = require('./services');

var common = require('./common'),
		isEmpty = common.isEmpty,
		Error = common.Error;


// defaults **********************
var defaults = {
	baseUrl: '/api_error',
	models: ['samples']
};

// function **********************
function checkBaseUrl(url, base) {
	if(!url || !base) return false;

	return url.substring(0, base.length)===base;
}

function validateConfig(opts) {
	if(!opts.baseUrl ||  !opts.models) {
    return false;
	}

	if(typeof(opts.models)!=='object' || !opts.models.length ) {
		return false;
	}

	return true;
}

// ******************************
// exports **********************
module.exports = function api(options) {
	'use strict';
	var express = require('express'),
	router = express.Router();

	var opts = isEmpty(options) ? defaults : options;

	if(!validateConfig(opts)) {
		throw ReferenceError('invalid API configuration');
		return;
	}


	var service = new Service(opts.models);

	// ******************************
	// functions ********************
	// ******************************
	function sCount(req, res, next) {
		var name = req.params.resource;

		service.count(name, function(err, data) {
			if(err) return res.status(500).send({ error: err });

			res.status(200).json(data);
		});
	}

	function sGetAll(req, res, next) {
		var name = req.params.resource;

		service.getAll(name, function(err, data) {
			if(err) return next(err);

			res.status(200).json(data);
		});
	}

	function sGetOne(req, res, next) {
		var name 	= req.params.resource || '',
				id 		= req.params.id || 0;

		service.getOne(name, id, function(err, data) {
			if(err) return next(err);

			res.status(200).json(data);
		});
	}

	function sCreate(req, res, next) {
		var name 	= req.params.resource || '',
				obj 	= req.body || {};

		service.create(name, obj, function(err, data) {
			if(err) return next(err);

			res.status(201).json(data);
		});
	}

	function sUpdate(req, res, next) {
		var name 	= req.params.resource || '',
				id 		= req.params.id || '',
				obj 	= req.body || {};

		service.update(name, id, obj, function(err, data) {
			if(err) return next(err);

			res.status(200).json(data);
		});
	}

	function sDelete(req, res, next) {
		var name 	= req.params.resource || '',
				id 		= req.params.id || '';

		service.delete(name, id, function(err) {
			if(err) return next(err);

			res.status(204).end();
		});
	}



	var url = opts.baseUrl;

	//----------------------------------
	// ROUTER
	//----------------------------------
	router.use(function(req, res, next) {
		if(!checkBaseUrl(req.originalUrl, url)) {
			res.status(400).end();
		} else {
			next();
		}
	});


	router.get(url + '/config', function(req, res, next){
		res.status(200).json(opts);
	});


	// REST Services
	router.get(url + '/:resource', sGetAll);
	router.get(url + '/:resource/count', sCount);
	router.get(url + '/:resource/:id', sGetOne);

	router.post(url + '/:resource', sCreate);
	router.put(url + '/:resource/:id', sUpdate);
	router.delete(url + '/:resource/:id', sDelete);

	// Error Handler;
	router.use(ErrorHandler);

	return router;
};

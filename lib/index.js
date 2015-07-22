'use strict';
var express = require('express'),
		router = express.Router();

var ErrorHandler = require('./error').errorHandler;
var Service = require('./services');

// defaults **********************
var defaults = {
	baseUrl: '/api',
	models: ['samples']
};

// function **********************
function checkBaseUrl(url, base) {
	if(!url || !base) return false;
	
	return url.substring(0, base.length)===base;
}

// ******************************
// exports **********************
module.exports = function api(options) {
	var opts = options || defaults;
	
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

	
	//----------------------------------
	// ROUTER
	//----------------------------------
	router.use(function(req, res, next) {
		if(!checkBaseUrl(req.originalUrl, opts.baseUrl)) { 
			res.status(400).end();		
		} else {
			next();
		}
	});
	
	router.get('/api/config', function(req, res, next){
		res.status(200).json(opts);		
	});


	// REST Services
	router.get('/api/:resource', sGetAll);
	router.get('/api/:resource/count', sCount);
	router.get('/api/:resource/:id', sGetOne);

	router.post('/api/:resource', sCreate);
	router.put('/api/:resource/:id', sUpdate);
	router.delete('/api/:resource/:id', sDelete);

	// Error Handler;
	router.use(ErrorHandler);
	
	return router;
};
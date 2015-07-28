var common = require('./common'),
		isEmpty = common.isEmpty,
		getIndexById = common.getIndexById,
		Error = common.Error;


function Resources(models) {
	'use strict';
	var self = this;
	
	this.entities = {};
	
	for(var i=0,len=models.length;i<len;i++) {
		self.entities[models[i]] = [];
	}
	
	this.checkEntity = function(name, cb) {
		if(!self.entities[name])
			return cb(Error(404, 'resource not found'));
		else
			return cb();
	};
	
	this.count = function(name, cb) {
		self.checkEntity(name, function(err) {
			if(err) return cb(err);
			
			return cb(null, self.entities[name].length);	
		});
	};
	
	this.getAll = function(name, cb) {
		self.checkEntity(name, function(err) {
			if(err) return cb(err);
			
			return cb(null, self.entities[name]);
		});
	};
	
	this.getOne = function(name, id, cb) {
		if(!name || !id) return cb(Error(400, 'invalid params'));
		
		self.checkEntity(name, function(err) {
			if(err) return cb(err);

			var coll = self.entities[name];
			var index = getIndexById(coll, id);

			if(index>=0) return cb(null, coll[index]);
			else return cb(Error(404, 'not found'));
		});
	};
	
	this.create = function(name, obj, cb) {
		if(!name || isEmpty(obj)) return cb(Error(400, 'invalid params'));
		
		self.checkEntity(name, function(err) {
			if(err) return cb(err);
			
			var coll = self.entities[name];
			
			obj.id = coll.length + 1;
			coll.push(obj);
			
			return cb(null, obj);
		});
	};

	this.update = function(name, id, obj, cb) {
		if(!name || !id || isEmpty(obj)) return cb(Error(400, 'invalid params'));
		
		self.checkEntity(name, function(err) {
			if(err) return cb(err);

			var coll = self.entities[name];
			
			if(coll.length===0)	{
				return cb(Error(404, 'not found'));
			}
			
			var index = getIndexById(coll, id);
			
			if(index===-1) {
				return cb(Error(404, 'not found'));
			}
			
			coll[index] = obj;
			return cb(null, obj);
		});
	};
	
	this.delete = function(name, id, cb) {
		if(!name || !id) return cb(Error(400, 'invalid params'));

		self.checkEntity(name, function(err) {
			if(err) return cb(err);
			
			var coll = self.entities[name];
			var index = getIndexById(coll, id);
			if(index===-1) 
				return cb(Error(404, 'not found'));

			coll.splice(index, 1);
			return cb(null);
		});
	};	
}

module.exports = Resources;
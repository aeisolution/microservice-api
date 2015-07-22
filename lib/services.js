// Speed up calls to hasOwnProperty
var hasOwnProperty = Object.prototype.hasOwnProperty;

function isEmpty(obj) {

    // null and undefined are "empty"
    if (obj == null) return true;

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }

    return true;
}

function getIndexById(arr, id) {
	var index = -1;

	for(var i=0,len=arr.length;i<len;i++) {
		if(!arr[i].id) continue;
	
		if(arr[i].id == id) {
			return i;
		}
	}
	return index;
}

function Error(status, msg) {
	return { status: status, msg: msg };
}

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
			if(err) {
				console.log('error');
				console.dir(err);
				return cb(err);
			}

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
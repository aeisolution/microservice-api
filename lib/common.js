// *****************************
// COMMMON FUNCTIONS

// *****************************
module.exports.isEmpty = function(obj) {
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
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
					return false
				};
    }

    return true;
}

// *****************************
module.exports.getIndexById = function (arr, id) {
	var index = -1;

	for(var i=0,len=arr.length;i<len;i++) {
		if(!arr[i].id) continue;
	
		if(arr[i].id == id) {
			return i;
		}
	}
	return index;
}

// *****************************
module.exports.Error = function (status, msg) {
	return { status: status, msg: msg };
}

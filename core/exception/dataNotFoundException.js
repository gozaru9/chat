var DataNotFoundException = function( message ){
  this.message = message;
};

DataNotFoundException.prototype = new Error();

DataNotFoundException.prototype.name = 'DataNotFoundException';

module.exports = DataNotFoundException;
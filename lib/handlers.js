const _data = require('./data');
const helpers = require('./helpers');

let handlers = {};

handlers.users = (data, callback) => {
  const acceptableMethods = ['POST', 'GET', 'PUT', 'DELETE'];
  console.log(data);
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method.toLowerCase()](data, callback);
  } else {
    callback(405);
  }
}

handlers._users = {};

handlers._users.post = (data, callback) => {
  const firstName = typeof data.payload.firstName === 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  const lastName = typeof data.payload.lastName === 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  const phone = typeof data.payload.phone === 'string' && data.payload.phone.trim().length >= 10 ? data.payload.phone.trim() : false;
  const password = typeof data.payload.password === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  const tosAgreement = typeof data.payload.tosAgreement === 'boolean' && data.payload.tosAgreement ? true : false;

  if (firstName && lastName && phone && password && tosAgreement) {
    _data.read('users', phone, (error, data) => {
      if (error) {
        const hashedPassword = helpers.hash(password);
        
        if (hashedPassword) {
          const userObj = {
            'firstName': firstName,
            'lastName': lastName,
            'phone': phone,
            'hashedPassword': hashedPassword,
            'tosAgreement': true
          };
  
          _data.create('users', phone, userObj, (error) => {
            if (!error) {
              callback(200);
            } else {
              callback(500, { 'Error': 'Could not create this user' });
            }
          });
        } else {
          callback(500, { 'Error': 'Error trying to hash password' });
        }
      } else {
        callback(400, { 'Error': 'An user with this phone number already exists'});
      }
    });
  } else {
    callback(400, { 'Error': 'Missing required fields' });
  }

}

handlers._users.get = (data, callback) => {

}

handlers._users.put = (data, callback) => {

}

handlers._users.delete = (data, callback) => {

}

handlers.ping = (data, callback) => {
  callback(200);
}

handlers.notFound = function(data, callback) {
  callback(404);
}

module.exports = handlers;
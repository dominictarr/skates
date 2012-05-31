
var reconnector = require('reconnector')

module.exports = function (create) {

  if(!create)
    create = window.SKATES.create

  var emitter = reconnector(create)
  emitter.options = SKATES 
  return emitter
//what about middle ware for the client?
}

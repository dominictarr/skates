/*
  I keep forgetting how to 
  setup websocket apps.
*/

function defaults (obj, defaults) {
  obj = obj || {}
  for(var k in defaults)
    obj[k] = obj[k] || defaults[k]
  return obj
}

/*
  HMM, it seems that ws are allowed to do cros-origin!
  probably the best architecture then,
  is to come in through a load balancer to load the app,
  but then have smart clients, that communicate directly to the correct server via websockets.
  or, jsonp longpolling or whatever.

  this will require a lot more brains in the clients,
  but that is what I'm all about. 
*/

var path = require('path')
var fs = require('fs')
var sockjs = require('sockjs')
var connect = require('connect')
var browserify = require('browserify')
var toEmitter = require('reconnector/ws-server')

function createServer(opts) {
  opts = defaults(opts, {
    url: '/skates',
    middleware: connect.createServer(),
    entry:  './client.js',
    cache:  true
  })
  var sox = sockjs.createServer()
  var app = opts.middleware
  var _listen = app.listen
  //TODO... automatically insert browserify and sock.
  app.listen = function () {
    var args = [].slice.call(arguments)
    sox.installHandlers(_listen.apply(app, args), {
      prefix: opts.prefix || opts.url
    })
    return app
  }
  var browser = browserify(opts)
  browser.addEntry(opts.entry)

  //this adds some global information from the server. 
  //it will be the same for all clients that have loaded data 
  //from this server

  browser.prepend([
    'window.RECONNECTOR = ' + JSON.stringify({
      timestamp: app.timestamp = Date.now(), //this is the version of the code you are on
      url: opts.url
    }) 
    //it will be useful to pass initialization data on the connection, too.
   , 
  'window.RECONNECTOR.create = ' + function () {
    return new SockJS(RECONNECTOR.url)
  }.toString() + ';'
  ].join('\n'))
  browser.prepend(fs.readFileSync('../src/sockjs-0.3.min.js'))
/*
  REMEMBER to make sure that the javascript gets served.
  maybe inject it into the page?
  or is that too overbearing?
*/
  app.use(browser)
  sox.on('connection', function () {
    var args = [].slice.call(arguments)
    args[0] = toEmitter(args[0])
    args.unshift('connection')
    app.emit.apply(app, args)
  })
  return app
}



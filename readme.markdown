#skates

opinions:

  * WebSocket based apps needs to be on ecosystem, like connect, express.
  * WebSocket other websocket frameworks are too monolithic.
  * make your life easy: use a module bundler on the client

this is all you need:

``` js
//client.js
var emitter = require('skates')()

setInterval(function () {
  emitter.emit('ping', Date.now())
}, 1e3)
emitter.on('pong', function (time) {
  console.log('latency:', time)
})

```

and this:

``` js
//server.js
var skates = require('skates')
var connect = require('connect')
var app = skates.createServer()
  .use(connect.static('public')
  .on('connection', function (emitter) {
    emitter.on('ping', function (time) {
      emitter.emit('pong', Date.now() - time)
    })

  })
  .listen(3000)
```

too easy.

oh, yeah. 
``` html
<!-- public/index.html -->
<!doctype html>
<html>
  <head>
    <script src=/browserify.js></script>
  </head>
</html>
```

then `node server & google-chrome localhost:3000`


var fs = require('fs')
var qs = require('querystring')
var fileStream
var nameCount = 0
var http = require('http')
http.createServer(function(req, res) {
  switch(req.method) {
    case 'HEAD':
    case 'GET':
      return form(req, res)
    case 'POST':
      return handle(req, res)
    default:
      res.statusCode = 405
      res.end('405 Bad Method: ' + req.method)
      return
  }
}).listen(80, function() {
  fileStream = fs.createWriteStream('names.txt')
  fileStream.on('open', function() {
    process.setgid('nobody')
    process.setuid('nobody')
  })
})
var body = '<doctype html><title>ENTER YOUR NAME</title><h1>ENTER YOUR NAME</h1>' +
    '<form method=post>' +
    '<input autofocus=autofocus name=name placeholder="NAME GOES HERE">' +
    '<input type=submit value="ACCEPT MY NAME"></form>' +
    '\n<!-- a visnu and isaacs production (c) 2013 all rights reserved \n' +
    'By using this form, you give Visnu Pitiyanuvath and Isaac Z Schlueter\n' +
    'irrevocable rights to your immortal woofie.\n' +
    'Please use responsibly.\n'
function form(req, res) {
  res.setHeader('content-length', body.length)
  res.setHeader('content-type', 'text/html')
  res.setHeader('nodeconf-bus', '3')
  res.end(body, 'ascii')
}
function handle(req, res) {
  if (!req.headers['content-length']) {
    res.statusCode = 413
    res.end('413 Length Required', 'ascii')
    return
  }
  var len = +req.headers['content-length']
  if (len > 255) {
    res.statusCode = 411
    res.end('411 Have a shorter name', 'ascii')
    return
  }
  var input = ''
  req.setEncoding('utf8')
  req.on('data', function(c) {
    input += c
  })
  req.on('end', function() {
    try {
      input = qs.parse(input)
    } catch (er) {
      res.statusCode = 400
      res.end('400 Stop that shenanigans', 'ascii')
      return
    }
    input = input.name && input.name.trim()
    if (!input) return form(req, res)
    fileStream.write((nameCount++) + ' ' + input.trim() + '\n')
    form(req, res)
  })
}

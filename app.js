var _ = require('underscore');
var bluebird = require('bluebird');
var bodyparser = require('body-parser');
var co = require('co');
var express = require('express');
var morgan = require('morgan');

var path = require('path');

var common = require('./common');

co(function* () {
  var server = yield start_server();
  server.on('error', (err) => {
    console.error(err);
    process.exit(1);
  });

  var end_server_once = _.once(end_server);

  console.log('http server is running...press enter key to exit.');
  process.on('SIGTERM', () => {
    co(function* () {
      yield end_server_once(server);
      process.exit(0);
    });
  });
  process.stdin.on('data', (data) => {
    if (data.indexOf('\n') !== -1) {
      co(function* () {
        yield end_server_once(server);
        process.exit(0);
      });
    }
  });
}).catch((err) => {
  console.error(err);
  process.exit(1);
});

function start_server () {
  return co(function* () {
    var server = yield create_server({});
    return server;
  });
}

function create_server (poption) {
  return new bluebird((resolve, reject) => {
    co(function* () {
      var option = _.extend(poption, {
        port: 3000
      });

      var jsonparser = bodyparser.json();

      var app = express();
      app.set('x-powered-by', false);
      app.set('case sensitive routing', true);
      app.set('strict routing', true);
      app.use(morgan('dev'));
      app.use('/asset', express.static('asset'));
      app.get('/list', (req, res, next) => {
        co(function* () {
          var p = 'data';

          var list = _(yield common.load_files_from_path(p)).map((e) => path.basename(e, path.extname(e)));
          yield common.send_res_with_json(res, list);
        }).catch(next);
      });
      app.get('/load', (req, res, next) => {
        co(function* () {
          var name = req.query.name;

          var p = path.join('data', name + '.json');

          var data = yield common.load_json_from_path(p);
          yield common.send_res_with_json(res, data);
        }).catch(next);
      });
      app.post('/save', jsonparser, (req, res, next) => {
        co(function* () {
          var name = req.query.name;
          var data = req.body;

          var p = path.join('data', name + '.json');

          yield common.save_json_to_path(p, data);
          yield common.send_res_with_message(res, 200);
        }).catch(next);
      });
      app.get('*', (req, res, next) => next({ status: 404 }));
      app.post('*', (req, res, next) => next({ status: 404 }));
      app.all('*', (req, res, next) => next({ status: 405 }));
      app.use((err, req, res, next) => {
        co(function* () {
          if (err.status) {
            yield common.send_res_with_message(res, err.status, err.message);
          }
          else {
            yield common.send_res_with_message(res, 500);

            console.error(err);
          }
        }).catch(next);
      });
      var server = app.listen(option.port, () => {
        resolve(server);
      });
      server.once('error', (err) => {
        reject(err);
      });
    }).catch((err) => {
      reject(err);
    });
  });
}

function end_server (server) {
  return new bluebird((resolve, reject) => {
    console.log('http server is closing...');
    server.close(() => {
      console.log('http server closed.');
      resolve(server);
    });
  });
}
var _ = require('underscore');
var bluebird = require('bluebird');
var fsextra = bluebird.promisifyAll(require('fs-extra'));
var pi = require('p-iteration');
var stripbom = require('strip-bom');

var fs = bluebird.promisifyAll(require('fs'));
var http = require('http');
var path = require('path');

var common = {};

common = _.extend(common, {
  load_text_from_path: async (p) => {
    return stripbom(await fs.readFileAsync(p, 'utf-8'));
  },
  load_json_from_path: async (p) => {
    return JSON.parse(await common.load_text_from_path(p));
  },
  save_json_to_path: async (p, json) => {
    await fsextra.mkdirsAsync(path.dirname(p));
    await fs.writeFileAsync(p, JSON.stringify(json), 'utf-8');
  },
  load_files_folders_from_path: async (p) => {
    return _(await fs.readdirAsync(p)).map((v) => path.join(p, v));
  },
  load_files_from_path: async (p) => {
    return pi.filterSeries(await common.load_files_folders_from_path(p), async (v) => (await fs.statAsync(v)).isFile());
  }
});

common = _.extend(common, {
  send_res_with_message: async (res, status, message) => {
    res.type('text/plain; charset=utf-8');
    res.status(status);
    res.send((message ? message : http.STATUS_CODES[status]) + '\r\n');
  },
  send_res_with_json: async (res, json) => {
    res.json(json);
  }
});

module.exports = common;

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setLogger = exports.db = exports.servers = exports.config = undefined;

var _config = require('./config');

var config = _interopRequireWildcard(_config);

var _servers = require('./servers');

var servers = _interopRequireWildcard(_servers);

var _db = require('./db');

var db = _interopRequireWildcard(_db);

var _logger = require('./logger');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

exports.config = config;
exports.servers = servers;
exports.db = db;
exports.setLogger = _logger.setLogger;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CLIENTS = undefined;

var _mysql = require('./mysql');

var _mysql2 = _interopRequireDefault(_mysql);

var _postgresql = require('./postgresql');

var _postgresql2 = _interopRequireDefault(_postgresql);

var _sqlserver = require('./sqlserver');

var _sqlserver2 = _interopRequireDefault(_sqlserver);

var _sqlite = require('./sqlite');

var _sqlite2 = _interopRequireDefault(_sqlite);

var _cassandra = require('./cassandra');

var _cassandra2 = _interopRequireDefault(_cassandra);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * List of supported database clients
 */
const CLIENTS = exports.CLIENTS = [{
  key: 'mysql',
  name: 'MySQL',
  defaultPort: 3306,
  disabledFeatures: ['server:schema', 'server:domain']
}, {
  key: 'postgresql',
  name: 'PostgreSQL',
  defaultDatabase: 'postgres',
  defaultPort: 5432,
  disabledFeatures: ['server:domain']
}, {
  key: 'sqlserver',
  name: 'Microsoft SQL Server',
  defaultPort: 1433
}, {
  key: 'sqlite',
  name: 'SQLite',
  defaultDatabase: ':memory:',
  disabledFeatures: ['server:ssl', 'server:host', 'server:port', 'server:socketPath', 'server:user', 'server:password', 'server:schema', 'server:domain', 'server:ssh', 'scriptCreateTable', 'cancelQuery']
}, {
  key: 'cassandra',
  name: 'Cassandra',
  defaultPort: 9042,
  disabledFeatures: ['server:ssl', 'server:socketPath', 'server:user', 'server:password', 'server:schema', 'server:domain', 'scriptCreateTable', 'cancelQuery']
}];

exports.default = {
  mysql: _mysql2.default,
  postgresql: _postgresql2.default,
  sqlserver: _sqlserver2.default,
  sqlite: _sqlite2.default,
  cassandra: _cassandra2.default
};
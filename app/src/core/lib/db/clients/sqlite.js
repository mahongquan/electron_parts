'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.truncateAllTables = exports.getViewCreateScript = exports.getTableCreateScript = exports.listDatabases = exports.listTableIndexes = exports.listTableTriggers = exports.listTableColumns = exports.listViews = exports.listTables = exports.executeQuery = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

let executeQuery = exports.executeQuery = (() => {
  var _ref3 = _asyncToGenerator(function* (conn, queryText) {
    const result = yield driverExecuteQuery(conn, { query: queryText, multiple: true });

    return result.map(parseRowQueryResult);
  });

  return function executeQuery(_x4, _x5) {
    return _ref3.apply(this, arguments);
  };
})();

let listTables = exports.listTables = (() => {
  var _ref4 = _asyncToGenerator(function* (conn) {
    const sql = `
    SELECT name
    FROM sqlite_master
    WHERE type='table'
    ORDER BY name
  `;

    const { data } = yield driverExecuteQuery(conn, { query: sql });

    return data;
  });

  return function listTables(_x6) {
    return _ref4.apply(this, arguments);
  };
})();

let listViews = exports.listViews = (() => {
  var _ref5 = _asyncToGenerator(function* (conn) {
    const sql = `
    SELECT name
    FROM sqlite_master
    WHERE type = 'view'
  `;

    const { data } = yield driverExecuteQuery(conn, { query: sql });

    return data;
  });

  return function listViews(_x7) {
    return _ref5.apply(this, arguments);
  };
})();

let listTableColumns = exports.listTableColumns = (() => {
  var _ref6 = _asyncToGenerator(function* (conn, database, table) {
    const sql = `PRAGMA table_info('${table}')`;

    const { data } = yield driverExecuteQuery(conn, { query: sql });

    return data.map(function (row) {
      return {
        columnName: row.name,
        dataType: row.type
      };
    });
  });

  return function listTableColumns(_x8, _x9, _x10) {
    return _ref6.apply(this, arguments);
  };
})();

let listTableTriggers = exports.listTableTriggers = (() => {
  var _ref7 = _asyncToGenerator(function* (conn, table) {
    const sql = `
    SELECT name
    FROM sqlite_master
    WHERE type = 'trigger'
      AND tbl_name = '${table}'
  `;

    const { data } = yield driverExecuteQuery(conn, { query: sql });

    return data.map(function (row) {
      return row.name;
    });
  });

  return function listTableTriggers(_x11, _x12) {
    return _ref7.apply(this, arguments);
  };
})();

let listTableIndexes = exports.listTableIndexes = (() => {
  var _ref8 = _asyncToGenerator(function* (conn, database, table) {
    const sql = `PRAGMA INDEX_LIST('${table}')`;

    const { data } = yield driverExecuteQuery(conn, { query: sql });

    return data.map(function (row) {
      return row.name;
    });
  });

  return function listTableIndexes(_x13, _x14, _x15) {
    return _ref8.apply(this, arguments);
  };
})();

let listDatabases = exports.listDatabases = (() => {
  var _ref9 = _asyncToGenerator(function* (conn) {
    const result = yield driverExecuteQuery(conn, { query: 'PRAGMA database_list;' });

    return result.data.map(function (row) {
      return row.file || ':memory:';
    });
  });

  return function listDatabases(_x16) {
    return _ref9.apply(this, arguments);
  };
})();

let getTableCreateScript = exports.getTableCreateScript = (() => {
  var _ref10 = _asyncToGenerator(function* (conn, table) {
    const sql = `
    SELECT sql
    FROM sqlite_master
    WHERE name = '${table}';
  `;

    const { data } = yield driverExecuteQuery(conn, { query: sql });

    return data.map(function (row) {
      return row.sql;
    });
  });

  return function getTableCreateScript(_x17, _x18) {
    return _ref10.apply(this, arguments);
  };
})();

let getViewCreateScript = exports.getViewCreateScript = (() => {
  var _ref11 = _asyncToGenerator(function* (conn, view) {
    const sql = `
    SELECT sql
    FROM sqlite_master
    WHERE name = '${view}';
  `;

    const { data } = yield driverExecuteQuery(conn, { query: sql });

    return data.map(function (row) {
      return row.sql;
    });
  });

  return function getViewCreateScript(_x19, _x20) {
    return _ref11.apply(this, arguments);
  };
})();

let truncateAllTables = exports.truncateAllTables = (() => {
  var _ref12 = _asyncToGenerator(function* (conn) {
    yield runWithConnection(conn, (() => {
      var _ref13 = _asyncToGenerator(function* (connection) {
        const connClient = { connection };

        const tables = yield listTables(connClient);

        const truncateAll = tables.map(function (table) {
          return `
      DELETE FROM ${table.name};
    `;
        }).join('');

        // TODO: Check if sqlite_sequence exists then execute:
        // DELETE FROM sqlite_sequence WHERE name='${table}';

        yield driverExecuteQuery(connClient, { query: truncateAll });
      });

      return function (_x22) {
        return _ref13.apply(this, arguments);
      };
    })());
  });

  return function truncateAllTables(_x21) {
    return _ref12.apply(this, arguments);
  };
})();

exports.disconnect = disconnect;
exports.wrapIdentifier = wrapIdentifier;
exports.getQuerySelectTop = getQuerySelectTop;
exports.query = query;
exports.listRoutines = listRoutines;
exports.listSchemas = listSchemas;
exports.getTableReferences = getTableReferences;
exports.getTableKeys = getTableKeys;
exports.getRoutineCreateScript = getRoutineCreateScript;
exports.driverExecuteQuery = driverExecuteQuery;

var _sqlite = require('sqlite3');

var _sqlite2 = _interopRequireDefault(_sqlite);

var _sqlQueryIdentifier = require('sql-query-identifier');

var _logger = require('../../logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const logger = (0, _logger2.default)('db:clients:sqlite');

const sqliteErrors = {
  CANCELED: 'SQLITE_INTERRUPT'
};

exports.default = (() => {
  var _ref = _asyncToGenerator(function* (server, database) {
    const dbConfig = configDatabase(server, database);
    logger().debug('create driver client for sqlite3 with config %j', dbConfig);

    const conn = { dbConfig };

    // light solution to test connection with with the server
    yield driverExecuteQuery(conn, { query: 'SELECT sqlite_version()' });

    return {
      wrapIdentifier,
      disconnect: function () {
        return disconnect(conn);
      },
      listTables: function () {
        return listTables(conn);
      },
      listViews: function () {
        return listViews(conn);
      },
      listRoutines: function () {
        return listRoutines(conn);
      },
      listTableColumns: function (db, table) {
        return listTableColumns(conn, db, table);
      },
      listTableTriggers: function (table) {
        return listTableTriggers(conn, table);
      },
      listTableIndexes: function (db, table) {
        return listTableIndexes(conn, db, table);
      },
      listSchemas: function () {
        return listSchemas(conn);
      },
      getTableReferences: function (table) {
        return getTableReferences(conn, table);
      },
      getTableKeys: function (db, table) {
        return getTableKeys(conn, db, table);
      },
      query: function (queryText) {
        return query(conn, queryText);
      },
      executeQuery: function (queryText) {
        return executeQuery(conn, queryText);
      },
      listDatabases: function () {
        return listDatabases(conn);
      },
      getQuerySelectTop: function (table, limit) {
        return getQuerySelectTop(conn, table, limit);
      },
      getTableCreateScript: function (table) {
        return getTableCreateScript(conn, table);
      },
      getViewCreateScript: function (view) {
        return getViewCreateScript(conn, view);
      },
      getRoutineCreateScript: function (routine) {
        return getRoutineCreateScript(conn, routine);
      },
      truncateAllTables: function () {
        return truncateAllTables(conn);
      }
    };
  });

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

function disconnect() {
  // SQLite does not have connection poll. So we open and close connections
  // for every query request. This allows multiple request at same time by
  // using a different thread for each connection.
  // This may cause connection limit problem. So we may have to change this at some point.
  return Promise.resolve();
}

function wrapIdentifier(value) {
  if (value === '*') return value;
  const matched = value.match(/(.*?)(\[[0-9]\])/); // eslint-disable-line no-useless-escape
  if (matched) return wrapIdentifier(matched[1]) + matched[2];
  return `"${value.replace(/"/g, '""')}"`;
}

function getQuerySelectTop(client, table, limit) {
  return `SELECT * FROM ${wrapIdentifier(table)} LIMIT ${limit}`;
}

function query(conn, queryText) {
  let queryConnection = null;

  return {
    execute() {
      return runWithConnection(conn, (() => {
        var _ref2 = _asyncToGenerator(function* (connection) {
          try {
            queryConnection = connection;

            const result = yield executeQuery({ connection }, queryText);

            return result;
          } catch (err) {
            if (err.code === sqliteErrors.CANCELED) {
              err.sqlectronError = 'CANCELED_BY_USER';
            }

            throw err;
          }
        });

        return function (_x3) {
          return _ref2.apply(this, arguments);
        };
      })());
    },

    cancel() {
      return _asyncToGenerator(function* () {
        if (!queryConnection) {
          throw new Error('Query not ready to be canceled');
        }

        queryConnection.interrupt();
      })();
    }
  };
}

function listRoutines() {
  return Promise.resolve([]); // DOES NOT SUPPORT IT
}

function listSchemas() {
  return Promise.resolve([]); // DOES NOT SUPPORT IT
}

function getTableReferences() {
  return Promise.resolve([]); // TODO: not implemented yet
}

function getTableKeys() {
  return Promise.resolve([]); // TODO: not implemented yet
}

function getRoutineCreateScript() {
  return Promise.resolve([]); // DOES NOT SUPPORT IT
}

function configDatabase(server, database) {
  return {
    database: database.database
  };
}

function parseRowQueryResult({ data, statement, changes }) {
  // Fallback in case the identifier could not reconize the command
  const isSelect = Array.isArray(data);
  const rows = data || [];
  return {
    command: statement.type || isSelect && 'SELECT',
    rows,
    fields: Object.keys(rows[0] || {}).map(name => ({ name })),
    rowCount: data && data.length,
    affectedRows: changes || 0
  };
}

function identifyCommands(queryText) {
  try {
    return (0, _sqlQueryIdentifier.identify)(queryText, { strict: false });
  } catch (err) {
    return [];
  }
}

function driverExecuteQuery(conn, queryArgs) {
  const runQuery = (connection, { executionType, text }) => new Promise((resolve, reject) => {
    const method = resolveExecutionType(executionType);
    connection[method](text, queryArgs.params, function driverExecQuery(err, data) {
      if (err) {
        return reject(err);
      }

      return resolve({
        data,
        lastID: this.lastID,
        changes: this.changes
      });
    });
  });

  const identifyStatementsRunQuery = (() => {
    var _ref14 = _asyncToGenerator(function* (connection) {
      const statements = identifyCommands(queryArgs.query);

      const results = yield Promise.all(statements.map((() => {
        var _ref15 = _asyncToGenerator(function* (statement) {
          const result = yield runQuery(connection, statement);

          return _extends({}, result, {
            statement
          });
        });

        return function (_x24) {
          return _ref15.apply(this, arguments);
        };
      })()));

      return queryArgs.multiple ? results : results[0];
    });

    return function identifyStatementsRunQuery(_x23) {
      return _ref14.apply(this, arguments);
    };
  })();

  return conn.connection ? identifyStatementsRunQuery(conn.connection) : runWithConnection(conn, identifyStatementsRunQuery);
}

function runWithConnection(conn, run) {
  return new Promise((resolve, reject) => {
    const db = new _sqlite2.default.Database(conn.dbConfig.database, (() => {
      var _ref16 = _asyncToGenerator(function* (err) {
        if (err) {
          reject(err);
          return;
        }

        try {
          db.serialize();
          const results = yield run(db);
          resolve(results);
        } catch (runErr) {
          reject(runErr);
        } finally {
          db.close();
        }
      });

      return function (_x25) {
        return _ref16.apply(this, arguments);
      };
    })());
  });
}

function resolveExecutionType(executioType) {
  switch (executioType) {
    case 'MODIFICATION':
      return 'run';
    default:
      return 'all';
  }
}
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.driverExecuteQuery = exports.truncateAllTables = exports.getRoutineCreateScript = exports.getViewCreateScript = exports.getTableCreateScript = exports.getTableKeys = exports.getTableReferences = exports.listDatabases = exports.listSchemas = exports.listTableIndexes = exports.listTableTriggers = exports.listTableColumns = exports.listRoutines = exports.listViews = exports.listTables = exports.executeQuery = exports.disconnect = undefined;

let disconnect = exports.disconnect = (() => {
  var _ref2 = _asyncToGenerator(function* (conn) {
    const connection = yield new _mssql.Connection(conn.dbConfig);
    connection.close();
  });

  return function disconnect(_x3) {
    return _ref2.apply(this, arguments);
  };
})();

let executeQuery = exports.executeQuery = (() => {
  var _ref4 = _asyncToGenerator(function* (conn, queryText) {
    const { request, data } = yield driverExecuteQuery(conn, { query: queryText, multiple: true });

    const commands = identifyCommands(queryText).map(function (item) {
      return item.type;
    });

    // Executing only non select queries will not return results.
    // So we "fake" there is at least one result.
    const results = !data.length && request.rowsAffected ? [[]] : data;

    return results.map(function (_, idx) {
      return parseRowQueryResult(results[idx], request, commands[idx]);
    });
  });

  return function executeQuery(_x5, _x6) {
    return _ref4.apply(this, arguments);
  };
})();

let getSchema = (() => {
  var _ref5 = _asyncToGenerator(function* (conn) {
    const sql = 'SELECT schema_name() AS \'schema\'';

    const { data } = yield driverExecuteQuery(conn, { query: sql });

    return data[0].schema;
  });

  return function getSchema(_x7) {
    return _ref5.apply(this, arguments);
  };
})();

let listTables = exports.listTables = (() => {
  var _ref6 = _asyncToGenerator(function* (conn, filter) {
    const schemaFilter = (0, _utils.buildSchemaFilter)(filter, 'table_schema');
    const sql = `
    SELECT
      table_schema,
      table_name
    FROM information_schema.tables
    WHERE table_type NOT LIKE '%VIEW%'
    ${schemaFilter ? `AND ${schemaFilter}` : ''}
    ORDER BY table_schema, table_name
  `;

    const { data } = yield driverExecuteQuery(conn, { query: sql });

    return data.map(function (item) {
      return {
        schema: item.table_schema,
        name: item.table_name
      };
    });
  });

  return function listTables(_x8, _x9) {
    return _ref6.apply(this, arguments);
  };
})();

let listViews = exports.listViews = (() => {
  var _ref7 = _asyncToGenerator(function* (conn, filter) {
    const schemaFilter = (0, _utils.buildSchemaFilter)(filter, 'table_schema');
    const sql = `
    SELECT
      table_schema,
      table_name
    FROM information_schema.views
    ${schemaFilter ? `WHERE ${schemaFilter}` : ''}
    ORDER BY table_schema, table_name
  `;

    const { data } = yield driverExecuteQuery(conn, { query: sql });

    return data.map(function (item) {
      return {
        schema: item.table_schema,
        name: item.table_name
      };
    });
  });

  return function listViews(_x10, _x11) {
    return _ref7.apply(this, arguments);
  };
})();

let listRoutines = exports.listRoutines = (() => {
  var _ref8 = _asyncToGenerator(function* (conn, filter) {
    const schemaFilter = (0, _utils.buildSchemaFilter)(filter, 'routine_schema');
    const sql = `
    SELECT
      routine_schema,
      routine_name,
      routine_type
    FROM information_schema.routines
    ${schemaFilter ? `WHERE ${schemaFilter}` : ''}
    GROUP BY routine_schema, routine_name, routine_type
    ORDER BY routine_schema, routine_name
  `;

    const { data } = yield driverExecuteQuery(conn, { query: sql });

    return data.map(function (row) {
      return {
        schema: row.routine_schema,
        routineName: row.routine_name,
        routineType: row.routine_type
      };
    });
  });

  return function listRoutines(_x12, _x13) {
    return _ref8.apply(this, arguments);
  };
})();

let listTableColumns = exports.listTableColumns = (() => {
  var _ref9 = _asyncToGenerator(function* (conn, database, table) {
    const sql = `
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = '${table}'
  `;

    const { data } = yield driverExecuteQuery(conn, { query: sql });

    return data.map(function (row) {
      return {
        columnName: row.column_name,
        dataType: row.data_type
      };
    });
  });

  return function listTableColumns(_x14, _x15, _x16) {
    return _ref9.apply(this, arguments);
  };
})();

let listTableTriggers = exports.listTableTriggers = (() => {
  var _ref10 = _asyncToGenerator(function* (conn, table) {
    // SQL Server does not have information_schema for triggers, so other way around
    // is using sp_helptrigger stored procedure to fetch triggers related to table
    const sql = `EXEC sp_helptrigger ${wrapIdentifier(table)}`;

    const { data } = yield driverExecuteQuery(conn, { query: sql });

    return data.map(function (row) {
      return row.trigger_name;
    });
  });

  return function listTableTriggers(_x17, _x18) {
    return _ref10.apply(this, arguments);
  };
})();

let listTableIndexes = exports.listTableIndexes = (() => {
  var _ref11 = _asyncToGenerator(function* (conn, database, table) {
    // SQL Server does not have information_schema for indexes, so other way around
    // is using sp_helpindex stored procedure to fetch indexes related to table
    const sql = `EXEC sp_helpindex ${wrapIdentifier(table)}`;

    const { data } = yield driverExecuteQuery(conn, { query: sql });

    return data.map(function (row) {
      return row.index_name;
    });
  });

  return function listTableIndexes(_x19, _x20, _x21) {
    return _ref11.apply(this, arguments);
  };
})();

let listSchemas = exports.listSchemas = (() => {
  var _ref12 = _asyncToGenerator(function* (conn, filter) {
    const schemaFilter = (0, _utils.buildSchemaFilter)(filter);
    const sql = `
    SELECT schema_name
    FROM information_schema.schemata
    ${schemaFilter ? `WHERE ${schemaFilter}` : ''}
    ORDER BY schema_name
  `;

    const { data } = yield driverExecuteQuery(conn, { query: sql });

    return data.map(function (row) {
      return row.schema_name;
    });
  });

  return function listSchemas(_x22, _x23) {
    return _ref12.apply(this, arguments);
  };
})();

let listDatabases = exports.listDatabases = (() => {
  var _ref13 = _asyncToGenerator(function* (conn, filter) {
    const databaseFilter = (0, _utils.buildDatabseFilter)(filter, 'name');
    const sql = `
    SELECT name
    FROM sys.databases
    ${databaseFilter ? `AND ${databaseFilter}` : ''}
    ORDER BY name
  `;

    const { data } = yield driverExecuteQuery(conn, { query: sql });

    return data.map(function (row) {
      return row.name;
    });
  });

  return function listDatabases(_x24, _x25) {
    return _ref13.apply(this, arguments);
  };
})();

let getTableReferences = exports.getTableReferences = (() => {
  var _ref14 = _asyncToGenerator(function* (conn, table) {
    const sql = `
    SELECT OBJECT_NAME(referenced_object_id) referenced_table_name
    FROM sys.foreign_keys
    WHERE parent_object_id = OBJECT_ID('${table}')
  `;

    const { data } = yield driverExecuteQuery(conn, { query: sql });

    return data.map(function (row) {
      return row.referenced_table_name;
    });
  });

  return function getTableReferences(_x26, _x27) {
    return _ref14.apply(this, arguments);
  };
})();

let getTableKeys = exports.getTableKeys = (() => {
  var _ref15 = _asyncToGenerator(function* (conn, database, table) {
    const sql = `
    SELECT
      tc.constraint_name,
      kcu.column_name,
      CASE WHEN tc.constraint_type LIKE '%FOREIGN%' THEN OBJECT_NAME(sfk.referenced_object_id)
      ELSE NULL
      END AS referenced_table_name,
      tc.constraint_type
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN sys.foreign_keys as sfk
      ON sfk.parent_object_id = OBJECT_ID(tc.table_name)
    WHERE tc.table_name = '${table}'
    AND tc.constraint_type IN ('PRIMARY KEY', 'FOREIGN KEY')
  `;

    const { data } = yield driverExecuteQuery(conn, { query: sql });

    return data.map(function (row) {
      return {
        constraintName: row.constraint_name,
        columnName: row.column_name,
        referencedTable: row.referenced_table_name,
        keyType: row.constraint_type
      };
    });
  });

  return function getTableKeys(_x28, _x29, _x30) {
    return _ref15.apply(this, arguments);
  };
})();

let getTableCreateScript = exports.getTableCreateScript = (() => {
  var _ref16 = _asyncToGenerator(function* (conn, table) {
    // Reference http://stackoverflow.com/a/317864
    const sql = `
    SELECT  ('CREATE TABLE ' + so.name + ' (' +
      CHAR(13)+CHAR(10) + REPLACE(o.list, '&#x0D;', CHAR(13)) +
      ')' + CHAR(13)+CHAR(10) +
      CASE WHEN tc.Constraint_Name IS NULL THEN ''
           ELSE + CHAR(13)+CHAR(10) + 'ALTER TABLE ' + so.Name +
           ' ADD CONSTRAINT ' + tc.Constraint_Name  +
           ' PRIMARY KEY ' + '(' + LEFT(j.List, Len(j.List)-1) + ')'
      END) AS createtable
    FROM sysobjects so
    CROSS APPLY
      (SELECT
        '  ' + column_name + ' ' +
        data_type +
        CASE data_type
            WHEN 'sql_variant' THEN ''
            WHEN 'text' THEN ''
            WHEN 'ntext' THEN ''
            WHEN 'xml' THEN ''
            WHEN 'decimal' THEN '(' + cast(numeric_precision AS varchar) + ', '
                  + cast(numeric_scale AS varchar) + ')'
            ELSE coalesce('('+ CASE WHEN character_maximum_length = -1
                  THEN 'MAX'
                  ELSE cast(character_maximum_length AS varchar)
                END + ')','')
          END + ' ' +
          CASE WHEN EXISTS (
            SELECT id FROM syscolumns
            WHERE object_name(id)=so.name
            AND name=column_name
            AND columnproperty(id,name,'IsIdentity') = 1
          ) THEN
            'IDENTITY(' +
            cast(ident_seed(so.name) AS varchar) + ',' +
            cast(ident_incr(so.name) AS varchar) + ')'
          ELSE ''
          END + ' ' +
           (CASE WHEN IS_NULLABLE = 'No'
                 THEN 'NOT '
                 ELSE ''
          END ) + 'NULL' +
          CASE WHEN information_schema.columns.COLUMN_DEFAULT IS NOT NULL
               THEN 'DEFAULT '+ information_schema.columns.COLUMN_DEFAULT
               ELSE ''
          END + ',' + CHAR(13)+CHAR(10)
       FROM information_schema.columns WHERE table_name = so.name
       ORDER BY ordinal_position
       FOR XML PATH('')
    ) o (list)
    LEFT JOIN information_schema.table_constraints tc
    ON  tc.Table_name       = so.Name
    AND tc.Constraint_Type  = 'PRIMARY KEY'
    CROSS APPLY
        (SELECT Column_Name + ', '
         FROM   information_schema.key_column_usage kcu
         WHERE  kcu.Constraint_Name = tc.Constraint_Name
         ORDER BY ORDINAL_POSITION
         FOR XML PATH('')
        ) j (list)
    WHERE   xtype = 'U'
    AND name    NOT IN ('dtproperties')
    AND so.name = '${table}'
  `;

    const { data } = yield driverExecuteQuery(conn, { query: sql });

    return data.map(function (row) {
      return row.createtable;
    });
  });

  return function getTableCreateScript(_x31, _x32) {
    return _ref16.apply(this, arguments);
  };
})();

let getViewCreateScript = exports.getViewCreateScript = (() => {
  var _ref17 = _asyncToGenerator(function* (conn, view) {
    const sql = `SELECT OBJECT_DEFINITION (OBJECT_ID('${view}')) AS ViewDefinition;`;

    const { data } = yield driverExecuteQuery(conn, { query: sql });

    return data.map(function (row) {
      return row.ViewDefinition;
    });
  });

  return function getViewCreateScript(_x33, _x34) {
    return _ref17.apply(this, arguments);
  };
})();

let getRoutineCreateScript = exports.getRoutineCreateScript = (() => {
  var _ref18 = _asyncToGenerator(function* (conn, routine) {
    const sql = `
    SELECT routine_definition
    FROM information_schema.routines
    WHERE routine_name = '${routine}'
  `;

    const { data } = yield driverExecuteQuery(conn, { query: sql });

    return data.map(function (row) {
      return row.routine_definition;
    });
  });

  return function getRoutineCreateScript(_x35, _x36) {
    return _ref18.apply(this, arguments);
  };
})();

let truncateAllTables = exports.truncateAllTables = (() => {
  var _ref19 = _asyncToGenerator(function* (conn) {
    yield runWithConnection(conn, (() => {
      var _ref20 = _asyncToGenerator(function* (connection) {
        const connClient = { connection };
        const schema = yield getSchema(connClient);

        const sql = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = '${schema}'
      AND table_type NOT LIKE '%VIEW%'
    `;

        const { data } = yield driverExecuteQuery(connClient, { query: sql });

        const truncateAll = data.map(function (row) {
          return `
      DELETE FROM ${wrapIdentifier(schema)}.${wrapIdentifier(row.table_name)}
      DBCC CHECKIDENT ('${schema}.${row.table_name}', RESEED, 0);
    `;
        }).join('');

        yield driverExecuteQuery(connClient, { query: truncateAll, multiple: true });
      });

      return function (_x38) {
        return _ref20.apply(this, arguments);
      };
    })());
  });

  return function truncateAllTables(_x37) {
    return _ref19.apply(this, arguments);
  };
})();

let driverExecuteQuery = exports.driverExecuteQuery = (() => {
  var _ref21 = _asyncToGenerator(function* (conn, queryArgs) {
    const runQuery = (() => {
      var _ref22 = _asyncToGenerator(function* (connection) {
        const request = connection.request();
        if (queryArgs.multiple) {
          request.multiple = true;
        }

        return {
          request,
          data: yield request.query(queryArgs.query)
        };
      });

      return function runQuery(_x41) {
        return _ref22.apply(this, arguments);
      };
    })();

    return conn.connection ? runQuery(conn.connection) : runWithConnection(conn, runQuery);
  });

  return function driverExecuteQuery(_x39, _x40) {
    return _ref21.apply(this, arguments);
  };
})();

let runWithConnection = (() => {
  var _ref23 = _asyncToGenerator(function* (conn, run) {
    const connection = yield new _mssql.Connection(conn.dbConfig).connect();

    return run(connection);
  });

  return function runWithConnection(_x42, _x43) {
    return _ref23.apply(this, arguments);
  };
})();

exports.wrapIdentifier = wrapIdentifier;
exports.getQuerySelectTop = getQuerySelectTop;
exports.query = query;

var _mssql = require('mssql');

var _sqlQueryIdentifier = require('sql-query-identifier');

var _utils = require('./utils');

var _logger = require('../../logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const logger = (0, _logger2.default)('db:clients:sqlserver');

const mmsqlErrors = {
  CANCELED: 'ECANCEL'
};

exports.default = (() => {
  var _ref = _asyncToGenerator(function* (server, database) {
    const dbConfig = configDatabase(server, database);
    logger().debug('create driver client for mmsql with config %j', dbConfig);

    const conn = { dbConfig };

    // light solution to test connection with with the server
    yield driverExecuteQuery(conn, { query: 'SELECT @@version' });

    return {
      wrapIdentifier,
      disconnect: function () {
        return disconnect(conn);
      },
      listTables: function (db, filter) {
        return listTables(conn, filter);
      },
      listViews: function (filter) {
        return listViews(conn, filter);
      },
      listRoutines: function (filter) {
        return listRoutines(conn, filter);
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
      listDatabases: function (filter) {
        return listDatabases(conn, filter);
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

function wrapIdentifier(value) {
  return value !== '*' ? `[${value.replace(/\[/g, '[')}]` : '*';
}

function getQuerySelectTop(client, table, limit) {
  return `SELECT TOP ${limit} * FROM ${wrapIdentifier(table)}`;
}

function query(conn, queryText) {
  let queryRequest = null;

  return {
    execute() {
      return runWithConnection(conn, (() => {
        var _ref3 = _asyncToGenerator(function* (connection) {
          const request = connection.request();
          request.multiple = true;

          try {
            const promiseQuery = request.query(queryText);

            queryRequest = request;

            const data = yield promiseQuery;

            const commands = identifyCommands(queryText).map(function (item) {
              return item.type;
            });

            // Executing only non select queries will not return results.
            // So we "fake" there is at least one result.
            const results = !data.length && request.rowsAffected ? [[]] : data;

            return results.map(function (_, idx) {
              return parseRowQueryResult(results[idx], request, commands[idx]);
            });
          } catch (err) {
            if (err.code === mmsqlErrors.CANCELED) {
              err.sqlectronError = 'CANCELED_BY_USER';
            }

            throw err;
          }
        });

        return function (_x4) {
          return _ref3.apply(this, arguments);
        };
      })());
    },

    cancel() {
      return _asyncToGenerator(function* () {
        if (!queryRequest) {
          throw new Error('Query not ready to be canceled');
        }

        queryRequest.cancel();
      })();
    }
  };
}

function configDatabase(server, database) {
  const config = {
    user: server.config.user,
    password: server.config.password,
    server: server.config.host,
    database: database.database,
    port: server.config.port,
    requestTimeout: Infinity,
    appName: server.config.applicationName || 'sqlectron',
    domain: server.config.domain,
    pool: {
      max: 5
    },
    options: {
      encrypt: server.config.ssl
    }
  };

  if (server.sshTunnel) {
    config.server = server.config.localHost;
    config.port = server.config.localPort;
  }

  return config;
}

function parseRowQueryResult(data, request, command) {
  // Fallback in case the identifier could not reconize the command
  const isSelect = !!(data.length || !request.rowsAffected);

  return {
    command: command || isSelect && 'SELECT',
    rows: data,
    fields: Object.keys(data[0] || {}).map(name => ({ name })),
    rowCount: data.length,
    affectedRows: request.rowsAffected
  };
}

function identifyCommands(queryText) {
  try {
    return (0, _sqlQueryIdentifier.identify)(queryText);
  } catch (err) {
    return [];
  }
}
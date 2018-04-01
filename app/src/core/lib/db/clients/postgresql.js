'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.truncateAllTables = exports.getRoutineCreateScript = exports.getViewCreateScript = exports.getTableCreateScript = exports.listDatabases = exports.executeQuery = exports.getTableKeys = exports.getTableReferences = exports.listSchemas = exports.listTableIndexes = exports.listTableTriggers = exports.listTableColumns = exports.listRoutines = exports.listViews = exports.listTables = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

let listTables = exports.listTables = (() => {
  var _ref2 = _asyncToGenerator(function* (conn, filter) {
    const schemaFilter = (0, _utils.buildSchemaFilter)(filter, 'table_schema');
    const sql = `
    SELECT
      table_schema as schema,
      table_name as name
    FROM information_schema.tables
    WHERE table_type NOT LIKE '%VIEW%'
    ${schemaFilter ? `AND ${schemaFilter}` : ''}
    ORDER BY table_schema, table_name
  `;

    const data = yield driverExecuteQuery(conn, { query: sql });

    return data.rows;
  });

  return function listTables(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
})();

let listViews = exports.listViews = (() => {
  var _ref3 = _asyncToGenerator(function* (conn, filter) {
    const schemaFilter = (0, _utils.buildSchemaFilter)(filter, 'table_schema');
    const sql = `
    SELECT
      table_schema as schema,
      table_name as name
    FROM information_schema.views
    ${schemaFilter ? `WHERE ${schemaFilter}` : ''}
    ORDER BY table_schema, table_name
  `;

    const data = yield driverExecuteQuery(conn, { query: sql });

    return data.rows;
  });

  return function listViews(_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
})();

let listRoutines = exports.listRoutines = (() => {
  var _ref4 = _asyncToGenerator(function* (conn, filter) {
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

    const data = yield driverExecuteQuery(conn, { query: sql });

    return data.rows.map(function (row) {
      return {
        schema: row.routine_schema,
        routineName: row.routine_name,
        routineType: row.routine_type
      };
    });
  });

  return function listRoutines(_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
})();

let listTableColumns = exports.listTableColumns = (() => {
  var _ref5 = _asyncToGenerator(function* (conn, database, table, schema) {
    const sql = `
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = $1
    AND table_name = $2
  `;

    const params = [schema, table];

    const data = yield driverExecuteQuery(conn, { query: sql, params });

    return data.rows.map(function (row) {
      return {
        columnName: row.column_name,
        dataType: row.data_type
      };
    });
  });

  return function listTableColumns(_x9, _x10, _x11, _x12) {
    return _ref5.apply(this, arguments);
  };
})();

let listTableTriggers = exports.listTableTriggers = (() => {
  var _ref6 = _asyncToGenerator(function* (conn, table, schema) {
    const sql = `
    SELECT trigger_name
    FROM information_schema.triggers
    WHERE event_object_schema = $1
    AND event_object_table = $2
  `;

    const params = [schema, table];

    const data = yield driverExecuteQuery(conn, { query: sql, params });

    return data.rows.map(function (row) {
      return row.trigger_name;
    });
  });

  return function listTableTriggers(_x13, _x14, _x15) {
    return _ref6.apply(this, arguments);
  };
})();

let listTableIndexes = exports.listTableIndexes = (() => {
  var _ref7 = _asyncToGenerator(function* (conn, table, schema) {
    const sql = `
    SELECT indexname as index_name
    FROM pg_indexes
    WHERE schemaname = $1
    AND tablename = $2
  `;

    const params = [schema, table];

    const data = yield driverExecuteQuery(conn, { query: sql, params });

    return data.rows.map(function (row) {
      return row.index_name;
    });
  });

  return function listTableIndexes(_x16, _x17, _x18) {
    return _ref7.apply(this, arguments);
  };
})();

let listSchemas = exports.listSchemas = (() => {
  var _ref8 = _asyncToGenerator(function* (conn, filter) {
    const schemaFilter = (0, _utils.buildSchemaFilter)(filter);
    const sql = `
    SELECT schema_name
    FROM information_schema.schemata
    ${schemaFilter ? `WHERE ${schemaFilter}` : ''}
    ORDER BY schema_name
  `;

    const data = yield driverExecuteQuery(conn, { query: sql });

    return data.rows.map(function (row) {
      return row.schema_name;
    });
  });

  return function listSchemas(_x19, _x20) {
    return _ref8.apply(this, arguments);
  };
})();

let getTableReferences = exports.getTableReferences = (() => {
  var _ref9 = _asyncToGenerator(function* (conn, table, schema) {
    const sql = `
    SELECT ctu.table_name AS referenced_table_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.constraint_table_usage AS ctu
    ON ctu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = $1
    AND tc.table_schema = $2
  `;

    const params = [table, schema];

    const data = yield driverExecuteQuery(conn, { query: sql, params });

    return data.rows.map(function (row) {
      return row.referenced_table_name;
    });
  });

  return function getTableReferences(_x21, _x22, _x23) {
    return _ref9.apply(this, arguments);
  };
})();

let getTableKeys = exports.getTableKeys = (() => {
  var _ref10 = _asyncToGenerator(function* (conn, database, table, schema) {
    const sql = `
    SELECT
      tc.constraint_name,
      kcu.column_name,
      CASE WHEN tc.constraint_type LIKE '%FOREIGN%' THEN ctu.table_name
      ELSE NULL
      END AS referenced_table_name,
      tc.constraint_type
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      USING (constraint_schema, constraint_name)
    JOIN information_schema.constraint_table_usage as ctu
      USING (constraint_schema, constraint_name)
    WHERE tc.table_name = $1
    AND tc.table_schema = $2
    AND tc.constraint_type IN ('PRIMARY KEY', 'FOREIGN KEY')

  `;

    const params = [table, schema];

    const data = yield driverExecuteQuery(conn, { query: sql, params });

    return data.rows.map(function (row) {
      return {
        constraintName: row.constraint_name,
        columnName: row.column_name,
        referencedTable: row.referenced_table_name,
        keyType: row.constraint_type
      };
    });
  });

  return function getTableKeys(_x24, _x25, _x26, _x27) {
    return _ref10.apply(this, arguments);
  };
})();

let executeQuery = exports.executeQuery = (() => {
  var _ref12 = _asyncToGenerator(function* (conn, queryText) {
    const data = yield driverExecuteQuery(conn, { query: queryText, multiple: true });

    const commands = identifyCommands(queryText).map(function (item) {
      return item.type;
    });

    return data.map(function (result, idx) {
      return parseRowQueryResult(result, commands[idx]);
    });
  });

  return function executeQuery(_x29, _x30) {
    return _ref12.apply(this, arguments);
  };
})();

let listDatabases = exports.listDatabases = (() => {
  var _ref13 = _asyncToGenerator(function* (conn, filter) {
    const databaseFilter = (0, _utils.buildDatabseFilter)(filter, 'datname');
    const sql = `
    SELECT datname
    FROM pg_database
    WHERE datistemplate = $1
    ${databaseFilter ? `AND ${databaseFilter}` : ''}
    ORDER BY datname
  `;

    const params = [false];

    const data = yield driverExecuteQuery(conn, { query: sql, params });

    return data.rows.map(function (row) {
      return row.datname;
    });
  });

  return function listDatabases(_x31, _x32) {
    return _ref13.apply(this, arguments);
  };
})();

let getTableCreateScript = exports.getTableCreateScript = (() => {
  var _ref14 = _asyncToGenerator(function* (conn, table, schema) {
    // Reference http://stackoverflow.com/a/32885178
    const sql = `
    SELECT
      'CREATE TABLE ' || quote_ident(tabdef.schema_name) || '.' || quote_ident(tabdef.table_name) || E' (\n' ||
      array_to_string(
        array_agg(
          '  ' || quote_ident(tabdef.column_name) || ' ' ||  tabdef.type || ' '|| tabdef.not_null
        )
        , E',\n'
      ) || E'\n);\n' ||
      CASE WHEN tc.constraint_name IS NULL THEN ''
           ELSE E'\nALTER TABLE ' || quote_ident($2) || '.' || quote_ident(tabdef.table_name) ||
           ' ADD CONSTRAINT ' || quote_ident(tc.constraint_name)  ||
           ' PRIMARY KEY ' || '(' || substring(constr.column_name from 0 for char_length(constr.column_name)-1) || ')'
      END AS createtable
    FROM
    ( SELECT
        c.relname AS table_name,
        a.attname AS column_name,
        pg_catalog.format_type(a.atttypid, a.atttypmod) AS type,
        CASE
          WHEN a.attnotnull THEN 'NOT NULL'
        ELSE 'NULL'
        END AS not_null,
        n.nspname as schema_name
      FROM pg_class c,
       pg_attribute a,
       pg_type t,
       pg_namespace n
      WHERE c.relname = $1
      AND a.attnum > 0
      AND a.attrelid = c.oid
      AND a.atttypid = t.oid
      AND n.oid = c.relnamespace
      AND n.nspname = $2
      ORDER BY a.attnum DESC
    ) AS tabdef
    LEFT JOIN information_schema.table_constraints tc
    ON  tc.table_name       = tabdef.table_name
    AND tc.table_schema     = tabdef.schema_name
    AND tc.constraint_Type  = 'PRIMARY KEY'
    LEFT JOIN LATERAL (
      SELECT column_name || ', ' AS column_name
      FROM   information_schema.key_column_usage kcu
      WHERE  kcu.constraint_name = tc.constraint_name
      AND kcu.table_name = tabdef.table_name
      AND kcu.table_schema = tabdef.schema_name
      ORDER BY ordinal_position
    ) AS constr ON true
    GROUP BY tabdef.schema_name, tabdef.table_name, tc.constraint_name, constr.column_name;
  `;

    const params = [table, schema];

    const data = yield driverExecuteQuery(conn, { query: sql, params });

    return data.rows.map(function (row) {
      return row.createtable;
    });
  });

  return function getTableCreateScript(_x33, _x34, _x35) {
    return _ref14.apply(this, arguments);
  };
})();

let getViewCreateScript = exports.getViewCreateScript = (() => {
  var _ref15 = _asyncToGenerator(function* (conn, view, schema) {
    const createViewSql = `CREATE OR REPLACE VIEW ${wrapIdentifier(schema)}.${view} AS`;

    const sql = 'SELECT pg_get_viewdef($1::regclass, true)';

    const params = [view];

    const data = yield driverExecuteQuery(conn, { query: sql, params });

    return data.rows.map(function (row) {
      return `${createViewSql}\n${row.pg_get_viewdef}`;
    });
  });

  return function getViewCreateScript(_x36, _x37, _x38) {
    return _ref15.apply(this, arguments);
  };
})();

let getRoutineCreateScript = exports.getRoutineCreateScript = (() => {
  var _ref16 = _asyncToGenerator(function* (conn, routine, _, schema) {
    const sql = `
    SELECT pg_get_functiondef(p.oid)
    FROM pg_proc p
    LEFT JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
    WHERE proname = $1
    AND n.nspname = $2
  `;

    const params = [routine, schema];

    const data = yield driverExecuteQuery(conn, { query: sql, params });

    return data.rows.map(function (row) {
      return row.pg_get_functiondef;
    });
  });

  return function getRoutineCreateScript(_x39, _x40, _x41, _x42) {
    return _ref16.apply(this, arguments);
  };
})();

let getSchema = (() => {
  var _ref17 = _asyncToGenerator(function* (conn) {
    const sql = 'SELECT current_schema() AS schema';

    const data = yield driverExecuteQuery(conn, { query: sql });

    return data.rows[0].schema;
  });

  return function getSchema(_x43) {
    return _ref17.apply(this, arguments);
  };
})();

let truncateAllTables = exports.truncateAllTables = (() => {
  var _ref18 = _asyncToGenerator(function* (conn, schema) {
    yield runWithConnection(conn, (() => {
      var _ref19 = _asyncToGenerator(function* (connection) {
        const connClient = { connection };

        const sql = `
      SELECT quote_ident(table_name) as table_name
      FROM information_schema.tables
      WHERE table_schema = $1
      AND table_type NOT LIKE '%VIEW%'
    `;

        const params = [schema];

        const data = yield driverExecuteQuery(connClient, { query: sql, params });

        const truncateAll = data.rows.map(function (row) {
          return `
      TRUNCATE TABLE ${wrapIdentifier(schema)}.${wrapIdentifier(row.table_name)}
      RESTART IDENTITY CASCADE;
    `;
        }).join('');

        yield driverExecuteQuery(connClient, { query: truncateAll, multiple: true });
      });

      return function (_x46) {
        return _ref19.apply(this, arguments);
      };
    })());
  });

  return function truncateAllTables(_x44, _x45) {
    return _ref18.apply(this, arguments);
  };
})();

let runWithConnection = (() => {
  var _ref20 = _asyncToGenerator(function* ({ pool }, run) {
    const connection = yield pool.connect();

    try {
      return yield run(connection);
    } finally {
      connection.release();
    }
  });

  return function runWithConnection(_x47, _x48) {
    return _ref20.apply(this, arguments);
  };
})();

exports.disconnect = disconnect;
exports.query = query;
exports.getQuerySelectTop = getQuerySelectTop;
exports.wrapIdentifier = wrapIdentifier;

var _pg = require('pg');

var _pg2 = _interopRequireDefault(_pg);

var _sqlQueryIdentifier = require('sql-query-identifier');

var _utils = require('./utils');

var _logger = require('../../logger');

var _logger2 = _interopRequireDefault(_logger);

var _utils2 = require('../../utils');

var _errors = require('../../errors');

var _errors2 = _interopRequireDefault(_errors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const logger = (0, _logger2.default)('db:clients:postgresql');

const pgErrors = {
  CANCELED: '57014'
};

/**
 * Do not convert DATE types to JS date.
 * It gnores of applying a wrong timezone to the date.
 * TODO: do not convert as well these same types with array (types 1115, 1182, 1185)
 */
_pg2.default.types.setTypeParser(1082, 'text', val => val); // date
_pg2.default.types.setTypeParser(1114, 'text', val => val); // timestamp without timezone
_pg2.default.types.setTypeParser(1184, 'text', val => val); // timestamp


exports.default = (() => {
  var _ref = _asyncToGenerator(function* (server, database) {
    const dbConfig = configDatabase(server, database);
    logger().debug('create driver client for postgres with config %j', dbConfig);

    const conn = {
      pool: new _pg2.default.Pool(dbConfig)
    };

    logger().debug('connected');
    const defaultSchema = yield getSchema(conn);

    return {
      /* eslint max-len:0 */
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
      listTableColumns: function (db, table, schema = defaultSchema) {
        return listTableColumns(conn, db, table, schema);
      },
      listTableTriggers: function (table, schema = defaultSchema) {
        return listTableTriggers(conn, table, schema);
      },
      listTableIndexes: function (db, table, schema = defaultSchema) {
        return listTableIndexes(conn, table, schema);
      },
      listSchemas: function (db, filter) {
        return listSchemas(conn, filter);
      },
      getTableReferences: function (table, schema = defaultSchema) {
        return getTableReferences(conn, table, schema);
      },
      getTableKeys: function (db, table, schema = defaultSchema) {
        return getTableKeys(conn, db, table, schema);
      },
      query: function (queryText, schema = defaultSchema) {
        return query(conn, queryText, schema);
      },
      executeQuery: function (queryText, schema = defaultSchema) {
        return executeQuery(conn, queryText, schema);
      },
      listDatabases: function (filter) {
        return listDatabases(conn, filter);
      },
      getQuerySelectTop: function (table, limit, schema = defaultSchema) {
        return getQuerySelectTop(conn, table, limit, schema);
      },
      getTableCreateScript: function (table, schema = defaultSchema) {
        return getTableCreateScript(conn, table, schema);
      },
      getViewCreateScript: function (view, schema = defaultSchema) {
        return getViewCreateScript(conn, view, schema);
      },
      getRoutineCreateScript: function (routine, type, schema = defaultSchema) {
        return getRoutineCreateScript(conn, routine, type, schema);
      },
      truncateAllTables: function (_, schema = defaultSchema) {
        return truncateAllTables(conn, schema);
      }
    };
  });

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

function disconnect(conn) {
  conn.pool.end();
}

function query(conn, queryText) {
  let pid = null;
  let canceling = false;
  const cancelable = (0, _utils2.createCancelablePromise)(_extends({}, _errors2.default.CANCELED_BY_USER, {
    sqlectronError: 'CANCELED_BY_USER'
  }));

  return {
    execute() {
      return runWithConnection(conn, (() => {
        var _ref11 = _asyncToGenerator(function* (connection) {
          const connClient = { connection };

          const dataPid = yield driverExecuteQuery(connClient, {
            query: 'SELECT pg_backend_pid() AS pid'
          });

          pid = dataPid.rows[0].pid;

          try {
            const data = yield Promise.race([cancelable.wait(), executeQuery(connClient, queryText)]);

            pid = null;

            return data;
          } catch (err) {
            if (canceling && err.code === pgErrors.CANCELED) {
              canceling = false;
              err.sqlectronError = 'CANCELED_BY_USER';
            }

            throw err;
          } finally {
            cancelable.discard();
          }
        });

        return function (_x28) {
          return _ref11.apply(this, arguments);
        };
      })());
    },

    cancel() {
      return _asyncToGenerator(function* () {
        if (!pid) {
          throw new Error('Query not ready to be canceled');
        }

        canceling = true;
        try {
          const data = yield driverExecuteQuery(conn, {
            query: `SELECT pg_cancel_backend(${pid});`
          });

          if (!data.rows[0].pg_cancel_backend) {
            throw new Error(`Failed canceling query with pid ${pid}.`);
          }

          cancelable.cancel();
        } catch (err) {
          canceling = false;
          throw err;
        }
      })();
    }
  };
}

function getQuerySelectTop(conn, table, limit, schema) {
  return `SELECT * FROM ${wrapIdentifier(schema)}.${wrapIdentifier(table)} LIMIT ${limit}`;
}

function wrapIdentifier(value) {
  if (value === '*') return value;
  const matched = value.match(/(.*?)(\[[0-9]\])/); // eslint-disable-line no-useless-escape
  if (matched) return wrapIdentifier(matched[1]) + matched[2];
  return `"${value.replace(/"/g, '""')}"`;
}

function configDatabase(server, database) {
  const config = {
    host: server.config.host,
    port: server.config.port,
    user: server.config.user,
    password: server.config.password,
    database: database.database,
    max: 5 // max idle connections per time (30 secs)
  };

  if (server.sshTunnel) {
    config.host = server.config.localHost;
    config.port = server.config.localPort;
  }

  if (server.config.ssl) {
    config.ssl = server.config.ssl;
  }

  return config;
}

function parseRowQueryResult(data, command) {
  const isSelect = data.command === 'SELECT';
  return {
    command: command || data.command,
    rows: data.rows,
    fields: data.fields,
    rowCount: isSelect ? data.rowCount || data.rows.length : undefined,
    affectedRows: !isSelect && !isNaN(data.rowCount) ? data.rowCount : undefined
  };
}

function identifyCommands(queryText) {
  try {
    return (0, _sqlQueryIdentifier.identify)(queryText);
  } catch (err) {
    return [];
  }
}

function driverExecuteQuery(conn, queryArgs) {
  const runQuery = connection => {
    const args = {
      text: queryArgs.query,
      values: queryArgs.params,
      multiResult: queryArgs.multiple
    };

    // node-postgres has support for Promise query
    // but that always returns the "fields" property empty
    return new Promise((resolve, reject) => {
      connection.query(args, (err, data) => {
        if (err) return reject(err);
        resolve(data);
      });
    });
  };

  return conn.connection ? runQuery(conn.connection) : runWithConnection(conn, runQuery);
}
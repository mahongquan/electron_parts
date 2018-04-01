'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getConfigPath = getConfigPath;
exports.homedir = homedir;
exports.fileExists = fileExists;
exports.fileExistsSync = fileExistsSync;
exports.writeFile = writeFile;
exports.writeJSONFile = writeJSONFile;
exports.writeJSONFileSync = writeJSONFileSync;
exports.readFile = readFile;
exports.readJSONFile = readJSONFile;
exports.readJSONFileSync = readJSONFileSync;
exports.createParentDirectory = createParentDirectory;
exports.createParentDirectorySync = createParentDirectorySync;
exports.resolveHomePathToAbsolute = resolveHomePathToAbsolute;
exports.getPort = getPort;
exports.createCancelablePromise = createCancelablePromise;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _portfinder = require('portfinder');

var _portfinder2 = _interopRequireDefault(_portfinder);

var _envPaths = require('env-paths');

var _envPaths2 = _interopRequireDefault(_envPaths);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

let configPath = '';

function getConfigPath() {
  if (configPath) {
    return configPath;
  }

  const configName = 'sqlectron.json';
  const oldConfigPath = _path2.default.join(homedir(), `.${configName}`);

  if (fileExistsSync(oldConfigPath)) {
    configPath = oldConfigPath;
  } else {
    const newConfigDir = (0, _envPaths2.default)('Sqlectron', { suffix: '' }).config;
    configPath = _path2.default.join(newConfigDir, configName);
  }

  return configPath;
}

function homedir() {
  return process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'];
}

function fileExists(filename) {
  return new Promise(resolve => {
    _fs2.default.stat(filename, (err, stats) => {
      if (err) return resolve(false);
      resolve(stats.isFile());
    });
  });
}

function fileExistsSync(filename) {
  try {
    return _fs2.default.statSync(filename).isFile();
  } catch (e) {
    return false;
  }
}

function writeFile(filename, data) {
  return new Promise((resolve, reject) => {
    _fs2.default.writeFile(filename, data, err => {
      if (err) return reject(err);
      resolve();
    });
  });
}

function writeJSONFile(filename, data) {
  return writeFile(filename, JSON.stringify(data, null, 2));
}

function writeJSONFileSync(filename, data) {
  return _fs2.default.writeFileSync(filename, JSON.stringify(data, null, 2));
}

function readFile(filename) {
  const filePath = resolveHomePathToAbsolute(filename);
  return new Promise((resolve, reject) => {
    _fs2.default.readFile(_path2.default.resolve(filePath), (err, data) => {
      if (err) return reject(err);
      resolve(data);
    });
  });
}

function readJSONFile(filename) {
  return readFile(filename).then(data => JSON.parse(data));
}

function readJSONFileSync(filename) {
  const filePath = resolveHomePathToAbsolute(filename);
  const data = _fs2.default.readFileSync(_path2.default.resolve(filePath), { enconding: 'utf-8' });
  return JSON.parse(data);
}

function createParentDirectory(filename) {
  return new Promise((resolve, reject) => (0, _mkdirp2.default)(_path2.default.dirname(filename), err => err ? reject(err) : resolve()));
}

function createParentDirectorySync(filename) {
  _mkdirp2.default.sync(_path2.default.dirname(filename));
}

function resolveHomePathToAbsolute(filename) {
  if (!/^~\//.test(filename)) {
    return filename;
  }

  return _path2.default.join(homedir(), filename.substring(2));
}

function getPort() {
  return new Promise((resolve, reject) => {
    _portfinder2.default.getPort({ host: 'localhost' }, (err, port) => {
      if (err) return reject(err);
      resolve(port);
    });
  });
}

function createCancelablePromise(error, timeIdle = 100) {
  let canceled = false;
  let discarded = false;

  const wait = time => new Promise(resolve => setTimeout(resolve, time));

  return {
    wait() {
      return _asyncToGenerator(function* () {
        while (!canceled && !discarded) {
          yield wait(timeIdle);
        }

        if (canceled) {
          const err = new Error(error.message || 'Promise canceled.');

          Object.getOwnPropertyNames(error).forEach(function (key) {
            return err[key] = error[key];
          }); // eslint-disable-line no-return-assign

          throw err;
        }
      })();
    },
    cancel() {
      canceled = true;
    },
    discard() {
      discarded = true;
    }
  };
}
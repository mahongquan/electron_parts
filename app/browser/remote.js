import { remote } from 'electron'; // eslint-disable-line import/no-unresolved
//import l from './logger';
//import c from './config';
var path = require('path')

/**
 * Exposes to the renderer process any used API running on main process
 */
export const sqlectron = remote.require('sqlectron-core');
//export const createLogger = remote.require(path.join(__dirname,'/browser/logger.js')).default;
//export const config = remote.require(path.join(__dirname,'/browser/config.js'));
// console.log(path);
var logfile=path.join(process.cwd(),'app/browser/logger.js');
var configfile=path.join(process.cwd(),'app/browser/config.js');
// var one=require(path.join(__dirname,'/browser/logger.js')).default;
// console.log(one);
// console.log(remote);
// console.log(remote.require);
// console.log(process.cwd());
export const createLogger = remote.require(logfile).default;
export const config = remote.require(configfile);
//export default {config:c,createLogger:l}

/*
* @Author: gbk
* @Date:   2016-05-12 19:17:55
* @Last Modified by:   gbk
* @Last Modified time: 2017-03-25 12:45:28
*/

'use strict';

var path = require('path');
var spawn = require('child_process').spawn;

var inquirer = require('inquirer');
var chalk = require('chalk');
var gitConfig = require('git-config');

var util = require('./util');

module.exports = function(url, force) {

  console.log('');
  console.log('Welcome to nowa project generator!');
  console.log('I will use this template to generate your project:');
  console.log(chalk.green(url));
  console.log('May I ask you some questions?');
  console.log('');

  var abc = util.loadAbc();

  // interaction
  var config = gitConfig.sync(path.join(abc.root, '.git', 'config')) || {};
  var promptTask = inquirer.prompt([{
    name: 'name',
    message: 'Project name',
    default: path.basename(process.cwd()),
    validate: function(name) {
      return /^\w[\w\-]*\w$/.test(name) ? true : 'name is not valid';
    }
  }, {
    name: 'description',
    message: 'Project description',
    default: 'An awesome project'
  }, {
    name: 'author',
    message: 'Author name',
    default: process.env['USER'] || process.env['USERNAME'] || ''
  }, {
    name: 'version',
    message: 'Project version',
    default: '1.0.0',
    validate: function(version) {
      return /^\d+\.\d+\.\d+([\.\-\w])*$/.test(version) ? true : 'version is not valid';
    }
  }, {
    name: 'homepage',
    message: 'Project homepage'
  }, {
    name: 'repository',
    message: 'Project repository',
    default: (config['remote "origin"'] || {}).url || ''
  }, {
    name: 'npm',
    type: 'list',
    message: 'Which npm do you perfer?',
    choices: [ 'npm', 'cnpm', 'tnpm' ],
    default: 'npm'
  }]);

  // start to generate files when templates and answers are ready
  Promise.all([
    new Promise(function(resolve) {
      util.fetchTpl(url, resolve, force);
    }),
    promptTask
  ]).then(function(results) {
    var answers = results[1];
    answers.template = url;

    // deal with custom prompt config
    var promptConfigPath = path.join(results[0], 'proj.js');
    var cmdCfg = loadConfig(promptConfigPath);
    var filter = cmdCfg.filter;
    var done = cmdCfg.done;
    util.customPrompts(promptConfigPath, answers, abc.options).then(function(answers) {

      // make files
      util.makeFiles(path.join(results[0], 'proj'), abc.root, answers, filter, function() {
        npmInstall(answers.npm, abc.root);
        done && done(abc.root);
      });
    });
  });
};

// call npm install
function npmInstall(npm, root) {
  spawn(process.platform === 'win32' ? npm + '.cmd' : npm, [
    'install',
    '-d'
  ], {
    cwd: root,
    stdio: 'inherit',
    stderr: 'inherit'
  }).on('exit', function(code) {
    if (code === 0 && util.loadAbc().options.libraries) {
      buildLibraries(root);
    }
  });
}

// build libraries
function buildLibraries(cwd) {
  spawn(process.platform === 'win32' ? 'nowa.cmd' : 'nowa', [
    'lib'
  ], {
    cwd: root,
    stdio: 'inherit',
    stderr: 'inherit'
  });
}

// load prompt config file
function loadConfig(promptConfigPath) {
  try {
    return require(promptConfigPath);
  } catch(e) {
    return {};
  }
}

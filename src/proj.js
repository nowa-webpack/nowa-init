/*
* @Author: gbk
* @Date:   2016-05-12 19:17:55
* @Last Modified by:   caoke
* @Last Modified time: 2016-05-18 13:39:07
*/

'use strict';

var path = require('path');
var spawn = require('child_process').spawn;

var inquirer = require('inquirer');
var chalk = require('chalk');
var gitConfig = require('git-config');

var util = require('./util');

module.exports = function(url) {

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
    name: 'library',
    type: 'confirm',
    message: 'Generate a customized UI library?'
  }, {
    name: 'npm',
    type: 'list',
    choices: [ 'npm', 'cnpm', 'tnpm' ],
    default: 'npm'
  }]);

  // start to generate files when templates and answers are ready
  Promise.all([
    new Promise(function(resolve) {
      util.fetchTpl(url, resolve);
    }),
    promptTask
  ]).then(function(results) {
    var answers = results[1];
    answers.template = url;
    util.makeFiles(path.join(results[0], 'proj'), abc.root, answers, function() {
      npmInstall(answers.npm, abc.root);
    });
  });
};

// call npm install
function npmInstall(npm, root) {
  spawn(npm, [
    'install',
    '-d'
  ], {
    cwd: root,
    stdio: 'inherit',
    stderr: 'inherit'
  }).on('exit', function(code) {
    if (code === 0) {
      buildLibraries(root);
    }
  });
}

// build libraries
function buildLibraries(cwd) {
  spawn('nowa', [
    'lib'
  ], {
    cwd: root,
    stdio: 'inherit',
    stderr: 'inherit'
  });
}

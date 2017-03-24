/*
* @Author: gbk
* @Date:   2016-05-12 19:18:00
* @Last Modified by:   gbk
* @Last Modified time: 2017-03-24 15:25:50
*/

'use strict';

var path = require('path');

var inquirer = require('inquirer');

var util = require('./util');

module.exports = function(type, url, force, cwd) {

  console.log('\nWelcome to nowa ' + type + ' generator!\n');

  var abc = util.loadAbc();

  // interaction
  var promptTask = inquirer.prompt([{
    name: 'name',
    message: type + ' name',
    validate: function(name) {
      return /^\w[\w\-\.]*\w$/.test(name) ? true : 'name is not valid';
    }
  }]);

  // start to generate files when templates and answers are ready
  Promise.all([
    new Promise(function(resolve) {
      util.fetchTpl(url, resolve, force);
    }),
    promptTask
  ]).then(function(results) {

    // deal with custom prompt config
    var promptConfigPath = path.join(results[0], type + '.js');
    var filter = loadConfig(promptConfigPath).filter;
    util.customPrompts(promptConfigPath, results[1], abc).then(function(answers) {

      // make files
      util.makeFiles(path.join(results[0], type), abc.root, answers, filter, null, cwd);
    });
  }).catch(function(err) {
    console.error(err);
  });
};

// load prompt config file
function loadConfig(promptConfigPath) {
  try {
    return require(promptConfigPath);
  } catch(e) {
    return {};
  }
}

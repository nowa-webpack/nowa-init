/*
* @Author: gbk
* @Date:   2016-05-12 19:18:00
* @Last Modified by:   caoke
* @Last Modified time: 2016-05-26 16:54:24
*/

'use strict';

var path = require('path');

var inquirer = require('inquirer');

var util = require('./util');

module.exports = function(type, force) {

  console.log('\nWelcome to nowa component generator!\n');

  var abc = util.loadAbc();

  // interaction
  var promptTask = inquirer.prompt([{
    name: 'name',
    message: 'Component name',
    validate: function(name) {
      return /^\w[\w\-]*\w$/.test(name) ? true : 'name is not valid';
    }
  }]);

  // start to generate files when templates and answers are ready
  Promise.all([
    new Promise(function(resolve) {
      util.fetchTpl(abc.options.template, resolve, force);
    }),
    promptTask
  ]).then(function(results) {

    // deal with custom prompt config
    var promptConfigPath = path.join(results[0], type + '.js');
    util.customPrompts(promptConfigPath, results[1], abc).then(function(answers) {

      // make files
      util.makeFiles(path.join(results[0], type), abc.root, answers);
    });
  });
};

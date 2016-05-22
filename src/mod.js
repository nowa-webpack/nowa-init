/*
* @Author: gbk
* @Date:   2016-05-12 19:18:00
* @Last Modified by:   gbk
* @Last Modified time: 2016-05-20 18:26:08
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
    var answers = results[1];
    answers.libraries = !!abc.options.libraries;
    answers.name = answers.name.toLowerCase();
    answers.Name = answers.name.replace(/[\W_]+(.)/g, function(p, p1) {
      return p1.toUpperCase();
    }).replace(/^./, function(p) {
      return p.toUpperCase();
    });
    answers.suffix = util.suffixByVars(abc.options.vars, abc.options.buildvars);
    util.makeFiles(path.join(results[0], type), abc.root, answers);
  });
};

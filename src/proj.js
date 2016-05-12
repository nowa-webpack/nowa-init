/*
* @Author: gbk
* @Date:   2016-05-12 19:17:55
* @Last Modified by:   gbk
* @Last Modified time: 2016-05-12 20:15:22
*/

'use strict';

var path = require('path');

var inquirer = require('inquirer');
var gitConfig = require('git-config');

module.exports = function(type) {

  console.log('\nWelcome to nowa project generator!\n');

  // interaction
  var config = gitConfig.sync('.git/config') || {};
  inquirer.prompt([{
    name: 'name',
    message: 'Project name',
    default: path.basename(process.cwd())
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
    default: '1.0.0'
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
  }]).then(function(answer) {

  });
};

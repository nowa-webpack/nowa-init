/*
* @Author: gbk <ck0123456@gmail.com>
* @Date:   2016-04-21 17:34:00
* @Last Modified by:   gbk
* @Last Modified time: 2016-05-12 19:33:50
*/

'use strict';

var inquirer = require('inquirer');

var proj = require('./proj');
var mod = require('./mod');
var pkg = require('../package.json');

// plugin defination
module.exports = {

  command: 'init [type]',

  description: pkg.description,

  action: dispatcher
};

// command dispatcher
function dispatcher(type) {
  switch (type) {
    case 'h5':
    case 'tingle':
      return proj('tingle');
    case 'web':
    case 'uxcore':
      return proj('uxcore');
    case 'page':
      return mod('page');
    case 'mod':
      return mod();
    default:
      inquirer.prompt([{
        type: 'list',
        name: 'type',
        message: 'Choose your project type',
        choices: [
          'uxcore',
          'tingle'
        ],
        default: 'uxcore'
      }]).then(function(answer) {
        dispatcher(answer.type);
      });
  }
}

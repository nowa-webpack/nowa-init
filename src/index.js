/*
* @Author: gbk <ck0123456@gmail.com>
* @Date:   2016-04-21 17:34:00
* @Last Modified by:   gbk
* @Last Modified time: 2016-05-17 22:39:17
*/

'use strict';

var proj = require('./proj');
var mod = require('./mod');
var pkg = require('../package.json');

// plugin defination
module.exports = {

  command: 'init [type]',

  description: pkg.description,

  options: [
    [ '-t, --template [uri]', 'template zip url' ]
  ],

  action: function(a0, a1) {

    // generate mod
    if (a0 === 'page' || a0 === 'mod') {
      return mod(a0);
    }

    // parse argvs
    a1 = a1 || {};
    var template = a1.template || a1.type || a0.template || a0.type || a0;
    if (typeof template !== 'string') {
      template = 'uxcore';
    }

    // generate project
    switch (template) {
      case 'h5':
      case 'tingle':
      case 'salt':
        return proj('https://github.com/nowa-webpack/template-salt/archive/master.zip');
      case 'web':
      case 'uxcore':
        return proj('https://github.com/nowa-webpack/template-uxcore/archive/master.zip');
      default:
        return proj(template);
    }
  }
};

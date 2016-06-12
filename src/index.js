/*
* @Author: gbk <ck0123456@gmail.com>
* @Date:   2016-04-21 17:34:00
* @Last Modified by:   gbk
* @Last Modified time: 2016-06-12 13:05:27
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
    [ '-t, --template <uri>', 'template zip url' ],
    [ '-f, --force', 'force to fetch new template' ]
  ],

  action: function(a0, a1) {

    // parse argvs
    a1 = a1 || {};
    var template = a1.template || a1.type || a0.template || a0.type || a0;
    var force = a1.force || a0.force;
    if (typeof template !== 'string') {
      template = 'uxcore';
    }

    // generate module
    if (typeof a0 === 'string' && !/^https?:\/\//.test(a0)) {
      return mod(template);
    }

    // generate project
    switch (template) {
      case 'h5':
      case 'salt':
        return proj('https://github.com/nowa-webpack/template-salt/archive/master.zip', force);
      case 'web':
      case 'uxcore':
        return proj('https://github.com/nowa-webpack/template-uxcore/archive/master.zip', force);
      default:
        return proj(template);
    }
  }
};

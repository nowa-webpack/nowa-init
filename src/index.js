/*
* @Author: gbk <ck0123456@gmail.com>
* @Date:   2016-04-21 17:34:00
* @Last Modified by:   gbk
* @Last Modified time: 2016-06-12 13:17:09
*/

'use strict';

var proj = require('./proj');
var mod = require('./mod');
var pkg = require('../package.json');

var ALIAS = {
  h5: 'https://github.com/nowa-webpack/template-salt/archive/master.zip',
  salt: 'https://github.com/nowa-webpack/template-salt/archive/master.zip',
  web: 'https://github.com/nowa-webpack/template-uxcore/archive/master.zip',
  uxcore: 'https://github.com/nowa-webpack/template-uxcore/archive/master.zip'
};

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
    template = ALIAS[template] || template;

    if (typeof a0 === 'string' && !ALIAS[a0] && !/^https?:\/\//.test(a0)) {
      // generate module
      mod(a0, force);
    } else {
      // generate project
      proj(template, force);
    }
  }
};

/*
* @Author: gbk <ck0123456@gmail.com>
* @Date:   2016-04-21 17:34:00
* @Last Modified by:   gbk
* @Last Modified time: 2016-07-05 17:13:07
*/

'use strict';

var proj = require('./proj');
var mod = require('./mod');
var util = require('./util');
var pkg = require('../package.json');

// support command format
// nowa init https://github.com/nowa-webpack/template-uxcore/archive/master.zip
// nowa init https://github.com/nowa-webpack/template-uxcore/archive/master.zip -a uxcore
// nowa init proj -t https://github.com/nowa-webpack/template-uxcore/archive/master.zip -a uxcore
// nowa init uxcore
// nowa init mod

// plugin defination
module.exports = {

  command: 'init <type>',

  description: pkg.description,

  options: [
    [ '-t, --template <uri>', 'template zip url' ],
    [ '    --type <type>', 'shortcut of template option' ],
    [ '-f, --force', 'force to fetch new template' ],
    [ '-a, --as <alias>', 'alias to template url' ]
  ],

  action: function(type, command) {

    // parse argvs
    var template = util.getAlias(command.template || command.type || type);
    var force = command.force;
    var alias = command.as;

    // template should always be a url
    if (!/^https?:\/\//.test(template)) {
      console.error('Can not load template: ' + template);
      return;
    }

    // generate a project if type is proj or alias to a url
    if (type === 'proj' || /^https?:\/\//.test(util.getAlias(type))) {
      proj(template, force);
    } else {
      mod(type, template, force);
    }

    // save alias
    if (alias && template && alias !== template) {
      util.setAlias(alias, template);
    }
  }
};

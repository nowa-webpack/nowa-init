/*
* @Author: gbk <ck0123456@gmail.com>
* @Date:   2016-04-21 17:34:00
* @Last Modified by:   gbk
* @Last Modified time: 2017-04-25 19:57:33
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
    [ '-a, --as <alias>', 'alias to template url' ],
    [ '-c, --cwd', 'generate module at cwd' ]
  ],

  action: function(type, command) {

    // parse argvs
    var template = util.getAlias(command.template || command.type || type);
    var force = command.force;
    var alias = command.as;
    var cwd = command.cwd;

    // template should be an url or a local dir
    if (!/^https?:\/\//.test(template) && !util.existsDirectory(template)) {
      console.error('Can not load template: ' + template);
      return;
    }

    // generate a project if type is proj or alias to an url or is a local dir
    if (type === 'proj' || /^https?:\/\//.test(util.getAlias(type)) || util.existsDirectory(type)) {
      proj(template, force);
    } else {
      mod(type, template, force, cwd);
    }

    // save alias
    if (alias && template && alias !== template) {
      util.setAlias(alias, template);
    }
  }
};

/*
* @Author: gbk
* @Date:   2016-05-12 19:35:00
* @Last Modified by:   gbk
* @Last Modified time: 2016-05-12 23:36:50
*/

'use strict';

var fs = require('fs');
var path = require('path');

var ejs = require('ejs');
var glob = require('glob');
var mkdirp = require('mkdirp');
var inquirer = require('inquirer');

var util = {

  // generate files
  makeFiles: function(sourceDir, targetDir, data) {
    console.log('\nStart to copy files ...\n');
    var prompts = [];

    // traverse all template files
    glob.sync('**', {
      cwd: sourceDir,
      nodir: true
    }).forEach(function(source) {

      // real target file
      var target = path.join(targetDir, source.replace(/^_/, '.'));

      // ensure target dir exists
      mkdirp.sync(path.dirname(target));

      // real source file
      source = path.join(sourceDir, source);

      try {

        // file exists, push to confirm list
        fs.statSync(target);
        prompts.push({
          type: 'confirm',
          name: source + ',' + target,
          message: 'Override ' + target + ' ?'
        });

      } catch (e) {

        // file not exist, just write
        writeFile(source, target, data);
      }
    });

    if (prompts.length) {

      // blank line
      console.log('');

      // confirm override files
      inquirer.prompt(prompts).then(function(answers) {

        // blank line
        console.log('');

        // write confirmed files
        for (var k in answers) {
          if (answers[k]) {
            var p = k.split(',');
            writeFile(p[0], p[1], data);
          }
        }
      });
    }
  }
};

module.exports = util;

// write file by tpl
function writeFile(source, target, data) {
  console.log('Generate file ' + path.relative(process.cwd(), target));
  var tpl = fs.readFileSync(source, 'utf-8');
  fs.writeFileSync(target, ejs.render(tpl, data));
}

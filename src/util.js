/*
* @Author: gbk
* @Date:   2016-05-12 19:35:00
* @Last Modified by:   gbk
* @Last Modified time: 2016-05-29 22:05:35
*/

'use strict';

var fs = require('fs');
var os = require('os');
var path = require('path');

var ejs = require('ejs');
var glob = require('glob');
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');
var onetime = require('onetime');
var inquirer = require('inquirer');
var Download = require('download');

var util = {

  // try to find and load abc.json
  loadAbc: function() {
    var cwd = process.cwd();
    var dir = cwd;
    var lastDir, abc;
    while (lastDir !== dir) {
      try {
        var abcFile = path.join(dir, 'abc.json');
        abc = JSON.parse(fs.readFileSync(abcFile, 'utf-8'));
        break;
      } catch (e) {
        lastDir = dir;
        dir = path.dirname(dir);
      }
    }
    return {
      root: abc ? dir : cwd, // use abc dir as project root
      options: abc && abc.options ? abc.options : {} // load abc options
    };
  },

  // create a unique dirname in dir
  uniqueDirname: function(dir) {
    var rnd = parseInt(Math.random() * 10000).toString();
    try {
      var files = fs.readdirSync(dir);
      while (files.indexOf(rnd) !== -1) {
        rnd = parseInt(Math.random() * 10000).toString();
      }
    } catch (e) {
    }
    return rnd;
  },

  // fetch remote template
  fetchTpl: function(url, callback, force) {
    callback = onetime(callback);
    var now = Date.now();
    var basedir = path.join(os.homedir(), '.nowa', 'init', 'templates');

    // load manifest file
    var manifestFile = path.join(basedir, 'manifest.json');
    var manifest;
    try {
      manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf-8'));
    } catch (e) {
      manifest = {};
    }

    // use cached template
    if (!force) {

      // template dir exists and was created within 24 hours
      if (manifest[url] && now - manifest[url].create < 3600000 * 24) {

        // use the old template and break
        return callback(manifest[url].dir);

      // template dir exists but expired
      } else if (manifest[url]) {

        // use the old templates and fetch the new ones
        callback(manifest[url].dir);
      }
    }

    // download template zipfile
    new Download({
      mode: '644',
      extract: true
    }).get(url).dest(basedir).run(function(err, files) {
      if (err) {
        console.error('\nCan not load url: ' + url);
        return;
      }

      // delete the old dir if exists
      if (manifest[url]) {
        rimraf(manifest[url].dir, {
          disableGlob: true
        }, function() {
        });
      }

      // create unique dirname
      var uniqueDir = util.uniqueDirname(basedir);
      var tpldir = path.join(basedir, uniqueDir);
      fs.renameSync(files[0].path, tpldir);

      // update manifest file
      manifest[url] = {
        create: now,
        dir: tpldir
      };
      fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, '  '));

      // callback
      callback(tpldir);
    });
  },

  // generate files
  makeFiles: function(sourceDir, targetDir, data, callback) {
    console.log('\nStart to copy files ...\n');
    var prompts = [];

    // traverse all template files
    glob.sync('**', {
      cwd: sourceDir,
      nodir: true,
      dot: true
    }).forEach(function(source) {

      // real target file
      var target = path.join(targetDir, source.replace(/__(\w+)__/g, function(p, p1) {
        return data[p1];
      }));

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
        callback && callback();
      });
    } else {
      callback && callback();
    }
  },

  // deal with custom prompts
  customPrompts: function(configPath, prevAnswers, abc) {
    return new Promise(function(resolve) {
      try {
        var config = require(configPath);
        if (config.prompts && config.prompts.length) {
          inquirer.prompt(config.prompts).then(function(answers) {
            answers = Object.assign({}, answers, prevAnswers);
            if (config.answers) {
              resolve(config.answers(answers, abc));
            } else {
              resolve(answers);
            }
          });
        } else {
          if (config.answers) {
            resolve(config.answers(prevAnswers, abc));
          } else {
            resolve(prevAnswers);
          }
        }
      } catch (e) {
        resolve(prevAnswers);
      }
    });
  }
};

module.exports = util;

// write file by tpl
function writeFile(source, target, data) {
  try {
    console.log('Generate file ' + path.relative(process.cwd(), target));
    var tpl = fs.readFileSync(source, 'utf-8');
    fs.writeFileSync(target, ejs.render(tpl, data));
  } catch (e) {
    console.error(e);
  }
}

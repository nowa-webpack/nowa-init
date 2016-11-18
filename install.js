/*
* @Author: gbk
* @Date:   2016-11-18 17:27:59
* @Last Modified by:   gbk
* @Last Modified time: 2016-11-18 18:16:29
*/

'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');

const url = 'https://raw.githubusercontent.com/nowa-webpack/template-alias/master/alias.json';

const retry = (count) => {
  if (count > 3) {
    return;
  }
  https.get(url, (res) => {
    const buffer = [];
    res.on('data', (d) => {
      buffer.push(d);
    });
    res.on('end', () => {
      const str = Buffer.concat(buffer).toString();
      fs.writeFile(path.join(__dirname, 'src/alias.json'), str, (err) => {
        console.log(err || 'Done.');
      });
    });
  }).on('error', () => {
    console.log(`Try ${count + 1}th times.`);
    retry(count + 1);
  });
};

console.log(`Download 'alias.json' from '${url}'.`);
retry(1);

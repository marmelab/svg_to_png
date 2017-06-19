const fs = require('fs');
const tmp = require('tmp');

const tmpFile = tmp.tmpNameSync();
const tmpStream = fs.createWriteStream(tmpFile);

process.stdin.pipe(tmpStream);

process.stdin.on('end', () => {
    console.log(tmpFile);
});

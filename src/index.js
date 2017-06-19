const fs = require('fs');

let data = '';

process.stdin.on('readable', () => {
    const chunk = process.stdin.read();
    if (chunk !== null) {
        data += chunk;
    }
});

process.stdin.on('end', () => {
    console.log({ data });
});

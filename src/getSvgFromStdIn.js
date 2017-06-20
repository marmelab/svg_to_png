export default () =>
    new Promise((resolve, reject) => {
        let data = '';

        process.stdin.on('readable', () => {
            const chunk = process.stdin.read();
            if (chunk !== null) {
                data += chunk;
            }
        });

        process.stdin.on('end', () => {
            resolve(data);
        });

        process.stdin.on('error', error => {
            reject(error);
        });
    });

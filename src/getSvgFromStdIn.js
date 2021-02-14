export default (stdin = process.stdin, timeout = 2000) =>
    new Promise((resolve, reject) => {
        let data = '';

        stdin.on('readable', () => {
            const chunk = stdin.read();
            if (chunk !== null) {
                data += chunk;
            }
        });

        stdin.on('end', () => {
            resolve(data);
        });

        stdin.on('error', error => {
            reject(error);
        });

        setTimeout(
            () => reject(new Error('No entry detected aborting')),
            timeout,
        );
    });

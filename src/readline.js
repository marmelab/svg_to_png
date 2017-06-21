import readline from 'readline';

export default () => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const question = text =>
        new Promise((resolve, reject) => {
            try {
                rl.question(text, resolve);
            } catch (error) {
                reject(error);
            }
        });

    return {
        question,
        close: () => rl.close(),
    };
};

import commander from 'commander';
import chalk from 'chalk';
import clip from 'cliparoo';
import { readFileSync } from 'fs';

import startServer from './server';
import getSvgFromStdIn from './getSvgFromStdIn';
import convertToPngDataUrl from './convertToPngDataUrl';

const print = console.log; // eslint-disable-line
const formatSource = chalk.bold.green;
const formatMessage = chalk.bold.gray;

const executeShellCommand = async options => {
    const sources = [];

    if (options.http) {
        print(
            formatMessage(`Starting server on`),
            `http://localhost:${options.port}`,
        );
        await startServer(parseInt(options.port));
    }

    if (options.files && options.files.length > 0) {
        sources.push(
            ...options.files.map(file => ({
                source: file,
                svg: readFileSync(file, 'utf8'),
            })),
        );
    } else {
        const svg = await getSvgFromStdIn();
        sources.push({ svg, source: 'stdin' });
    }
    const promises = sources.map(({ source, svg }) =>
        convertToPngDataUrl(svg).then(pngDataUrl => ({
            source,
            pngDataUrl,
        })),
    );

    const results = await Promise.all(promises);
    results.forEach(result => {
        if (results.length === 1) {
            print('\n');
            print(result.pngDataUrl);
            clip(result.pngDataUrl);
            print('\n');
            print(
                formatMessage(
                    `The data url for ${result.source} has been copied in your clipboard`,
                ),
            );
            return;
        }

        print('\n');
        print(formatSource(result.source));
        print('\n');
        print(result.pngDataUrl);
    });
};

commander
    .version('0.0.1')
    .usage('[options] <file ...>')
    .option('--http', 'Starts the HTTP server')
    .option(
        '--port <n>',
        'The port of the http server. Default is 3000',
        parseInt,
    );

const options = commander.parse(process.argv);

executeShellCommand({
    files: options.args,
    http: options.http,
    port: options.port,
}).then(() => process.exit());

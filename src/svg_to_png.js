import commander from 'commander';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import { platform } from 'os';

import convertToPngDataUrl from './convertToPngDataUrl';
import getSvgFromStdIn from './getSvgFromStdIn';
import readline from './readline';
import startServer from './server';
import writeToClipboard from './writeToClipboard';

const print = console.log; // eslint-disable-line
const formatSource = chalk.bold.green;
const formatMessage = chalk.bold.gray;

commander
    .version('0.0.1')
    .description('An svg to png converter using chrome in headless mode.')
    .usage(
        `
    # passing file paths as arguments
    svg_to_png [options] <file ...>

    # piping a file
    svg_to_png [options] < file

    # starting an http server listening to POST requests with the svg as their body
    svg_to_png --http
    `,
    )
    .option('--http', 'Starts the HTTP server')
    .option(
        '--port <n>',
        'The port of the http server. Default is 3000',
        parseInt,
        3000,
    );

const executeShellCommand = async options => {
    const sources = [];

    if (options.http) {
        await startServer(options.port);
    }

    if (options.files && options.files.length > 0) {
        sources.push(
            ...options.files.map(file => ({
                source: file,
                svg: readFileSync(file, 'utf8'),
            })),
        );
    } else {
        const svg = await getSvgFromStdIn().catch(async error => {
            print(error.message);
            const rl = readline();
            const answer = await rl.question(
                'Did you mean to run in server mode ? (y/n default n)',
            );
            if (answer.toLowerCase() === 'y') {
                await startServer();
                process.exit(0);
            }
            commander.help();
        });
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

            try {
                writeToClipboard(result.pngDataUrl);
                print('\n');
                print(
                    formatMessage(
                        `The data url for ${result.source} has been copied in your clipboard`,
                    ),
                );
            } catch (error) {
                if (platform() === 'linux') {
                    print(
                        formatMessage(
                            'Install xclip if you want the url to be copied in your clipboard automatically.',
                        ),
                    );
                }
            }

            return;
        }

        print('\n');
        print(formatSource(result.source));
        print('\n');
        print(result.pngDataUrl);
    });
};

const options = commander.parse(process.argv);

executeShellCommand({
    files: options.args,
    http: options.http,
    port: isNaN(options.port) ? undefined : options.port,
}).then(() => process.exit());

import commander from 'commander';
<<<<<<< 7ffa9ad7e0af4e2946af77df66d076b194a7c30e
=======
import chalk from 'chalk';
import clip from './clip';
>>>>>>> add getDimensions helper
import { readFileSync } from 'fs';
import readline from './readline';
import startServer from './server';
import getSvgFromStdIn from './getSvgFromStdIn';
import convertToPng from './convertToPng';
import toPngDataUrl from './toPngDataUrl';
import outputResultsAsDataUrls from './outputResultsAsDataUrls';
import outputResultsAsFiles from './outputResultsAsFiles';

const print = console.log; // eslint-disable-line

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
    .option(
        '--out [value]',
        'Where to output the file: either a file paht for single source or a directory path for multiple sources',
    )
    .option('--http', 'Starts the HTTP server')
    .option(
        '--port <n>',
        'The port of the http server. Default is 3000',
        parseInt,
        3000,
    );

const handleResults = async (results, options) => {
    if (options.out) {
        return outputResultsAsFiles(results, options);
    }

    return outputResultsAsDataUrls(results);
};

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
        convertToPng(svg).then(data => ({
            source,
            data: options.out ? data : toPngDataUrl(data),
        })),
    );

    const results = await Promise.all(promises);

    await handleResults(results, options);
};

const options = commander.parse(process.argv);
executeShellCommand({
    out: options.out,
    files: options.args,
    http: options.http,
    port: isNaN(options.port) ? undefined : options.port,
})
    .then(() => process.exit())
    .catch(error => console.error(error));

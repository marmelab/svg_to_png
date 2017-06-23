import chalk from 'chalk';
import { basename, extname, resolve } from 'path';
import { existsSync, mkdirSync, statSync, writeFileSync } from 'fs';
import question from './question';

const print = console.log; // eslint-disable-line
const formatMessage = chalk.bold.gray;
const formatError = chalk.bold.red;

const writeFile = async (path, data) => {
    if (extname(path) !== '.png') {
        path += '.png';
    }

    const exists = existsSync(path);
    if (exists) {
        const answer = question(
            `A file named ${path} already exists. Shall we override it? (y/n default n)`,
        );

        if (!answer) {
            print(formatMessage('Exiting without overriding existing file'));
            process.exit(0);
        }
    }

    writeFileSync(path, data, {
        encoding: 'base64',
        flag: 'w',
    });
};

const createOutputDirectoryIfNeeded = path => {
    const exists = existsSync(path);

    if (exists) {
        return;
    }

    mkdirSync(path);
};

export default async (results, { out }) => {
    if (results.length > 1) {
        if (statSync(out).isFile) {
            print(
                formatError(
                    'Please specify a directory path for the out option when specifying multiple sources',
                ),
            );
        }

        createOutputDirectoryIfNeeded(out);

        await Promise.all(
            results.map(result =>
                writeFile(
                    resolve(out, `${basename(result.source, '.svg')}.png`),
                    result.data,
                ),
            ),
        );

        return;
    }

    let outFileName = out;
    let exists = existsSync(out);
    const extension = extname(out);
    let isDirectory = (exists && statSync(out).isDirectory()) || !extension;

    if (isDirectory) {
        createOutputDirectoryIfNeeded(out);

        outFileName = resolve(
            out,
            results[0].source === 'stdin'
                ? 'output.png'
                : basename(results[0].source, '.svg'),
        );
    } else {
        const indexOfSvgExt = outFileName.indexOf('.svg');
        outFileName = outFileName.substring(
            0,
            indexOfSvgExt > 0 ? indexOfSvgExt : undefined,
        );
    }

    writeFile(outFileName, results[0].data);

    return;
};

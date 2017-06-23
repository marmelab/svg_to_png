import chalk from 'chalk';
import { basename, extname, resolve } from 'path';
import { existsSync, mkdirSync, statSync, writeFileSync } from 'fs';
import question from './question';

const print = console.log; // eslint-disable-line
const formatError = chalk.bold.red;

const canWriteFile = (path, askForOverrides, force) => {
    if (!force && askForOverrides) {
        const answer = question(
            `A file named ${path} already exists. Shall we override it? (y/n default n)`,
        );

        return answer;
    }

    return force;
};

const writeFile = async (path, data, askForOverrides, force) => {
    if (extname(path) !== '.png') {
        path += '.png';
    }

    const exists = existsSync(path);
    if (exists) {
        if (!canWriteFile(path, askForOverrides, force)) {
            if (askForOverrides) {
                print('Exiting without overriding existing file');
            } else {
                print(
                    formatError(
                        `A file named ${path} already exists. Use the --force option if you want to override it`,
                    ),
                );
            }
            process.exit(0);
            return;
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

export default async (results, { out, force }) => {
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
                    true,
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

    writeFile(
        outFileName,
        results[0].data,
        results[0].source !== 'stdin',
        force,
    );

    return;
};

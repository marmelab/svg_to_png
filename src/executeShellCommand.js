import { readFileSync } from 'fs';

import startServer from './server';
import getSvgFromStdIn from './getSvgFromStdIn';
import question from './question';
import convertToPng from './convertToPng';
import toPngDataUrl from './toPngDataUrl';
import outputResultsAsDataUrls from './outputResultsAsDataUrls';
import outputResultsAsFiles from './outputResultsAsFiles';

const print = console.log; // eslint-disable-line

const handleResults = async (results, options) => {
    if (options.out) {
        return outputResultsAsFiles(results, options);
    }

    return outputResultsAsDataUrls(results);
};

export const executeShellCommandFactory = (
    startServerImpl = startServer,
    readFileSyncImpl = readFileSync,
    getSvgFromStdInImpl = getSvgFromStdIn,
    convertToPngImpl = convertToPng,
    handleResultsImpl = handleResults,
    questionImpl = question,
) => async (options, showHelp) => {
    const sources = [];

    if (options.http) {
        return await startServerImpl(options.port);
    }

    if (options.files && options.files.length > 0) {
        sources.push(
            ...options.files.map(file => ({
                source: file,
                svg: readFileSyncImpl(file, 'utf8'),
            })),
        );
    } else {
        const svg = await getSvgFromStdInImpl().catch(async error => {
            print(error.message);
            const answer = questionImpl(
                'Did you mean to run in server mode ? (y/n default n)',
            );

            if (answer) {
                return await startServerImpl();
            }
            return showHelp();
        });

        if (svg) {
            sources.push({ svg, source: 'stdin' });
        }
    }

    const promises = sources.map(({ source, svg }) =>
        convertToPngImpl(svg, options).then(data => ({
            source,
            data: options.out ? data : toPngDataUrl(data),
        })),
    );

    const results = await Promise.all(promises);

    await handleResultsImpl(results, options);
};

export default executeShellCommandFactory();

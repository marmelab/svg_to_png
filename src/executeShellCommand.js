import { readFileSync as defaultReadFileSync } from 'fs';

import defaultStartServer from './server';
import defaultGetSvgFromStdIn from './getSvgFromStdIn';
import defaultQuestion from './question';
import defaultConvertToPng from './convertToPng';
import toPngDataUrl from './toPngDataUrl';
import outputResultsAsDataUrls from './outputResultsAsDataUrls';
import outputResultsAsFiles from './outputResultsAsFiles';

const print = console.log; // eslint-disable-line

const defaultHandleResults = async (results, options) => {
    if (options.out) {
        return outputResultsAsFiles(results, options);
    }

    return outputResultsAsDataUrls(results);
};

export const executeShellCommandFactory = ({
    startServer = defaultStartServer,
    readFileSync = defaultReadFileSync,
    getSvgFromStdIn = defaultGetSvgFromStdIn,
    convertToPng = defaultConvertToPng,
    handleResults = defaultHandleResults,
    question = defaultQuestion,
}) => async (options, showHelp) => {
    const sources = [];

    if (options.http) {
        return await startServer(options.port);
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
            const answer = question(
                'Did you mean to run in server mode ? (y/n default n)',
            );

            if (answer) {
                return await startServer();
            }
            return showHelp();
        });

        if (svg) {
            sources.push({ svg, source: 'stdin' });
        }
    }

    const promises = sources.map(({ source, svg }) =>
        convertToPng(svg, options).then(data => ({
            source,
            data: options.out ? data : toPngDataUrl(data),
        })),
    );

    const results = await Promise.all(promises);

    await handleResults(results, options);
};

export default executeShellCommandFactory({});

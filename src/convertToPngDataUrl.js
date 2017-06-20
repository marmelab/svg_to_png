import { writeFileSync } from 'fs';
import chromeRemoteInterface from 'chrome-remote-interface';
import { launch } from 'chrome-launcher';
import { tmpNameSync } from 'tmp';
import debugFactory from 'debug';
import getConvertToPngScript from './getConvertToPngScript';

const debug = debugFactory('svg_to_png');

const loadUrl = async ({ client, url, width, height }) => {
    const { Emulation, Page } = client;

    // Enable events on domains we are interested in.
    await Page.enable();
    // Set up viewport resolution, etc.
    const deviceMetrics = {
        width: width,
        height: height,
        deviceScaleFactor: 0,
        mobile: false,
        fitWindow: false,
    };
    await Emulation.setDeviceMetricsOverride(deviceMetrics);
    await Emulation.setVisibleSize({ width: width, height: height });

    // Navigate to target page
    debug(`Openning ${url}`);
    await Page.navigate({ url });
};

const getPngFromChrome = ({ client, url, width, height }) => new Promise((resolve, reject) => {
    debug('Connected to google chrome in headless mode');
    
    loadUrl({ client, url, width, height }).then(() => {
        const { Page, Runtime } = client;

        // Wait for page load event to execture our script
        Page.loadEventFired(async () => {
            debug(`Loaded ${url}`);

            const runtimeResult = await Runtime.evaluate({
                expression: getConvertToPngScript(width, height),
                awaitPromise: true,
            });

            if (runtimeResult.result) {
                resolve(runtimeResult.result.value);
            } else {
                reject(runtimeResult.exceptionDetails);
            }
        });
    });
});

export default async svg => {
    debug('Processed source file', svg);

    const widthMatches = /svg[\s\S]*width="([\d.]*)px"/.exec(svg);
    const width = widthMatches ? parseInt(widthMatches[1]) : false;

    const heightMatches = /svg[\s\S]*height="([\d.]*)px"/.exec(svg);
    const height = heightMatches ? parseInt(heightMatches[1]) : false;

    debug('parsed dimensions: %d %d', width, height);

    const tmpHtmlFile = tmpNameSync();
    writeFileSync(tmpHtmlFile, `
    <html>
        <body>
            ${svg}
        </body>
    </html>
    `);
    const url = `file:///${tmpHtmlFile}`;

    const chrome = await launch({
        port: 9222,
        chromeFlags: ['--headless', '--disable-gpu'],
    });
    
    debug('Started google chrome in headless mode');

    return new Promise((resolve, reject) => {
        chromeRemoteInterface(client => {
            getPngFromChrome({ client, url, width, height })
                .then(pngDataUrl => {
                    resolve(pngDataUrl);
                    client.close();
                    chrome.kill();
                }, error => {
                    reject(error);
                    client.close();
                    chrome.kill();
                });
        })
        .on('error', err => {
            reject(err);
            client.close();
            chrome.kill();
        });
    });
}

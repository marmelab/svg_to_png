import { createWriteStream, writeFile, writeFileSync } from 'fs';
import { tmpNameSync } from 'tmp';
import minimist from 'minimist';
import chromeRemoteInterface from 'chrome-remote-interface';
import { launch } from 'chrome-launcher';
import debugFactory from 'debug';

const debug = debugFactory('svg_to_png');

const getConvertToPngScript = (width, height) => `
new Promise((resolve) => {
    try {
        const svg = document.querySelector('svg');
        const svgString = new XMLSerializer().serializeToString(svg);

        const canvas = document.createElement("canvas");
        canvas.setAttribute('width', '${width}px');
        canvas.setAttribute('height', '${height}px');
        const ctx = canvas.getContext("2d");
        const DOMURL = self.URL || self.webkitURL || self;
        const img = new Image();
        const svgBlob = new Blob([svgString], {type: "image/svg+xml;charset=utf-8"});
        const url = DOMURL.createObjectURL(svgBlob);
        img.onload = function() {
            ctx.drawImage(img, 0, 0);
            const png = canvas.toDataURL("image/png");
            DOMURL.revokeObjectURL(png);
            resolve(png);
        };
        img.src = url;
    } catch (error) {
        resolve(error);
    }
})
`
const argv = minimist(process.argv.slice(2));
const viewportWidth = argv.viewportWidth || 1440;
const viewportHeight = argv.viewportHeight || 900;
const fullPage = true;

const tmpHtmlFile = tmpNameSync();

const getSvgFromStdIn = () => new Promise((resolve, reject) => {
    let data;

    process.stdin.on('readable', () => {
        const chunk = process.stdin.read();
        if (chunk !== null) {
            data += chunk;
        }
    });

    process.stdin.on('end', () => {
        resolve(data);
    });

    process.stdin.on('error', error => {
        reject(error);
    });
})
try {
    getSvgFromStdIn().then(svg => {
        debug('Processed source file', svg);

        const widthMatches = /svg[\s\S]*width="([\d.]*)px"/.exec(svg);
        const width = widthMatches ? parseInt(widthMatches[1]) : viewportWidth;

        const heightMatches = /svg[\s\S]*height="([\d.]*)px"/.exec(svg);
        const height = heightMatches ? parseInt(heightMatches[1]) : viewportHeight;

        debug('parsed dimensions: %d %d', width, height);

        writeFileSync(tmpHtmlFile, `
        <html>
            <body>
                ${svg}
            </body>
        </html>
        `);

        launch({
            port: 9222,
            chromeFlags: ['--headless', '--disable-gpu'],
        }).then(chrome => {
            debug('Started google chrome in headless mode');

            chromeRemoteInterface(async client => {
                debug('Connected to google chrome in headless mode');
                
                // Extract used DevTools domains.
                const { DOM, Emulation, Log, Network, Page, Runtime } = client;

                // Enable events on domains we are interested in.
                await Page.enable();
                await DOM.enable();
                await Network.enable();
                await Log.enable();

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
                const url = `file:///${tmpHtmlFile}`;
                debug(`Openning ${url}`);
                // Page.addScriptToEvaluateOnLoad(convertToPngScript)
                await Page.navigate({ url });

                // Wait for page load event to take screenshot
                Page.loadEventFired(async () => {
                    debug(`Loaded ${url}`);

                    const runtimeResult = await Runtime.evaluate({ expression: getConvertToPngScript(width, height), awaitPromise: true });
                    if (runtimeResult.result) {
                        console.log('PNG:\r\n')
                        console.log(runtimeResult.result.value);
                    }
                    client.close();
                    chrome.kill();
                });
            }).on('error', err => {
                console.error('Cannot connect to browser:', err);
                client.close();
                chrome.kill();
            });
        });
    });
} catch (error) {
    console.error(error);
}

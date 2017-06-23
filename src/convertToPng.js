import defaultChromeRemoteInterface from 'chrome-remote-interface';
import { launch as defaultLaunch } from 'chrome-launcher';
import debugFactory from 'debug';
import defaultConvertHtmlToDataUrl from './convertHtmlToDataUrl';
import getDimensions from './getDimensions';

const debug = debugFactory('svg_to_png');

const loadUrl = async ({ client, url, width, height }) => {
    const { Emulation, Page } = client;

    // Enable events on domains we are interested in.
    await Page.enable();
    // Set up viewport resolution, etc.
    const deviceMetrics = {
        width,
        height,
        deviceScaleFactor: 0,
        mobile: false,
        fitWindow: false,
    };
    await Emulation.setDeviceMetricsOverride(deviceMetrics);
    await Emulation.setVisibleSize({ width, height });

    // Navigate to target page
    debug(`Opening ${url}`);
    await Page.navigate({ url });
};

const getPngFromChrome = async ({ client, url, width, height }) => {
    debug('Connected to google chrome in headless mode');

    await loadUrl({ client, url, width, height });
    const { Page } = client;

    // Wait for page load event to execture our script
    await Page.loadEventFired();
    debug(`Loaded ${url}`);

    const screenshot = await Page.captureScreenshot({
        fromSurface: false,
    });

    return screenshot.data;
};

export const convertToPngFactory = ({
    chromeRemoteInterface = defaultChromeRemoteInterface,
    launch = defaultLaunch,
    convertHtmlToDataUrl = defaultConvertHtmlToDataUrl,
}) => async (svg, options) => {
    debug('Processed source file', svg);

    const { width, height } = getDimensions(svg, options);

    debug('parsed dimensions: %d %d', width, height);

    const html = `<html>
            <head>
                <style>
                    body { margin: 0; padding: 0; }
                    svg { width: ${width}px; height: ${height}px; }
                </style>
            </head>
            <body>
                ${svg}
            </body>
        </html>`;
    debug('HTML data', html);

    const url = convertHtmlToDataUrl(html);
    debug('HTML dataurl', url);

    const chrome = await launch({
        port: 9222,
        chromeFlags: [
            '--headless',
            '--disable-gpu',
            '--no-sandbox',
            '--no-scrollbars',
        ],
    });

    debug('Started google chrome in headless mode');

    let client;

    try {
        client = await chromeRemoteInterface();

        const pngData = await getPngFromChrome({
            client,
            url,
            width,
            height,
        });
        return pngData;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        if (client) {
            client.close();
        }
        chrome.kill();
    }
};

export default convertToPngFactory({});

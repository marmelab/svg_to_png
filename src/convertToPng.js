import chromeRemoteInterface from 'chrome-remote-interface';
import { launch } from 'chrome-launcher';
import debugFactory from 'debug';
import convertHtmlToDataUrl from './convertHtmlToDataUrl';

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

export default async svg => {
    debug('Processed source file', svg);

    const widthMatches = /svg[\s\S].*?width="([\d.\S]*)"/.exec(svg);
    const width = widthMatches ? Math.ceil(parseFloat(widthMatches[1])) : false;

    const heightMatches = /svg[\s\S].*?height="([\d.\S]*)"/.exec(svg);
    const height = heightMatches
        ? Math.ceil(parseFloat(heightMatches[1]))
        : false;

    debug('parsed dimensions: %d %d', width, height);

    const html = `<html>
            <style>
                body { margin: 0; padding: 0; }
            </style>
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

        const pngDataUrl = await getPngFromChrome({
            client,
            url,
            width,
            height,
        });
        return pngDataUrl;
    } catch (error) {
        console.error(error);
    } finally {
        client.close();
        chrome.kill();
    }
};

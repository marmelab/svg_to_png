import { createWriteStream, writeFile } from 'fs';
import { tmpNameSync } from 'tmp';
import minimist from 'minimist';
import chromeRemoteInterface from 'chrome-remote-interface';
import { launch } from 'chrome-launcher';

const argv = minimist(process.argv.slice(2));
const viewportWidth = argv.viewportWidth || 1440;
const viewportHeight = argv.viewportHeight || 900;
const fullPage = true;

const tmpFile = tmpNameSync();
const tmpStream = createWriteStream(tmpFile);

process.stdin.pipe(tmpStream);

process.stdin.on('end', () => {
    console.log('Processed source file');

    launch({
        port: 9222,
        chromeFlags: ['--headless', '--disable-gpu'],
    }).then(chrome => {
        console.log('Started google chrome in headless mode');

        chromeRemoteInterface(async client => {
            console.log('Connected to google chrome in headless mode');
            
            // Extract used DevTools domains.
            const { DOM, Emulation, Network, Page, Runtime } = client;

            // Enable events on domains we are interested in.
            await Page.enable();
            await DOM.enable();
            await Network.enable();

            // Set up viewport resolution, etc.
            const deviceMetrics = {
                width: viewportWidth,
                height: viewportHeight,
                deviceScaleFactor: 0,
                mobile: false,
                fitWindow: false,
            };
            await Emulation.setDeviceMetricsOverride(deviceMetrics);
            await Emulation.setVisibleSize({ width: viewportWidth, height: viewportHeight });

            // Navigate to target page
            const url = `file:///${tmpFile}`;
            console.log(`Openning ${url}`);
            await Page.navigate({ url });

            // Wait for page load event to take screenshot
            Page.loadEventFired(async () => {
                console.log(`Loaded ${url}`);
                
                // If the `full` CLI option was passed, we need to measure the height of
                // the rendered page and use Emulation.setVisibleSize
                if (fullPage) {
                    const { root: { nodeId: documentNodeId } } = await DOM.getDocument();

                    // await Emulation.setVisibleSize({ width: viewportWidth, height: viewportHeight });
                    // This forceViewport call ensures that content outside the viewport is
                    // rendered, otherwise it shows up as grey. Possibly a bug?
                    await Emulation.forceViewport({ x: 0, y: 0, scale: 1 });
                }

                const screenshot = await Page.captureScreenshot({ format: 'png' });
                const buffer = new Buffer(screenshot.data, 'base64');

                writeFile(`output.png`, buffer, 'base64', err => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    console.log('Screenshot saved');
                    client.close();
                    chrome.kill();
                });
            });
        }).on('error', err => {
            console.error('Cannot connect to browser:', err);
        });
    });
});

import express from 'express';
import bodyParser from 'body-parser';
import chalk from 'chalk';
const { choosePort } = require('react-dev-utils/WebpackDevServerUtils');

import convertToPng from './convertToPng';
import toPngDataUrl from './toPngDataUrl';

const print = console.log; // eslint-disable-line
const formatMessage = chalk.bold.gray;

export default (port = 3000) => {
    const host = process.env.HOST || '0.0.0.0';

    return choosePort(host, port).then(finalPort => {
        const app = express();
        app.use(bodyParser.text({ type: '*/*' }));

        app.post('/', async (req, res) => {
            const svg = req.body;
            const asDataUrl = req.query['data-url'];
            const { height, width } = req.query;

            try {
                const data = await convertToPng(svg, { height, width });
                if (asDataUrl) {
                    res.end(toPngDataUrl(data));
                    return;
                }

                const buffer = new Buffer(data, 'base64');

                res.setHeader('Content-Type', 'image/png');
                res.setHeader('Content-Length', buffer.length);
                res.end(buffer);
            } catch (error) {
                res.status(500);
                res.send(error.message);
            }
        });

        app.listen(finalPort, () => {
            print(
                formatMessage(`Running svg_to_png server on`),
                `http://localhost:${finalPort}`,
            );
        });
    });
};

import express from 'express';
import bodyParser from 'body-parser';
import chalk from 'chalk';
const { choosePort } = require('react-dev-utils/WebpackDevServerUtils');

import convertToPng from './convertToPng';

const print = console.log; // eslint-disable-line
const formatMessage = chalk.bold.gray;

export default (port = 3000) => {
    const host = process.env.HOST || '0.0.0.0';

    return choosePort(host, port).then(finalPort => {
        const app = express();
        app.use(bodyParser.text({ type: '*/*' }));

        app.post('/', async (req, res) => {
            const svg = req.body;
            try {
                const png = await convertToPng(svg);
                res.send(png);
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

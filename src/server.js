import express from 'express';
import bodyParser from 'body-parser';
import chalk from 'chalk';

import convertToPngDataUrl from './convertToPngDataUrl';

const print = console.log; // eslint-disable-line
const formatMessage = chalk.bold.gray;

export default (port = 3000) =>
    new Promise(() => {
        const app = express();
        app.use(bodyParser.text({ type: '*/*' }));

        app.post('/', async (req, res) => {
            const svg = req.body;
            try {
                const png = await convertToPngDataUrl(svg);
                res.send(png);
            } catch (error) {
                res.status(500);
                res.send(error.message);
            }
        });

        app.listen(port, () => {
            print(formatMessage(`Server on`), `http://localhost:${port}`);
        });
    });

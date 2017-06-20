import express from 'express';
import bodyParser from 'body-parser';
import convertToPngDataUrl from './convertToPngDataUrl';

export default async (port = 3000) => {
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

    app.listen(port);
};

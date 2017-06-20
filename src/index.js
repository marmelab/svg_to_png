import getSvgFromStdIn from './getSvgFromStdIn';
import convertToPngDataUrl from './convertToPngDataUrl';

const executeShellCommand = async () => {
    const svg = await getSvgFromStdIn();
    const pngDataUrl = await convertToPngDataUrl(svg);
    console.log(pngDataUrl);
}

executeShellCommand();

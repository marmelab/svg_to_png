export default (svg, { width, height }) => {
    const minWidth = 320;
    const minHeight = 240;
    const widthMatches = /svg[\s\S]*?width="(.*?)"/im.exec(svg);
    let svgWidth = widthMatches
        ? Math.ceil(parseFloat(widthMatches[1]))
        : minWidth;
    svgWidth = svgWidth < minWidth ? minWidth : svgWidth;

    const heightMatches = /svg[\s\S]*?height="(.*?)"/im.exec(svg);
    let svgHeight = heightMatches
        ? Math.ceil(parseFloat(heightMatches[1]))
        : minHeight;
    svgHeight = svgHeight < minHeight ? minHeight : svgHeight;

    if (width && height) {
        return { width, height };
    }

    if (width) {
        return {
            width,
            height: svgHeight / svgWidth * width,
        };
    }

    if (height) {
        return {
            height,
            width: svgWidth / svgHeight * height,
        };
    }

    return {
        width: svgWidth,
        height: svgHeight,
    };
};

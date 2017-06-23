const escapeHtml = html =>
    html
        .replace(/\s{2,}/g, '')
        .replace(/%/g, '%25')
        .replace(/&/g, '%26')
        .replace(/#/g, '%23')
        .replace(/"/g, '%22')
        .replace(/'/g, '%27');

export default html => {
    return `data:text/html;charset=UTF-8,${escapeHtml(html)}`;
};

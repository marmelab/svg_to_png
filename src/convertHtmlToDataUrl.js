import Datauri from 'datauri';

export default html => {
    const datauri = new Datauri();
    return datauri.format('.html', html).content;
};

import cliparoo from 'cliparoo';

export default value =>
    new Promise((resolve, reject) =>
        cliparoo(value, error => (error ? reject(error) : resolve())),
    );

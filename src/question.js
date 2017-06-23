import readlineSync from 'readline-sync';

export default text => readlineSync.keyInYNStrict(text);

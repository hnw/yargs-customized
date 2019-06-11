'use strict'

/*
 * Argvオブジェクトはトリッキーな実装で、
 * Argv()でYargsオブジェクトのコンストラクタとして動作しつつ、
 * Argv.method()でYargs(process.argv.slice(2))のメソッドを呼ぶ。
 * またYargs.argvはgetter関数が定義されている。
 */

const origArgv = require('yargs');
function Argv() {
  const origYargs = origArgv.apply(null, arguments);
  return customizedYargs(origYargs);
}
const myArgv = Argv;

// add default settings into all Yargs object which is returned from Argv methods/properties
Object.keys(origArgv).forEach((key) => {
  if (key === 'argv') {
    Object.defineProperty(myArgv, 'argv', {
      get: () => {
        return customizedYargs(origArgv).argv;
      },
      enumerable: true
    });
  } else if (typeof origArgv[key] === 'function') {
    const origMethod = origArgv[key];
    myArgv[key] = function () {
      const myYargs = customizedYargs(origArgv);
      return origMethod.apply(myYargs, arguments);
    }
  }
})

function customizedYargs(yargs) {
  /* customized behavior */
  return yargs
    .parserConfiguration({'duplicate-arguments-array': false}) // あとから指定したオプションが勝つ
    .count('verbose') // -v, -vvなどを許容
    .alias('v', 'verbose')
    .describe('verbose', 'be verbose')
    .locale('en'); // ヘルプが日本語になるとカッコ悪いので
}

exports = module.exports = myArgv;

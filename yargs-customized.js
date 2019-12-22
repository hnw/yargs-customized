'use strict'

/*
 * yargs-customized: カスタム版のyargs
 *
 * オリジナルとの差分
 *
 * 1. デフォルトオプションを変更
 *
 */

/*
 * yargsのArgvオブジェクトの特殊性について
 *
 * Argvオブジェクトはトリッキーな実装で、
 * Argv()と呼ばれたらYargsオブジェクトのファクトリとして動作し、
 * Argv.method()と呼ばれた場合は
 * Yargs(...(process.argv.slice(2))).method()として動作する。
 * さらに、Yargs.argvにはgetter関数が定義されている。
 *
 * そのため、挙動を変更するにはこれらの関数を全てwrapする必要がある。
 */

const origArgv = require('yargs');

/*
 * OrigArgvのファクトリを上書き
 */
const myArgv = (...args) => {
  return customizedYargs(origArgv(...args));
}

/*
 * OrigArgvの全プロパティについて、customizedYargsを適用した関数として上書き
 */
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
    myArgv[key] = (...args) => {
      const myYargs = customizedYargs(origArgv);
      return origMethod.apply(myYargs, args);
    }
  }
})

/*
 * ArgvオブジェクトまたはYargsオブジェクトを受け取り
 * 自分好みのオプション設定を行ったYargsオブジェクトを返す。
 */
const customizedYargs = (yargs) => {
  /* customized behavior */
  return yargs
    .parserConfiguration({'duplicate-arguments-array': false}) // あとから指定したオプションが勝つ
    .count('verbose') // -v, -vvなどを許容
    .alias('v', 'verbose')
    .describe('verbose', 'be verbose')
    .locale('en'); // ヘルプが日本語になるとカッコ悪いので
}

exports = module.exports = myArgv;

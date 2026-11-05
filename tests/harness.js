// Loads the game logic (lib.js matrix/shape helpers + lib2.js) into a Node vm
// context, without WebGL or a DOM. Each call to loadGame() gives a fresh game.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');

function loadGame({ dir = ROOT, storage = null, seed = 12345 } = {}) {
    const quiet = () => {};
    const ctx = vm.createContext({
        console: { log: quiet, table: quiet, warn: quiet, info: quiet, error: quiet },
    });
    if (storage) ctx.localStorage = storage;

    // lib.js: matrix stack and shape helpers only (everything before the shaders)
    const lib = fs.readFileSync(path.join(dir, 'lib.js'), 'utf8');
    vm.runInContext(lib.slice(0, lib.indexOf('// GPU SHADERS')), ctx, { filename: 'lib.js' });

    // stand-ins for the WebGL parts of lib.js: draw() just records the matrix
    vm.runInContext(`
        var drawCalls = [];
        var M = new Matrix();
        var draw = (shape, color, opacity, tex, bump) => {
            drawCalls.push({ m: M.get().slice(), color: color, tex: tex });
            return M;
        };
        (() => {
            let a = ${seed};
            Math.random = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
                t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
        })();
    `, ctx);

    vm.runInContext(fs.readFileSync(path.join(dir, 'lib2.js'), 'utf8'), ctx, { filename: 'lib2.js' });

    const run = code => vm.runInContext(code, ctx);
    return { ctx, run };
}

// A minimal in-memory localStorage
function memoryStorage() {
    const data = new Map();
    return {
        getItem: k => (data.has(k) ? data.get(k) : null),
        setItem: (k, v) => data.set(k, String(v)),
        removeItem: k => data.delete(k),
        clear: () => data.clear(),
        _data: data,
    };
}

// The default room: the addItem/moveItem/stopChangeItem lines of index.html
function buildDefaultRoom(game, dir = ROOT) {
    const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
    const start = html.indexOf('//add default instance');
    const end = html.indexOf('function drawFrame');
    game.run(html.slice(start, end));
}

module.exports = { loadGame, memoryStorage, buildDefaultRoom, ROOT };

// Bug 5: for every item and every facing, "move red" / "move blue" must move the item
// the way its red / blue arrow points. Run with: node --test
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadGame } = require('./harness');

const DIR = process.env.GAME_DIR;
const newGame = () => loadGame(DIR ? { dir: DIR } : {});

const FACES = ['forward', 'right', 'backward', 'left'];
const WALLS = (process.env.WALLS || 'back_wall,left_wall,right_wall').split(',');

// Draws the selected item (M starts as the identity, so matrices are in room coordinates)
// and returns its object matrix plus the world direction of both arrows.
// The arrows are drawn as M_obj * move(...) * scale(...); the blue one is always
// move(.1, .35, .02).scale(.08, .02, .02), which gives M_obj back.
const ARROWS = `(() => {
    drawCalls = [];
    selectedInstance.draw();
    const red = drawCalls.find(c => c.color.join() === '1,0,0').m;
    const blue = drawCalls.find(c => c.color.join() === '0,0,1').m;
    const obj = mTr(-.1, -.35, -.02, mSc(1 / .08, 1 / .02, 1 / .02, blue));
    // where the red arrow sits in object space tells which way along z it points
    const inv = mInverse(obj);
    const z = inv[2] * red[12] + inv[6] * red[13] + inv[10] * red[14] + inv[14];
    const s = Math.sign(z);
    return JSON.stringify({
        origin: [obj[12], obj[13], obj[14]],
        red: [s * obj[8], s * obj[9], s * obj[10]],
        blue: [obj[0], obj[1], obj[2]],
    });
})()`;

const sub = (a, b) => a.map((v, i) => v - b[i]);
const norm = a => { const l = Math.hypot(...a); return a.map(v => v / l); };
const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);

function check(type, platform, face) {
    const g = newGame();
    g.run(`addItem('${type}')`);
    if (platform !== 'floor' && platform !== 'back_wall') g.run(`choosePlatform(${platform})`);
    // start in the middle so every direction has room
    g.run(`selectedInstance.pos_forward = 3; selectedInstance.pos_right = 3;
           while (selectedInstance.facing() !== '${face}') selectedInstance.turn(1);`);
    for (const color of ['red', 'blue']) {
        const before = JSON.parse(g.run(ARROWS));
        const pos = g.run('[selectedInstance.pos_forward, selectedInstance.pos_right].join()');
        g.run(`moveItem('${color}')`);
        assert.notEqual(g.run('[selectedInstance.pos_forward, selectedInstance.pos_right].join()'), pos,
            `${type} on ${platform} facing ${face}: ${color} did not move`);
        const after = JSON.parse(g.run(ARROWS));
        const moved = norm(sub(after.origin, before.origin));
        const arrow = norm(before[color]);
        assert.ok(dot(moved, arrow) > 0.99,
            `${type} on ${platform} facing ${face}: ${color} arrow ${arrow.map(v => v.toFixed(2))} ` +
            `but moved ${moved.map(v => v.toFixed(2))}`);
    }
}

for (const type of ['television', 'chair', 'computer', 'table', 'bed', 'sofa']) {
    test(`arrows match moves: ${type}`, () => { for (const face of FACES) check(type, 'floor', face); });
}
for (const type of ['painting', 'clock']) {
    for (const wall of WALLS) {
        test(`arrows match moves: ${type} on ${wall}`, () => { for (const face of FACES) check(type, wall, face); });
    }
}

// Paintings and clocks on the left and right walls. Run with: node --test
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadGame, memoryStorage } = require('./harness');

const json = v => JSON.parse(JSON.stringify(v));
const press = (g, steps) => {
    for (const s of steps) {
        g.run({ r: "moveItem('red')", b: "moveItem('blue')", R: "rotateItem('red')", B: "rotateItem('blue')" }[s]);
    }
};
const taken = (g, condi) => g.run(`${condi}.flat().reduce((a, b) => a + b, 0)`);

test('selecting a side wall moves the decoration being edited there; Check uses that wall\'s cells', () => {
    for (const wall of ['left_wall', 'right_wall']) {
        const g = loadGame();
        g.run("addItem('painting')");
        press(g, 'rb');
        g.run(`choosePlatform(${wall})`);
        assert.equal(g.run(`selectedInstance.platform === ${wall}`), true);
        assert.deepEqual(json(g.run('[selectedInstance.pos_forward, selectedInstance.pos_right]')), [1, 1]);
        assert.equal(g.run('stopChangeItem()'), true);
        assert.equal(taken(g, `${wall}_condi`), 4);
        assert.equal(taken(g, 'back_wall_condi') + taken(g, 'floor_condi'), 0);
        // a second one on the same cells is refused, on the other side wall it is fine
        g.run(`choosePlatform(${wall})`); g.run("addItem('clock')"); press(g, 'rb');
        assert.equal(g.run(`selectedInstance.platform === ${wall}`), true, 'added on the selected wall');
        assert.equal(g.run('stopChangeItem()'), false);
        const other = wall === 'left_wall' ? 'right_wall' : 'left_wall';
        g.run(`choosePlatform(${other})`);
        assert.equal(g.run('stopChangeItem()'), true);
        assert.equal(taken(g, `${other}_condi`), 4);
    }
});

test('floor furniture ignores the wall buttons', () => {
    const g = loadGame();
    g.run("addItem('chair')");
    g.run('choosePlatform(left_wall)');
    assert.equal(g.run('selectedInstance.platform === floor'), true);
});

test('side walls use every column, the top row stays unused like on the back wall', () => {
    for (const wall of ['left_wall', 'right_wall', 'back_wall']) {
        const g = loadGame();
        g.run("addItem('painting')");
        g.run(`choosePlatform(${wall})`);
        press(g, 'r'.repeat(10) + 'b'.repeat(10));
        const expectRight = wall === 'back_wall' ? 5 : 6;
        assert.deepEqual(json(g.run('[selectedInstance.pos_forward, selectedInstance.pos_right]')), [5, expectRight], wall);
        press(g, 'RR' + 'r'.repeat(10) + 'b'.repeat(10)); // back to row 0, column 0
        assert.deepEqual(json(g.run('[selectedInstance.pos_forward, selectedInstance.pos_right]')), [0, 0], wall);
    }
    // from the last side-wall column to the back wall: pulled back inside
    const g = loadGame();
    g.run("addItem('clock')"); g.run('choosePlatform(left_wall)'); press(g, 'bbbbbbbb');
    assert.equal(g.run('selectedInstance.pos_right'), 6);
    g.run('choosePlatform(back_wall)');
    assert.equal(g.run('selectedInstance.pos_right'), 5);
    assert.equal(g.run('stopChangeItem()'), true);
});

// corners of the drawn painting / clock body, in room coordinates
const BODY_CORNERS = `(() => {
    drawCalls = []; selectedInstance.draw();
    const isBody = c => (typeof c.tex === 'number' && c.tex >= 0 && c.tex <= 3) ||    // painting picture
                        (c.color.join() === '1,1,1' && c.tex === undefined);             // clock face
    const out = [];
    for (const c of drawCalls.filter(isBody)) {
        for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) {
            const m = c.m;
            out.push([0, 1, 2].map(k => m[k] * x + m[4 + k] * y + m[8 + k] * z + m[12 + k]));
        }
    }
    return JSON.stringify(out);
})()`;
// which way the front of the decoration faces (model +y after the turnX)
const FRONT = `(() => {
    drawCalls = []; selectedInstance.draw();
    const blue = drawCalls.find(c => c.color.join() === '0,0,1').m;
    const obj = mTr(-.1, -.35, -.02, mSc(1 / .08, 1 / .02, 1 / .02, blue));
    const l = Math.hypot(obj[4], obj[5], obj[6]);
    return JSON.stringify([obj[4] / l, obj[5] / l, obj[6] / l]);
})()`;

test('at every reachable spot a decoration stays inside the room and faces into it', () => {
    // inner faces of the room
    const box = { x: [-.40, .40], y: [-.48, .28], z: [-.70, .10] };
    const into = { back_wall: [0, 0, 1], left_wall: [1, 0, 0], right_wall: [-1, 0, 0] };
    for (const type of ['painting', 'clock']) {
        for (const wall of Object.keys(into)) {
            const g = loadGame();
            g.run(`addItem('${type}')`); g.run(`choosePlatform(${wall})`);
            const maxF = g.run('selectedInstance.maxForward() - 1'), maxR = g.run('selectedInstance.maxRight() - 1');
            for (let f = 0; f <= maxF; f++) {
                for (let r = 0; r <= maxR; r++) {
                    g.run(`selectedInstance.pos_forward = ${f}; selectedInstance.pos_right = ${r};`);
                    for (const [x, y, z] of JSON.parse(g.run(BODY_CORNERS))) {
                        const where = `${type} on ${wall} at (${f},${r}): corner (${x.toFixed(3)}, ${y.toFixed(3)}, ${z.toFixed(3)})`;
                        assert.ok(x >= box.x[0] - 1e-9 && x <= box.x[1] + 1e-9, where);
                        assert.ok(y >= box.y[0] - 1e-9 && y <= box.y[1] + 1e-9, where);
                        assert.ok(z >= box.z[0] - 1e-9 && z <= box.z[1] + 1e-9, where);
                    }
                }
            }
            const front = JSON.parse(g.run(FRONT));
            front.forEach((v, k) => assert.ok(Math.abs(v - into[wall][k]) < 1e-9, `${type} on ${wall} faces ${front}`));
        }
    }
});

test('side-wall decorations sit on their own cells', () => {
    // centre of the drawn body along the wall equals the centre of the covered cells
    for (const wall of ['left_wall', 'right_wall']) {
        const g = loadGame();
        g.run("addItem('clock')"); g.run(`choosePlatform(${wall})`);
        for (let r = 0; r <= 6; r++) {
            g.run(`selectedInstance.pos_right = ${r}`);
            const corners = JSON.parse(g.run(BODY_CORNERS));
            const z = (Math.min(...corners.map(c => c[2])) + Math.max(...corners.map(c => c[2]))) / 2;
            // cells pos_right .. pos_right+1; the left wall counts towards the back (-z)
            const along = -.4 + (r + 1) * .1;
            const expected = -.3 + (wall === 'left_wall' ? -along : along);
            assert.ok(Math.abs(z - expected) < 1e-9, `${wall} column ${r}: centre z ${z} expected ${expected}`);
        }
    }
});

test('hiding a side wall hides what hangs on it, except the decoration being edited', () => {
    const g = loadGame();
    g.run('choosePlatform(left_wall)'); g.run("addItem('painting')"); g.run('stopChangeItem()');
    g.run('choosePlatform(right_wall)'); g.run("addItem('clock')"); g.run('stopChangeItem()');
    const drawn = () => g.run('drawCalls = []; drawAllInstance(); drawCalls.length');
    const all = drawn();
    g.run('hidePlatform(left_wall)');
    const leftHidden = drawn();
    assert.ok(leftHidden < all && leftHidden > 0);
    g.run('hidePlatform(right_wall)');
    assert.equal(drawn(), 0);
    // select the hidden painting: it is drawn while being edited
    g.run('selectItem()');
    assert.equal(g.run('selectedInstance.platform === left_wall'), true);
    assert.ok(drawn() > 0);
    g.run('stopChangeItem()');
    assert.equal(drawn(), 0);
    g.run('hidePlatform(left_wall); hidePlatform(right_wall)');
    assert.equal(drawn(), all);
});

test('select, delete, save and load work with side-wall decorations', () => {
    const storage = memoryStorage();
    const a = loadGame({ storage });
    a.run('buildDefaultRoom()');
    a.run('choosePlatform(left_wall)'); a.run("addItem('painting')"); press(a, 'rrbbbB'); a.run('stopChangeItem()');
    a.run('choosePlatform(right_wall)'); a.run("addItem('clock')"); press(a, 'rbbbbbb'); a.run('stopChangeItem()');
    a.run('choosePlatform(right_wall)'); a.run("addItem('painting')"); a.run('stopChangeItem()');
    assert.equal(a.run('saveRoom()'), 'saved');

    const b = loadGame({ storage, seed: 5 });
    assert.equal(b.run('loadRoom()'), true);
    assert.equal(b.run('JSON.stringify(roomData())'), a.run('JSON.stringify(roomData())'));
    assert.equal(b.run('JSON.stringify([left_wall_condi, right_wall_condi, back_wall_condi])'),
        a.run('JSON.stringify([left_wall_condi, right_wall_condi, back_wall_condi])'));

    // cycle to the clock on the right wall and delete it: only its cells are freed
    const seen = [];
    while (b.run("selectedInstance === null || selectedInstance.constructor.name !== 'Clock' || selectedInstance.platform !== right_wall")) {
        b.run('selectItem()');
        seen.push(b.run("selectedInstance.constructor.name + '@' + nameIn(PLATFORMS, selectedInstance.platform)"));
        assert.ok(seen.length < 20);
    }
    b.run('deleteItem()');
    assert.equal(taken(b, 'right_wall_condi'), 4, 'the other painting keeps its cells');
    assert.equal(taken(b, 'left_wall_condi'), 4);
    assert.equal(b.run('allInstance.length'), 6);
});

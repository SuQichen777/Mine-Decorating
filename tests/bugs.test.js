// Reproductions of the reported bugs. Run with: node --test tests/
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadGame } = require('./harness');

const DIR = process.env.GAME_DIR; // optional: run the same tests against another checkout
const newGame = () => loadGame(DIR ? { dir: DIR } : {});

const json = v => JSON.parse(JSON.stringify(v));
const cells = (g, condi) => json(g.run(condi));
const zeros = () => Array.from({ length: 8 }, () => Array(8).fill(0));
// steps: "r" = move red, "b" = move blue, "R" = rotate red, "B" = rotate blue
const press = (g, steps) => {
    for (const s of steps) {
        g.run({ r: "moveItem('red')", b: "moveItem('blue')", R: "rotateItem('red')", B: "rotateItem('blue')" }[s]);
    }
};
// every item stays inside its 8 * 8 grid
const assertInsideGrid = g => {
    const bad = g.run(`allInstance.concat(wallInstance).filter(i =>
        i.pos_forward < 0 || i.pos_right < 0 ||
        i.pos_forward + i.unit_length_forward - 1 > 7 || i.pos_right + i.unit_length_right - 1 > 7).length`);
    assert.equal(bad, 0);
};
// the occupancy tables agree with the placed items
const assertCellsMatchItems = g => {
    const expected = g.run(`(() => {
        const t = { floor: [], left_wall: [], right_wall: [], back_wall: [] };
        for (const k in t) for (let i = 0; i < 8; i++) t[k].push([0,0,0,0,0,0,0,0]);
        const name = p => p === floor ? 'floor' : p === left_wall ? 'left_wall' : p === right_wall ? 'right_wall' : 'back_wall';
        for (const item of allInstance.concat(wallInstance)) {
            // cells are free while editing (also under the things on a table being edited)
            if (item === selectedInstance || (item.is_placed_on_table && item.placing_table === selectedInstance)) continue;
            for (let f = item.pos_forward; f < item.pos_forward + item.unit_length_forward; f++)
                for (let r = item.pos_right; r < item.pos_right + item.unit_length_right; r++)
                    t[name(item.platform)][f][r] = 1;
        }
        return JSON.stringify(t);
    })()`);
    const actual = g.run(`JSON.stringify({ floor: floor_condi, left_wall: left_wall_condi,
        right_wall: right_wall_condi, back_wall: back_wall_condi })`);
    assert.deepEqual(JSON.parse(actual), JSON.parse(expected));
};

test('bug 1: a failed Check does not take cells', () => {
    const g = newGame();
    g.run("addItem('chair')"); press(g, 'rb');
    assert.equal(g.run('stopChangeItem()'), true);
    g.run("addItem('table')"); // 2 * 2 at (0,0), overlaps the chair at (1,1)
    assert.equal(g.run('stopChangeItem()'), false);
    const expected = zeros(); expected[1][1] = 1;
    assert.deepEqual(cells(g, 'floor_condi'), expected, 'only the chair cell is taken');

    g.run("addItem('chair')"); // the table could not be placed, so it is removed
    assert.equal(g.run('allInstance.length'), 2);
    assert.equal(g.run('stopChangeItem()'), true, 'the new chair fits at the free (0,0)');
});

test('bug 1: moving a failed item to free space and checking leaves no old cells behind', () => {
    const g = newGame();
    g.run("addItem('chair')"); press(g, 'rb'); g.run('stopChangeItem()');
    g.run("addItem('table')");
    assert.equal(g.run('stopChangeItem()'), false);
    press(g, 'rr'); // table now covers rows 2-3
    assert.equal(g.run('stopChangeItem()'), true);
    const expected = zeros(); expected[1][1] = 1;
    expected[2][0] = expected[2][1] = expected[3][0] = expected[3][1] = 1;
    assert.deepEqual(cells(g, 'floor_condi'), expected);
});

test('bug 2: deleting a wall item does not delete floor furniture', () => {
    const g = newGame();
    g.run("addItem('chair')"); g.run('stopChangeItem()');
    g.run("addItem('sofa')"); press(g, 'bb');
    assert.equal(g.run('stopChangeItem()'), true);
    g.run("addItem('clock')");
    g.run('deleteItem()');
    assert.deepEqual(json(g.run("allInstance.map(i => i.constructor.name)")), ['Chair', 'Sofa']);
    assert.equal(g.run('wallInstance.length'), 0);
    assert.equal(g.run("allInstance.every(i => i.visible)"), true);
    assertCellsMatchItems(g);
});

test('bug 3: Select (next) Item reaches wall items and frees the right wall cells', () => {
    const g = newGame();
    g.run('buildDefaultRoom()');
    const floorBefore = cells(g, 'floor_condi');
    const seen = [];
    for (let k = 0; k < 7; k++) {
        g.run('selectItem()');
        seen.push(g.run('selectedInstance.constructor.name'));
        if (seen[k] === 'Clock') {
            assert.deepEqual(cells(g, 'back_wall_condi'), zeros(), 'the clock cells are free while editing it');
            assert.deepEqual(cells(g, 'floor_condi'), floorBefore, 'floor cells are untouched');
        }
    }
    assert.ok(seen.includes('Clock'), `selected: ${seen}`);
    assert.equal(new Set(seen).size, 6, 'each kind of item in the default room is reached in one round');
    g.run('stopChangeItem()');
    assertCellsMatchItems(g);
});

test('bug 3: when the current item has to be removed, the next one is not skipped', () => {
    const g = newGame();
    for (const steps of ['', 'b', 'bb']) { // chairs A, B, C at (0,0), (0,1), (0,2)
        g.run("addItem('chair')"); press(g, steps); g.run('stopChangeItem()');
    }
    g.run('selectItem()');  // A
    press(g, 'b');          // A onto B: cannot stay there
    g.run('selectItem()');  // A is removed, B is next
    assert.equal(g.run('allInstance.length'), 2);
    assert.equal(g.run('selectedInstance === allInstance[0]'), true, 'B (now first) is selected, not C');
});

test('bug 4: deleting a table also deletes what is on it', () => {
    const g = newGame();
    g.run('buildDefaultRoom()'); // the computer stands on the table
    while (g.run('selectedInstance === null || !selectedInstance.is_table')) g.run('selectItem()');
    g.run('deleteItem()');
    assert.equal(g.run("allInstance.some(i => i.is_table || i.constructor.name === 'Computer')"), false);
    assertCellsMatchItems(g);
    // the cell under the old computer is really free now
    g.run("addItem('chair')"); press(g, 'rrrrbbb');
    assert.equal(g.run('stopChangeItem()'), true);
});

test('bug 4: deleting a small thing on a table frees its spot on the table', () => {
    const g = newGame();
    g.run('buildDefaultRoom()');
    while (g.run("selectedInstance === null || selectedInstance.constructor.name !== 'Computer'")) g.run('selectItem()');
    g.run('deleteItem()');
    assert.equal(g.run('allInstance.find(i => i.is_table).item_on_table.length'), 0);
    g.run("addItem('television')"); press(g, 'rrrrbbb'); // same spot on the table
    assert.equal(g.run('stopChangeItem()'), true);
    assert.equal(g.run('allInstance[allInstance.length - 1].is_placed_on_table'), true);
});

test('bug 6: length-2 items can move back to row 0 and column 0', () => {
    for (const type of ['table', 'painting', 'clock']) {
        const g = newGame();
        g.run(`addItem('${type}')`);
        press(g, 'rb');   // to (1,1)
        press(g, 'RR');   // now facing backward: red and blue go back
        press(g, 'rb');
        assert.deepEqual(json(g.run('[selectedInstance.pos_forward, selectedInstance.pos_right]')), [0, 0], type);
    }
});

test('bug 6: the bed cannot turn out of the grid', () => {
    const g = newGame();
    g.run("addItem('bed')");
    press(g, 'bbbbbb');
    assert.equal(g.run('selectedInstance.pos_right'), 7);
    press(g, 'R');
    assertInsideGrid(g);
    press(g, 'B');
    assertInsideGrid(g);
});

test('bug 6: random button presses never leave the grid', () => {
    const types = ['television', 'chair', 'computer', 'table', 'bed', 'sofa', 'painting', 'clock'];
    const ops = ["moveItem('red')", "moveItem('blue')", "rotateItem('red')", "rotateItem('blue')"];
    let seed = 1;
    const rand = n => { seed = (seed * 16807) % 2147483647; return seed % n; };
    for (let round = 0; round < 200; round++) {
        const g = newGame();
        g.run(`addItem('${types[round % types.length]}')`);
        for (let k = 0; k < 40; k++) { g.run(ops[rand(ops.length)]); assertInsideGrid(g); }
    }
});

test('bug 7: Select (next) Item in an empty room does nothing', () => {
    const g = newGame();
    assert.doesNotThrow(() => g.run('selectItem()'));
    assert.equal(g.run('selectedInstance'), null);
});

test('random play keeps the occupancy tables consistent with the items', () => {
    const types = ['television', 'chair', 'computer', 'table', 'bed', 'sofa', 'painting', 'clock'];
    let seed = 7;
    const rand = n => { seed = (seed * 16807) % 2147483647; return seed % n; };
    for (let round = 0; round < 150; round++) {
        const g = newGame();
        for (let k = 0; k < 80; k++) {
            const r = rand(100);
            if (r < 15) g.run(`addItem('${types[rand(types.length)]}')`);
            else if (r < 50) g.run(`moveItem('${rand(2) ? 'red' : 'blue'}')`);
            else if (r < 62) g.run(`rotateItem('${rand(2) ? 'red' : 'blue'}')`);
            else if (r < 80) g.run('stopChangeItem()');
            else if (r < 93) g.run('selectItem()');
            else g.run('deleteItem()');
            assertCellsMatchItems(g);
            assertInsideGrid(g);
            // things on a table are drawn raised, so they must still be on a live table
            assert.equal(g.run(`allInstance.filter(i => i.is_placed_on_table &&
                !(allInstance.includes(i.placing_table) && i.placing_table.item_on_table.includes(i))).length`), 0);
        }
    }
});

test('floor furniture is drawn centred on the cells it covers (the bed facing left/right was one cell off)', () => {
    for (const type of ['television', 'chair', 'computer', 'table', 'bed', 'sofa']) {
        for (const face of ['forward', 'right', 'backward', 'left']) {
            const g = newGame();
            g.run(`addItem('${type}')`);
            g.run(`selectedInstance.pos_forward = 3; selectedInstance.pos_right = 3;
                   while (selectedInstance.facing() !== '${face}') selectedInstance.turn(1);`);
            const [x, z, ex, ez] = json(g.run(`(() => {
                const i = selectedInstance;
                drawCalls = []; i.draw();
                const blue = drawCalls.find(c => c.color.join() === '0,0,1').m;
                const obj = mTr(-.1, -.35, -.02, mSc(1 / .08, 1 / .02, 1 / .02, blue));
                // centre of cells pos .. pos+len-1
                const cx = floor.position.x + (2 * i.pos_right + i.unit_length_right - 8) * floor.size.x / 8;
                const cz = floor.position.z + (2 * i.pos_forward + i.unit_length_forward - 8) * floor.size.z / 8;
                return [obj[12], obj[14], cx, cz];
            })()`));
            assert.ok(Math.abs(x - ex) < 1e-9 && Math.abs(z - ez) < 1e-9,
                `${type} facing ${face}: drawn at (${x.toFixed(3)}, ${z.toFixed(3)}), cells centre (${ex.toFixed(3)}, ${ez.toFixed(3)})`);
        }
    }
});

// Save / load / reset / clear. Run with: node --test
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadGame, memoryStorage } = require('./harness');

const KEY = 'mine-decorating-room';
const data = g => JSON.parse(g.run('JSON.stringify(roomData())'));
const allCells = g => JSON.parse(g.run('JSON.stringify([floor_condi, left_wall_condi, right_wall_condi, back_wall_condi])'));
const emptyCells = () => Array.from({ length: 4 }, () => Array.from({ length: 8 }, () => Array(8).fill(0)));
const press = (g, steps) => {
    for (const s of steps) {
        g.run({ r: "moveItem('red')", b: "moveItem('blue')", R: "rotateItem('red')", B: "rotateItem('blue')" }[s]);
    }
};
const throwingStorage = () => ({
    getItem() { throw new Error('SecurityError'); },
    setItem() { throw new Error('QuotaExceededError'); },
});

// a room with a bit of everything: turned items, a TV added before the table it stands on,
// a painting, and a table with two things on it
function buildBusyRoom(g) {
    g.run("addItem('television')"); press(g, 'rrrrrbbbbb'); g.run('stopChangeItem()');       // TV on the floor at (5,5)
    g.run("addItem('table')"); press(g, 'rbb'); assert.equal(g.run('stopChangeItem()'), true); // table at (1,2)-(2,3)
    g.run("addItem('computer')"); press(g, 'rbb'); assert.equal(g.run('stopChangeItem()'), true); // on the table
    g.run("addItem('bed')"); press(g, 'bbbbbR'); assert.equal(g.run('stopChangeItem()'), true);   // turned: 1 x 2
    g.run("addItem('sofa')"); press(g, 'B'); assert.equal(g.run('stopChangeItem()'), true);
    g.run("addItem('painting')"); press(g, 'rbbbB'); assert.equal(g.run('stopChangeItem()'), true);
    g.run("addItem('clock')"); press(g, 'rrrr'); assert.equal(g.run('stopChangeItem()'), true);
    // move the floor TV onto the table: now a small thing comes before its table in the list
    g.run('while (selectedInstance === null || selectedInstance.constructor.name !== "Television") selectItem();');
    press(g, 'RR');               // facing backward: red goes back, blue goes left
    press(g, 'rrrbb');            // to (2,3), on the table
    assert.equal(g.run('stopChangeItem()'), true);
    assert.equal(g.run('allInstance[0].is_placed_on_table'), true);
}

test('save then load gives back the same room, cells and table relations', () => {
    const storage = memoryStorage();
    const a = loadGame({ storage });
    buildBusyRoom(a);
    assert.equal(a.run('saveRoom()'), 'saved');

    const b = loadGame({ storage, seed: 999 }); // another page load (other random paintings)
    assert.equal(b.run('loadRoom()'), true);
    assert.deepEqual(data(b), data(a));
    assert.deepEqual(allCells(b), allCells(a));
    // relations are real objects again
    assert.equal(b.run(`(() => { const t = allInstance.find(i => i.is_table && i.item_on_table.length);
        return t.item_on_table.length === 2 && t.item_on_table.every(x => x.placing_table === t && x.is_placed_on_table); })()`), true);
    assert.equal(b.run('allInstance.concat(wallInstance).every(i => !i.is_under_editing && i.visible)'), true);
    assert.equal(b.run('selectedInstance'), null);
});

test('a loaded room behaves like the original: taken cells block, tables carry their things', () => {
    const storage = memoryStorage();
    const a = loadGame({ storage });
    a.run('buildDefaultRoom()');
    a.run('saveRoom()');
    const b = loadGame({ storage });
    b.run('loadRoom()');
    b.run("addItem('chair')"); press(b, 'rrrrrbbbbb'); // onto the chair at (5,5)
    assert.equal(b.run('stopChangeItem()'), false);
    b.run('deleteItem()');
    b.run('while (selectedInstance === null || !selectedInstance.is_table) selectItem();');
    press(b, 'RRrr');            // turn to backward, move back 2 rows
    assert.equal(b.run('stopChangeItem()'), true);
    assert.equal(b.run(`(() => { const t = allInstance.find(i => i.is_table), c = t.item_on_table[0];
        return [t.pos_forward, c.pos_forward, c.pos_right].join(); })()`), '2,2,3');
});

test('save commits the item being edited, or refuses when it cannot stay there', () => {
    const storage = memoryStorage();
    const g = loadGame({ storage });
    g.run("addItem('chair')"); g.run('stopChangeItem()');
    g.run("addItem('chair')");                       // on top of the first one
    assert.equal(g.run('saveRoom()'), 'not_placed');
    assert.equal(storage.getItem(KEY), null);
    press(g, 'r');
    assert.equal(g.run('saveRoom()'), 'saved');
    assert.equal(g.run('selectedInstance'), null);
    assert.equal(JSON.parse(storage.getItem(KEY)).items.length, 2);
});

test('paintings keep their picture', () => {
    const storage = memoryStorage();
    const a = loadGame({ storage, seed: 1 });
    for (let k = 0; k < 3; k++) { a.run("addItem('painting')"); press(a, 'b'.repeat(2 * k)); a.run('stopChangeItem()'); }
    a.run('saveRoom()');
    const b = loadGame({ storage, seed: 2 });
    b.run('loadRoom()');
    assert.deepEqual(JSON.parse(b.run('JSON.stringify(wallInstance.map(p => p.texture_))')),
        JSON.parse(a.run('JSON.stringify(wallInstance.map(p => p.texture_))')));
});

test('no localStorage at all, or one that throws: nothing breaks', () => {
    for (const storage of [null, throwingStorage()]) {
        const g = loadGame({ storage });
        assert.equal(g.run('loadRoom()'), false);
        g.run('buildDefaultRoom()');
        assert.equal(g.run('saveRoom()'), 'unavailable');
        assert.equal(g.run('allInstance.length + wallInstance.length'), 7);
    }
});

test('a broken or tampered save is ignored (the page then builds the default room)', () => {
    const storage = memoryStorage();
    const a = loadGame({ storage });
    a.run('buildDefaultRoom()');
    a.run('saveRoom()');
    const good = JSON.parse(storage.getItem(KEY));
    const variants = {
        'not json': '{oops',
        'old version': { ...good, version: 0 },
        'unknown type': { ...good, items: [{ ...good.items[0], type: 'piano' }] },
        'chair on a wall': { ...good, items: [{ ...good.items[1], platform: 'back_wall' }] },
        'wrong size': { ...good, items: [{ ...good.items[3], unit_length_forward: 3 }] },
        'outside the floor': { ...good, items: [{ ...good.items[1], pos_forward: 7.5 }] },
        'overlap': { ...good, items: [good.items[1], good.items[1]] },
        'on a missing table': { ...good, items: [good.items[4]] },
        'not on the table': { ...good, items: [good.items[3], { ...good.items[4], pos_right: 0, on_table: 0 }] },
        'bad facing': { ...good, items: [{ ...good.items[0], red_face: 'up' }] },
    };
    for (const [name, value] of Object.entries(variants)) {
        storage.setItem(KEY, typeof value === 'string' ? value : JSON.stringify(value));
        const g = loadGame({ storage });
        assert.equal(g.run('loadRoom()'), false, name);
        assert.equal(g.run('allInstance.length + wallInstance.length'), 0, name);
        assert.deepEqual(allCells(g), emptyCells(), name);
    }
});

test('reset gives the default room, clear empties everything; neither touches the save', () => {
    const storage = memoryStorage();
    const ref = loadGame();
    ref.run('buildDefaultRoom()');

    const g = loadGame({ storage });
    buildBusyRoom(g);
    g.run('saveRoom()');
    const saved = storage.getItem(KEY);
    g.run("addItem('chair')"); // something being edited
    g.run('resetRoom()');
    assert.deepEqual(data(g), data(ref));
    assert.deepEqual(allCells(g), allCells(ref));
    assert.equal(g.run('selectedInstance'), null);
    assert.equal(storage.getItem(KEY), saved);

    g.run("addItem('painting')");
    g.run('clearRoom()');
    assert.equal(g.run('allInstance.length + wallInstance.length'), 0);
    assert.deepEqual(allCells(g), emptyCells());
    assert.equal(g.run('selectedInstance'), null);
    assert.equal(storage.getItem(KEY), saved);
    // the room still works after clearing
    g.run("addItem('table')");
    assert.equal(g.run('stopChangeItem()'), true);
});

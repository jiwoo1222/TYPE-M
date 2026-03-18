const { test } = require('node:test');
const assert = require('node:assert/strict');
const { QUESTIONS } = require('./assessment-data.js');
const { RESULT_KEY, createResult, saveResult, readResults, deleteResult, exportResults, importResults } = require('./result-store.js');
function memoryStore() {
    const data = new Map();
    return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
}
function result() { return createResult('general', Object.fromEntries(QUESTIONS.general.map(question => [question.id, 3]))); }

test('save, deduplicate, and delete assessment results', () => {
    const storage = memoryStore();
    const entry = result();
    saveResult(entry, storage);
    saveResult(entry, storage);
    assert.deepEqual(readResults(storage), [entry]);
    deleteResult(entry.id, storage);
    assert.deepEqual(readResults(storage), []);
});

test('corrupt results are not silently replaced', () => {
    const storage = memoryStore();
    storage.setItem(RESULT_KEY, '{broken');
    assert.throws(() => saveResult(result(), storage), /읽지 못했어요/);
    assert.equal(storage.getItem(RESULT_KEY), '{broken');
});

test('quota failure keeps previous results intact', () => {
    const storage = memoryStore();
    const entry = result();
    saveResult(entry, storage);
    storage.setItem = () => { throw new Error('quota'); };
    assert.throws(() => saveResult(result(), storage), /저장하지 못했어요/);
    assert.deepEqual(readResults(storage), [entry]);
});

test('full result storage rejects new entries without dropping old data', () => {
    const storage = memoryStore();
    for (let i = 0; i < 50; i++) saveResult(result(), storage);
    const before = storage.getItem(RESULT_KEY);
    assert.throws(() => saveResult(result(), storage), /최대 50개/);
    assert.equal(storage.getItem(RESULT_KEY), before);
});

test('backups merge without duplicating or overwriting saved results', () => {
    const storage = memoryStore();
    const entry = result();
    saveResult(entry, storage);
    const backup = exportResults(storage);
    importResults(backup, storage);
    assert.deepEqual(readResults(storage), [entry]);
    const empty = memoryStore();
    importResults(backup, empty);
    assert.deepEqual(readResults(empty), [entry]);
});

test('invalid imports leave saved data unchanged', () => {
    const storage = memoryStore();
    saveResult(result(), storage);
    const before = storage.getItem(RESULT_KEY);
    for (const input of ['broken', '{"app":"OTHER"}', JSON.stringify({app:'TYPE-M',version:1,results:[{id:'broken'}]})]) {
        assert.throws(() => importResults(input, storage));
        assert.equal(storage.getItem(RESULT_KEY), before);
    }
});

test('blocked localStorage property access produces an actionable result error', () => {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
    const entry = result();
    const backup = JSON.stringify({app:'TYPE-M',version:1,results:[entry]});
    Object.defineProperty(globalThis, 'localStorage', {configurable:true,get() {throw new Error('SecurityError');}});
    try {
        for (const action of [() => readResults(), () => saveResult(entry), () => deleteResult(entry.id), () => exportResults(), () => importResults(backup)]) {
            assert.throws(action, /저장된 결과를 읽지 못했어요/);
        }
    } finally {
        if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor);
        else delete globalThis.localStorage;
    }
});

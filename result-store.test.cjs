const { test } = require('node:test');
const assert = require('node:assert/strict');
const { QUESTIONS } = require('./assessment-data.js');
const { RESULT_KEY, createResult, saveResult, readResults, deleteResult } = require('./result-store.js');
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

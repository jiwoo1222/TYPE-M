const {test} = require('node:test');
const assert = require('node:assert/strict');
const {DRAFT_KEY, readDraft, saveDraft, clearDraft} = require('./draft-store.js');
function storage() { const map = new Map(); return {getItem:key=>map.get(key)??null,setItem:(key,value)=>map.set(key,value),removeItem:key=>map.delete(key)}; }
test('partial answers and question position survive a reload', () => {
    const store = storage();
    const draft = {version:1,track:'general',index:1,answers:{web:5}};
    saveDraft(draft,store);
    assert.deepEqual(readDraft(store),draft);
    clearDraft(store);
    assert.equal(readDraft(store),null);
});
test('malformed drafts and invalid answer values are rejected without deleting them', () => {
    const store = storage();
    store.setItem(DRAFT_KEY,'{broken');
    assert.throws(()=>readDraft(store));
    assert.equal(store.getItem(DRAFT_KEY),'{broken');
    assert.throws(()=>saveDraft({track:'general',index:99,answers:{}},store));
    assert.throws(()=>saveDraft({track:'general',index:0,answers:{web:6}},store));
});

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { TRACKS } = require('./assessment-data.js');

test('each track has unique fields and actionable next steps', () => {
    for (const track of Object.values(TRACKS)) {
        assert.equal(new Set(track.fields.map(field => field.id)).size, track.fields.length);
        assert.ok(track.fields.length >= 5);
        assert.ok(track.fields.every(field => field.description && field.next));
    }
});

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { TRACKS, QUESTIONS } = require('./assessment-data.js');

test('each track has unique fields and actionable next steps', () => {
    for (const track of Object.values(TRACKS)) {
        assert.equal(new Set(track.fields.map(field => field.id)).size, track.fields.length);
        assert.ok(track.fields.length >= 5);
        assert.ok(track.fields.every(field => field.description && field.next));
    }
});

test('general questions cover each field equally without duplicate IDs', () => {
    const questions = QUESTIONS.general;
    assert.equal(new Set(questions.map(question => question.id)).size, questions.length);
    for (const field of TRACKS.general.fields) {
        assert.equal(questions.filter(question => question.field === field.id).length, 2);
    }
});

test('skills questions reference known fields and cover them equally', () => {
    const questions = QUESTIONS.skills;
    const fields = TRACKS.skills.fields.map(field => field.id);
    assert.ok(questions.every(question => fields.includes(question.field)));
    assert.equal(new Set(questions.map(question => question.id)).size, questions.length);
    for (const field of fields) assert.equal(questions.filter(question => question.field === field).length, 2);
});

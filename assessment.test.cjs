const { test } = require('node:test');
const assert = require('node:assert/strict');
const { TRACKS, QUESTIONS } = require('./assessment-data.js');
const { scoreAssessment } = require('./assessment.js');

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

test('interest scores use equal per-field weighting and stay within 0–100', () => {
    for (const track of Object.keys(TRACKS)) {
        const answers = Object.fromEntries(QUESTIONS[track].map(question => [question.id, question.field === TRACKS[track].fields[0].id ? 5 : 1]));
        const before = structuredClone(answers);
        const result = scoreAssessment(track, answers);
        assert.equal(result[0].id, TRACKS[track].fields[0].id);
        assert.equal(result[0].score, 100);
        assert.ok(result.slice(1).every(field => field.score === 0));
        assert.deepEqual(answers, before);
    }
});

test('scoring rejects incomplete, fractional, and out-of-range answers', () => {
    assert.throws(() => scoreAssessment('unknown', {}));
    for (const invalid of [undefined, 0, 6, 1.5, '5']) {
        const answers = Object.fromEntries(QUESTIONS.general.map(question => [question.id, 3]));
        answers[QUESTIONS.general[0].id] = invalid;
        assert.throws(() => scoreAssessment('general', answers), /응답/);
    }
});

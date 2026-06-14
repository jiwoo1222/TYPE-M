const typeMSource = typeof module === 'object' ? require('./assessment-data.js') : globalThis.TypeM;

function scoreAssessment(trackId, answers) {
    const track = typeMSource.TRACKS[trackId];
    const questions = typeMSource.QUESTIONS[trackId];
    if (!track || !questions || !answers || typeof answers !== 'object') throw new Error('검사 종류와 응답을 확인해주세요.');
    const totals = Object.fromEntries(track.fields.map(field => [field.id, { sum: 0, count: 0 }]));
    for (const question of questions) {
        const value = answers[question.id];
        if (!Number.isInteger(value) || value < 1 || value > 5) throw new Error('모든 문항에 1~5점으로 응답해주세요.');
        totals[question.field].sum += value;
        totals[question.field].count++;
    }
    return track.fields.map(field => {
        const { sum, count } = totals[field.id];
        return { ...field, score: Math.round((sum - count) / (count * 4) * 100) };
    }).sort((a, b) => b.score - a.score);
}

if (typeof module === 'object') module.exports = { scoreAssessment };
else Object.assign(globalThis.TypeM, { scoreAssessment });

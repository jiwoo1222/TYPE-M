const typeMDraftData = typeof module === 'object' ? require('./assessment-data.js') : globalThis.TypeM;
const DRAFT_KEY = 'type-m:draft:v1';

function validateDraft(value) {
    const questions = typeMDraftData.QUESTIONS[value?.track];
    if (!questions || value.version !== 1 || !Number.isInteger(value.index) || value.index < 0 || value.index >= questions.length || !value.answers || typeof value.answers !== 'object') throw new Error('이어 할 수 없는 검사 데이터입니다.');
    const answers = {};
    for (const question of questions) {
        const answer = value.answers[question.id];
        if (answer === undefined) continue;
        if (!Number.isInteger(answer) || answer < 1 || answer > 5) throw new Error('저장된 응답 형식을 확인해주세요.');
        answers[question.id] = answer;
    }
    return { version: 1, track: value.track, index: value.index, answers };
}

function readDraft(storage = globalThis.localStorage) {
    try {
        const text = storage.getItem(DRAFT_KEY);
        return text ? validateDraft(JSON.parse(text)) : null;
    } catch { throw new Error('임시 저장된 검사를 읽지 못했어요. 새 검사를 시작할 수 있습니다.'); }
}

function saveDraft(value, storage = globalThis.localStorage) {
    const draft = validateDraft({ ...value, version: 1 });
    try { storage.setItem(DRAFT_KEY, JSON.stringify(draft)); }
    catch { throw new Error('검사를 임시 저장하지 못했어요. 이 창을 닫으면 응답이 사라질 수 있습니다.'); }
}

function clearDraft(storage = globalThis.localStorage) {
    try { storage.removeItem(DRAFT_KEY); }
    catch { throw new Error('임시 저장 데이터를 삭제하지 못했어요.'); }
}

const typeMDraft = { DRAFT_KEY, readDraft, saveDraft, clearDraft };
if (typeof module === 'object') module.exports = typeMDraft;
else Object.assign(globalThis.TypeM, typeMDraft);

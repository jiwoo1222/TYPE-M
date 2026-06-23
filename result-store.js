const typeMStoreData = typeof module === 'object' ? require('./assessment-data.js') : globalThis.TypeM;
const typeMStoreScoring = typeof module === 'object' ? require('./assessment.js') : globalThis.TypeM;
const RESULT_KEY = 'type-m:results:v1';
const RESULT_LIMIT = 50;

function validateResult(value) {
    if (!value || value.version !== 1 || typeof value.id !== 'string' || !value.id || value.id.length > 128 || !Number.isSafeInteger(value.createdAt) || value.createdAt <= 0 || value.createdAt > 8640000000000000) {
        throw new Error('결과 파일의 형식을 확인해주세요.');
    }
    typeMStoreScoring.scoreAssessment(value.track, value.answers);
    const answers = Object.fromEntries(typeMStoreData.QUESTIONS[value.track].map(question => [question.id, value.answers[question.id]]));
    return { version: 1, id: value.id, track: value.track, createdAt: value.createdAt, answers };
}

function createResult(track, answers) {
    return validateResult({ version: 1, id: globalThis.crypto.randomUUID(), track, answers, createdAt: Date.now() });
}

function readResults(storage = globalThis.localStorage) {
    try {
        const saved = JSON.parse(storage.getItem(RESULT_KEY) || '[]');
        if (!Array.isArray(saved)) throw new Error('invalid results');
        return saved.map(validateResult).sort((a, b) => b.createdAt - a.createdAt);
    } catch {
        throw new Error('저장된 결과를 읽지 못했어요. 브라우저 저장소 권한과 백업 파일을 확인해주세요.');
    }
}

function writeResults(results, storage) {
    try { storage.setItem(RESULT_KEY, JSON.stringify(results)); }
    catch { throw new Error('결과를 저장하지 못했어요. 저장 공간과 사이트 데이터 권한을 확인해주세요.'); }
}

function saveResult(result, storage = globalThis.localStorage) {
    const checked = validateResult(result);
    const previous = readResults(storage).filter(item => item.id !== checked.id);
    if (previous.length >= RESULT_LIMIT) throw new Error('결과는 최대 50개까지 저장할 수 있어요. 이전 결과를 내보내거나 삭제해주세요.');
    writeResults([checked, ...previous], storage);
}

function deleteResult(id, storage = globalThis.localStorage) {
    writeResults(readResults(storage).filter(result => result.id !== id), storage);
}

const typeMStore = { RESULT_KEY, RESULT_LIMIT, validateResult, createResult, readResults, saveResult, deleteResult };
if (typeof module === 'object') module.exports = typeMStore;
else Object.assign(globalThis.TypeM, typeMStore);

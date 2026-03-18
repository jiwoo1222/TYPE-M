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

function readResults(storage) {
    try {
        storage ??= globalThis.localStorage;
        const saved = JSON.parse(storage.getItem(RESULT_KEY) || '[]');
        if (!Array.isArray(saved)) throw new Error('invalid results');
        return saved.map(validateResult).sort((a, b) => b.createdAt - a.createdAt);
    } catch {
        throw new Error('저장된 결과를 읽지 못했어요. 브라우저 저장소 권한과 백업 파일을 확인해주세요.');
    }
}

function writeResults(results, storage) {
    try {
        storage ??= globalThis.localStorage;
        storage.setItem(RESULT_KEY, JSON.stringify(results));
    }
    catch { throw new Error('결과를 저장하지 못했어요. 저장 공간과 사이트 데이터 권한을 확인해주세요.'); }
}

function saveResult(result, storage) {
    const checked = validateResult(result);
    const previous = readResults(storage).filter(item => item.id !== checked.id);
    if (previous.length >= RESULT_LIMIT) throw new Error('결과는 최대 50개까지 저장할 수 있어요. 이전 결과를 내보내거나 삭제해주세요.');
    writeResults([checked, ...previous], storage);
}

function deleteResult(id, storage) {
    writeResults(readResults(storage).filter(result => result.id !== id), storage);
}

function exportResults(storage) {
    return JSON.stringify({ app: 'TYPE-M', version: 1, results: readResults(storage) }, null, 2);
}

function importResults(text, storage) {
    if (typeof text !== 'string' || text.length > 1000000) throw new Error('1MB 이하의 TYPE-M 결과 파일을 선택해주세요.');
    let file;
    try { file = JSON.parse(text); } catch { throw new Error('JSON 파일을 읽지 못했어요.'); }
    if (file?.app !== 'TYPE-M' || file.version !== 1 || !Array.isArray(file.results)) throw new Error('TYPE-M 결과 백업 파일이 아니에요.');
    const imported = file.results.map(validateResult);
    const merged = new Map(readResults(storage).map(result => [result.id, result]));
    for (const result of imported) {
        if (!merged.has(result.id)) merged.set(result.id, result);
    }
    if (merged.size > RESULT_LIMIT) throw new Error('합친 결과가 최대 50개를 넘어요. 이전 결과를 정리한 뒤 다시 시도해주세요.');
    writeResults([...merged.values()], storage);
    return imported.length;
}

const typeMStore = { RESULT_KEY, RESULT_LIMIT, validateResult, createResult, readResults, saveResult, deleteResult, exportResults, importResults };
if (typeof module === 'object') module.exports = typeMStore;
else Object.assign(globalThis.TypeM, typeMStore);

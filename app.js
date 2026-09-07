(() => {
    const { TRACKS, QUESTIONS, makeElement: el, makeButton: button } = TypeM;
    const landing = document.querySelector('#landing');
    const workspace = document.querySelector('#workspace');
    const body = document.querySelector('#workspace-body');
    const alert = document.querySelector('#workspace-alert');
    const status = document.querySelector('#workspace-status');
    let session = null;
    let historyFilter = 'all';

    function report(error) {
        alert.textContent = error.message || '처리하지 못했어요. 다시 시도해주세요.';
        alert.hidden = false;
    }
    async function attempt(action) { try { await action(); } catch (error) { report(error); } }
    function showPanel(title) {
        landing.hidden = true;
        workspace.hidden = false;
        alert.hidden = true;
        status.textContent = '';
        body.replaceChildren(el('h2', title));
        return body;
    }
    function home() {
        session = null;
        workspace.hidden = true;
        landing.hidden = false;
        refreshResume();
        document.querySelector('[data-start]').focus();
    }
    function start(track) {
        let existing;
        try { existing = TypeM.readDraft(); } catch { /* A new assessment can replace an unreadable draft. */ }
        if (existing && !window.confirm('진행 중인 검사가 있어요. 새 검사로 바꿀까요?')) return;
        session = { track, index: 0, answers: {} };
        renderQuestion();
    }
    function refreshResume() {
        const area = document.querySelector('#resume-area');
        area.replaceChildren();
        try {
            const draft = TypeM.readDraft();
            if (!draft) return;
            area.append(el('p', `${TRACKS[draft.track].title} · ${Object.keys(draft.answers).length}개 문항에 응답했어요.`));
            area.append(button('검사 이어 하기', () => {
                session = TypeM.readDraft();
                if (session) renderQuestion();
                else refreshResume();
            }), button('임시 검사 삭제', () => attempt(() => {
                if (!window.confirm('임시 저장한 응답을 삭제할까요?')) return;
                TypeM.clearDraft();
                refreshResume();
            })));
        } catch (error) { area.append(el('p', error.message)); }
    }
    function persistSession() {
        try {
            TypeM.saveDraft(session);
            status.textContent = '응답을 이 기기에 임시 저장했습니다.';
        } catch (error) { report(error); }
    }
    function renderQuestion() {
        const questions = QUESTIONS[session.track];
        const question = questions[session.index];
        const panel = showPanel(TRACKS[session.track].title);
        panel.append(el('p', `${session.index + 1} / ${questions.length} 문항`));
        const progress = el('progress');
        progress.max = questions.length;
        progress.value = Object.keys(session.answers).length;
        progress.setAttribute('aria-label', '응답한 문항 수');
        panel.append(progress);
        const form = el('form', '', 'workspace-panel');
        const fieldset = el('fieldset', '', 'question-options');
        fieldset.append(el('legend', question.text));
        const labels = ['전혀 그렇지 않다', '그렇지 않다', '보통이다', '그렇다', '매우 그렇다'];
        const next = el('button', session.index === questions.length - 1 ? '결과 보기' : '다음', 'login-btn');
        next.type = 'submit';
        next.disabled = session.answers[question.id] === undefined;
        labels.forEach((text, index) => {
            const label = el('label', '', 'question-option');
            const radio = el('input');
            radio.type = 'radio';
            radio.name = 'answer';
            radio.value = String(index + 1);
            radio.required = true;
            radio.checked = session.answers[question.id] === index + 1;
            radio.addEventListener('change', () => {
                session.answers[question.id] = index + 1;
                progress.value = Object.keys(session.answers).length;
                next.disabled = false;
                persistSession();
            });
            label.append(radio, el('span', `${index + 1}. ${text}`));
            fieldset.append(label);
        });
        const actions = el('div', '', 'workspace-actions');
        const previous = button('이전', () => { session.index--; renderQuestion(); });
        previous.disabled = session.index === 0;
        actions.append(previous, next, button('검사 나가기', () => {
            if (window.confirm('검사를 나갈까요? 임시 저장된 응답은 나중에 이어 할 수 있습니다.')) home();
        }));
        form.append(fieldset, actions);
        form.addEventListener('submit', event => {
            event.preventDefault();
            attempt(() => {
                if (session.answers[question.id] === undefined) return;
                if (session.index < questions.length - 1) { session.index++; renderQuestion(); }
                else {
                    const result = TypeM.createResult(session.track, session.answers);
                    renderResult(result);
                    TypeM.clearDraft();
                }
            });
        });
        panel.append(form);
        persistSession();
        TypeM.focusPanel(panel);
    }
    function renderResult(result) {
        session = null;
        const scores = TypeM.scoreAssessment(result.track, result.answers);
        const panel = showPanel(`${TRACKS[result.track].title} 결과`);
        panel.append(el('p', TypeM.summarizeAssessment(scores)));
        panel.append(el('p', '점수는 응답한 흥미의 정도를 0~100으로 환산한 값입니다. 적성 진단이나 합격 가능성을 뜻하지 않습니다.'));
        for (const field of scores) {
            const card = el('article', '', 'score-card');
            card.append(el('h3', field.name), el('p', field.description));
            const meter = el('meter');
            meter.min = 0;
            meter.max = 100;
            meter.value = field.score;
            meter.setAttribute('aria-label', `${field.name} 흥미 점수 ${field.score}점`);
            card.append(el('p', `흥미 점수 ${field.score} / 100`), meter, el('p', field.next, 'next-step'));
            panel.append(card);
        }
        const save = button('이 기기에 결과 저장', () => attempt(() => {
            TypeM.saveResult(result);
            status.textContent = '이 기기에 결과를 저장했습니다.';
            save.disabled = true;
            save.textContent = '저장 완료';
        }));
        const actions = el('div', '', 'workspace-actions');
        actions.append(save, button('다시 검사', () => start(result.track)), button('처음으로', home));
        actions.append(button('결과 인쇄', () => window.print()));
        actions.append(button('결과 요약 복사', () => attempt(async () => {
            const text = [
                `TYPE:M ${TRACKS[result.track].title}`,
                TypeM.summarizeAssessment(scores),
                ...scores.map(field => `${field.name}: ${field.score}점`),
                '점수는 자기 보고한 흥미 정도이며 적성 진단이 아닙니다.',
            ].join('\n');
            try {
                await navigator.clipboard.writeText(text);
                status.textContent = '결과 요약을 복사했습니다.';
            } catch {
                let copy = panel.querySelector('.copy-summary');
                if (!copy) {
                    copy = el('textarea', '', 'copy-summary');
                    copy.readOnly = true;
                    copy.setAttribute('aria-label', '직접 복사할 결과 요약');
                    panel.append(copy);
                }
                copy.value = text;
                copy.focus();
                copy.select();
                status.textContent = '자동 복사를 사용할 수 없어요. 선택된 결과를 직접 복사해주세요.';
            }
        })));
        panel.append(actions);
        TypeM.focusPanel(panel);
    }

    function renderHistory() {
        session = null;
        const panel = showPanel('저장된 결과');
        panel.append(el('p', '이 브라우저에 저장한 검사 결과입니다. 사이트 데이터를 지우면 결과도 삭제됩니다.'));
        panel.append(button('처음으로', home));
        panel.append(button('결과 백업 내보내기', () => attempt(() => {
            TypeM.downloadText(TypeM.exportResults(), 'type-m-results.json');
            status.textContent = '결과 백업 파일을 내려받았습니다.';
        })));
        const upload = el('input');
        upload.type = 'file';
        upload.accept = '.json,application/json';
        upload.hidden = true;
        upload.addEventListener('change', () => attempt(async () => {
            const file = upload.files[0];
            if (!file) return;
            try {
                if (file.size > 1000000) throw new Error('1MB 이하의 결과 파일을 선택해주세요.');
                TypeM.importResults(await file.text());
                renderHistory();
                status.textContent = '백업을 가져왔습니다. 기존 결과는 유지됩니다.';
            } finally { upload.value = ''; }
        }));
        panel.append(upload, button('결과 백업 가져오기', () => upload.click()));
        attempt(() => {
            const results = TypeM.readResults();
            if (!results.length) panel.append(el('p', '저장된 결과가 없어요. 검사를 마친 뒤 결과를 저장해보세요.'));
            const filters = el('div', '', 'workspace-actions');
            for (const [key, title] of [['all', '전체'], ['general', '일반 전공'], ['skills', '기능반']]) {
                const filter = button(`${title} (${results.filter(result => key === 'all' || result.track === key).length})`, () => {
                    historyFilter = key;
                    renderHistory();
                    body.querySelector(`[data-filter="${key}"]`).focus();
                });
                filter.dataset.filter = key;
                filter.setAttribute('aria-pressed', String(historyFilter === key));
                filters.append(filter);
            }
            panel.append(filters);
            const visible = results.filter(result => historyFilter === 'all' || result.track === historyFilter);
            if (results.length && !visible.length) panel.append(el('p', '이 검사 종류로 저장한 결과가 없어요.'));
            for (const result of visible) {
                const card = el('article', '', 'score-card');
                card.append(el('h3', TRACKS[result.track].title));
                const date = el('time', new Date(result.createdAt).toLocaleString('ko-KR'));
                date.dateTime = new Date(result.createdAt).toISOString();
                card.append(date, el('p', TypeM.summarizeAssessment(TypeM.scoreAssessment(result.track, result.answers))));
                const actions = el('div', '', 'workspace-actions');
                actions.append(button('결과 열기', () => renderResult(result)), button('삭제', () => attempt(() => {
                    if (!window.confirm('이 검사 결과를 삭제할까요?')) return;
                    TypeM.deleteResult(result.id);
                    renderHistory();
                    status.textContent = '결과를 삭제했습니다.';
                })));
                card.append(actions);
                panel.append(card);
            }
        });
        TypeM.focusPanel(panel);
    }

    document.querySelectorAll('[data-start]').forEach(control => {
        control.addEventListener('click', () => attempt(() => start(control.dataset.start)));
    });
    document.querySelector('[data-history]').addEventListener('click', renderHistory);
    refreshResume();
    const notice = document.querySelector('#service-notice');
    document.querySelectorAll('[data-notice]').forEach(control => {
        control.addEventListener('click', () => {
            document.querySelector('#notice-message').textContent = control.dataset.notice;
            notice.showModal();
        });
    });
})();

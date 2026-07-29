(() => {
    const { TRACKS, QUESTIONS, makeElement: el, makeButton: button } = TypeM;
    const landing = document.querySelector('#landing');
    const workspace = document.querySelector('#workspace');
    const body = document.querySelector('#workspace-body');
    const alert = document.querySelector('#workspace-alert');
    const status = document.querySelector('#workspace-status');
    let session = null;

    function report(error) {
        alert.textContent = error.message || '처리하지 못했어요. 다시 시도해주세요.';
        alert.hidden = false;
    }
    function attempt(action) { try { action(); } catch (error) { report(error); } }
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
        document.querySelector('[data-start]').focus();
    }
    function start(track) {
        session = { track, index: 0, answers: {} };
        renderQuestion();
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
            });
            label.append(radio, el('span', `${index + 1}. ${text}`));
            fieldset.append(label);
        });
        const actions = el('div', '', 'workspace-actions');
        const previous = button('이전', () => { session.index--; renderQuestion(); });
        previous.disabled = session.index === 0;
        actions.append(previous, next, button('검사 나가기', () => {
            if (window.confirm('검사를 종료할까요? 입력한 응답은 사라집니다.')) home();
        }));
        form.append(fieldset, actions);
        form.addEventListener('submit', event => {
            event.preventDefault();
            attempt(() => {
                if (session.answers[question.id] === undefined) return;
                if (session.index < questions.length - 1) { session.index++; renderQuestion(); }
                else renderResult(TypeM.createResult(session.track, session.answers));
            });
        });
        panel.append(form);
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
        panel.append(actions);
        TypeM.focusPanel(panel);
    }

    function renderHistory() {
        session = null;
        const panel = showPanel('저장된 결과');
        panel.append(el('p', '이 브라우저에 저장한 검사 결과입니다. 사이트 데이터를 지우면 결과도 삭제됩니다.'));
        panel.append(button('처음으로', home));
        attempt(() => {
            const results = TypeM.readResults();
            if (!results.length) panel.append(el('p', '저장된 결과가 없어요. 검사를 마친 뒤 결과를 저장해보세요.'));
            for (const result of results) {
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
    const notice = document.querySelector('#service-notice');
    document.querySelectorAll('[data-notice]').forEach(control => {
        control.addEventListener('click', () => {
            document.querySelector('#notice-message').textContent = control.dataset.notice;
            notice.showModal();
        });
    });
})();

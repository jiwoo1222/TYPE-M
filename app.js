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
        for (const field of scores) panel.append(el('p', `${field.name}: ${field.score}점`));
        panel.append(button('처음으로', home));
        TypeM.focusPanel(panel);
    }

    document.querySelectorAll('[data-start]').forEach(control => {
        control.addEventListener('click', () => attempt(() => start(control.dataset.start)));
    });
    const notice = document.querySelector('#service-notice');
    document.querySelectorAll('[data-notice]').forEach(control => {
        control.addEventListener('click', () => {
            document.querySelector('#notice-message').textContent = control.dataset.notice;
            notice.showModal();
        });
    });
})();

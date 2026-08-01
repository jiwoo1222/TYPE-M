function makeElement(tag, text = '', className = '') {
    const element = document.createElement(tag);
    element.textContent = text;
    if (className) element.className = className;
    return element;
}

function makeButton(text, action, className = 'login-btn') {
    const button = makeElement('button', text, className);
    button.type = 'button';
    button.addEventListener('click', action);
    return button;
}

function focusPanel(panel) {
    const heading = panel.querySelector('h2');
    if (!heading) return;
    heading.tabIndex = -1;
    heading.focus();
    panel.scrollIntoView({ block: 'start' });
}

function downloadText(text, filename) {
    const url = URL.createObjectURL(new Blob([text], { type: 'application/json;charset=utf-8' }));
    const link = makeElement('a');
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

Object.assign(globalThis.TypeM, { makeElement, makeButton, focusPanel, downloadText });

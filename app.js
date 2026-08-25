const notice = document.querySelector('#service-notice');
const message = document.querySelector('#notice-message');

document.querySelectorAll('[data-notice]').forEach((button) => {
    button.addEventListener('click', () => {
        message.textContent = button.dataset.notice;
        notice.showModal();
    });
});

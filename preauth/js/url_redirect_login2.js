window.addEventListener('load', login_alert);
function login_alert() {
    session_timeout_reason = 4;
    SessionTimeout();
}
window.addEventListener('load', PageInit);
if (parent.lang) { lang = parent.lang; }

function PageInit() {

    obj = document.getElementById("ikvm_keyboard");
    obj.textContent = lang.LANG_IKVM_HTML5_KEYBOARD_BUTTION;
    obj.addEventListener("click", function() {
        page_mapping('ikvm_vm', 'top');
    });

    obj = document.getElementById("ikvm_powercontrol");
    obj.textContent = lang.LANG_IKVM_HTML5_POWERCONTROL;
    obj.addEventListener("click", function() {
        page_mapping('ikvm_powercontrol', 'top');
    });

    document.getElementById("iKVM_VirtualKeyboard_Close_Img").addEventListener("click", OnClickVKClose);
}

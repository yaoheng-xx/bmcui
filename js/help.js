window.addEventListener('load', PageInit);
function PageInit() {
    document.getElementById("closeHelp").addEventListener("click", function() {
        top.frames.topmenu.closeHelp();
    });
}

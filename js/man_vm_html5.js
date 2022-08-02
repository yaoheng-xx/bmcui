// FIXME: Dirty global variable
"use strict";
let vm = null;
let vmdebug = false;
const MAX_DEVICE_NUMBER = 2;
const ONE_SEC_MS = 1000;
const MEDIA_TYPE = {
    FOLDER: 0x01,
    ISO: 0x03,
    IMG: 0x05,
    NONE: 0xFF
};
const MEDIASTATUS_TYPE = {
    Ready: 0x01,
    StartMount: 0x02,
    Mounted: 0x03,
    NotReady: 0x04,
    NONE: 0xFF
};
var lang = window.opener.lang;
var Ginfo = { LocalImageInfo: {} };

class Tabs {
    constructor(attribute, container) {
        this.attr = attribute;
        this.tabPanel = null;
        this.container = document.getElementById(container);
        this.tab = this.createTabButton(this.attr);
        this.tab.onclick = (evt) => this.showPanel(evt, this.tabPanel);
        this.tabLinks = document.getElementsByClassName("tab-links");
        this.tabContents = document.getElementsByClassName("tab-content");
    }

    createTabButton({ id: id, text: text }) {
        let node = document.createElement("BUTTON");
        node.id = id;
        node.textContent = text;
        node.classList.add("tab-links");
        this.container.appendChild(node);
        return node;
    }

    addPanel(node) {
        this.tabPanel = node;
        this.tabPanel.classList.add("tab-content");
        this.container.after(node);
    }

    showPanel(event, tabPanel) {
        for (let idx = 0; idx < MAX_DEVICE_NUMBER; ++idx) {
            this.tabContents[idx].style.display = "none";
            this.tabLinks[idx].className = this.tabLinks[idx].className.replace(" active", "");
        }

        tabPanel.style.display = "block";
        event.currentTarget.className += " active";
    }
}

class DevicePanel {
    constructor(index, framework) {
        this.idx = index;
        this.fwk = framework;
        this.mediaType = MEDIA_TYPE.NONE;

        this.container = document.createElement("DIV");
        this.container.id = `device${this.idx + 1}`;
        this.container.innerHTML = this.panelHTML(this.idx);
        this.fwk.addPanel(this.container);

        this.mediaTypeSelector = document.getElementById(`media-type${this.idx}`);
        this.mediaTypeSelector.disabled = true;
        this.mediaTypeSelector.options[0].textContent = lang.LANG_VM_HTML5_MEDIA_NONE;
        // this.mediaTypeSelector.options[1].textContent = lang.LANG_VM_HTML5_MEDIA_FOLDER;
        this.mediaTypeSelector.options[1].textContent = lang.LANG_VM_HTML5_MEDIA_ISO;
        this.mediaTypeSelector.options[2].textContent = lang.LANG_VM_HTML5_MEDIA_IMG;

        this.mediaSelectBtn = document.getElementById(`media_input_selector${this.idx}`);
        this.mediaSelectBtn.textContent = lang.LANG_VM_HTML5_SELECT;
        this.mediaInput = document.getElementById(`media_input${this.idx}`);

        this.mediaFileName = document.getElementById(`media-input-name${this.idx}`);
        this.mediaFileName.textContent = lang.LANG_VM_HTML5_NO_MEDIA_SELECT;

        this.mediaStatus = document.getElementById(`media-status${this.idx}`);
        this.mediaStatus.textContent = lang.LANG_VM_HTML5_DEVICE_NOT_READY;

        this.mediaPlugPullBtn = document.getElementById(`plugpull-btn${this.idx}`);
        this.mediaPlugPullBtn.textContent = lang.LANG_VM_HTML5_PLUG_IN;
    }

    panelHTML(idx) {
        return `
        <div class="device-content-wrapper">
            <div class="device-media-type-selector">
                <select id="media-type${idx}" class="media-button">
                    <option value="none"></option>
                    <option value="iso"></option>
                    <option value="img"></option>
                </select>
            </div>
            <div class="device-media-file-name">
                <h2 id="media-input-name${idx}" class="media-input-name"></h2>
            </div>
            <div class="device-media-select-button">
                <button type="button" id="media_input_selector${idx}" class="media-button" disabled="true"></button>
                <input id="media_input${idx}" class="media-file" type="file" accept=".iso,.img,.ima"/>
            </div>
            <div class="device-plugpull-button">
                <button type="button" id="plugpull-btn${idx}" class="media-button" disabled="true"></button>
            </div>
            <div class="device-status">
                <div id="media-status${idx}" class="media-status"></div>
            </div>
        </div>
        `;
    }

    updateMediaStatus(msg) {
        this.mediaStatus.textContent = msg;
    }

    mediaPlugBtnRender(disable) {
        return this.mediaPlugPullBtnRender("plug", lang.LANG_VM_HTML5_PLUG_IN, disable);
    }

    mediaPullBtnRender(disable) {
        return this.mediaPlugPullBtnRender("pull", lang.LANG_VM_HTML5_PULL_OUT, disable);
    }

    mediaPlugPullBtnRender(action, string, disabled) {
        if (disabled) {
            if (this.mediaPlugPullBtn.classList.contains("media-button-plugin"))
                this.mediaPlugPullBtn.classList.remove("media-button-plugin");

            if (this.mediaPlugPullBtn.classList.contains("media-button-pullout"))
                this.mediaPlugPullBtn.classList.remove("media-button-pullout");
        } else {
            switch (action) {
                case "plug":
                    if (this.mediaPlugPullBtn.classList.contains("media-button-pullout"))
                        this.mediaPlugPullBtn.classList.remove("media-button-pullout");
                    this.mediaPlugPullBtn.classList.add("media-button-plugin");
                    break;
                case "pull":
                    if (this.mediaPlugPullBtn.classList.contains("media-button-plugin"))
                        this.mediaPlugPullBtn.classList.remove("media-button-plugin");
                    this.mediaPlugPullBtn.classList.add("media-button-pullout");
                    break;
                default:
                    console.log("Unknown button action");
                    break;
            }
        }

        this.mediaPlugPullBtn.disabled = disabled;
        this.mediaPlugPullBtn.textContent = string;
    }

    mediaTypeSelected() {
        if (typeof this.mediaInput.webkitdirectory !== "undefined")
            this.mediaInput.webkitdirectory = false;

        switch (this.mediaTypeSelector.value) {
            case "none":
                this.mediaType = MEDIA_TYPE.NONE;
                this.mediaSelectBtn.disabled = true;
                this.mediaPlugBtnRender(true);
                this.mediaFileName.textContent = lang.LANG_VM_HTML5_NO_MEDIA_SELECT;
                break;
            case "iso":
                this.mediaType = MEDIA_TYPE.ISO;
                this.mediaSelectBtn.disabled = false;
                break;
            case "img":
                this.mediaType = MEDIA_TYPE.IMG;
                this.mediaSelectBtn.disabled = false;
                break;
            // case "folder":
            //     // IE doesn't have webkitdirectory
            //     // Edge and Safari doesn't support webkitRelativePath
            //     if (this.mediaInput.webkitdirectory == "undefined" || isEdge() || isSafari()) {
            //         this.mediaTypeSelector.selectedIndex = this.lastSelect;
            //         this.updateMediaStatus("Your browser doesn't support plug in folder");
            //     } else {
            //         this.mediaInput.webkitdirectory = true;
            //         this.mediaSelectBtn.disabled = false;
            //         this.mediaPlugBtnRender(true);
            //     }
            //     break;
            default:
                console.log("Unknown media type.");
                break;
        }
    }

    updateFileName(evt) {
        if (evt.target.files.length == 0) {
            this.mediaFileName.textContent = lang.LANG_VM_HTML5_NO_MEDIA_SELECT;
            return 1;
        }

        let uploadFile;
        let fileName;
        // TODO: Fix file name width and reserve file extention
        switch (this.mediaTypeSelector.value) {
            case "iso":
                uploadFile = evt.target.files[0];
                this.isISOfile(uploadFile).then((result) => {
                    if (result != true || this.getFileExtension(uploadFile.name).toLowerCase() != "iso") {
                        alert("Please select an ISO file.");
                        this.mediaFileName.textContent = lang.LANG_VM_HTML5_NO_MEDIA_SELECT;
                        this.mediaPlugBtnRender(true);
                        return 1;
                    }
                });

                fileName = uploadFile.name;
                break;
            case "img":
                uploadFile = evt.target.files[0];
                let extension = this.getFileExtension(uploadFile.name).toLowerCase();

                if (extension != "img" && extension != "ima") {
                    alert("Please select an IMG/IMA file.");
                    this.mediaFileName.textContent = lang.LANG_VM_HTML5_NO_MEDIA_SELECT;
                    this.mediaPlugBtnRender(true);
                    return 1;
                }

                fileName = uploadFile.name;
                break;
            // case "folder":
            //     uploadFile = evt.target.files;
            //     fileName = lang.LANG_VM_HTML5_SELECT_FOLDER.replace("{number}", uploadFile.length);
            //     break;
            default:
                alert("Unknown media type");
                this.mediaFileName.textContent = lang.LANG_VM_HTML5_NO_MEDIA_SELECT;
                return 1;
        }

        this.mediaFileName.textContent = fileName;
        return 0;
    }

    getFileExtension(filename) {
        return filename.split('.').pop();
    }

    async isISOfile(file) {
        const ISOSignature = "CD001";
        const ISOSignatureOffset = 32769;
        let blob = file.slice(ISOSignatureOffset, ISOSignatureOffset + ISOSignature.length);

        try {
            let buff = await this.asyncReadFileAsArrayBuffer(blob);
            let uint8 = new Uint8Array(buff);
            let Signature = uint8.reduce((acc, curr) => acc + String.fromCharCode(curr), "");
            return Signature == ISOSignature;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    asyncReadFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            let reader = new FileReader();

            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        })
    }
}


class DeviceControl {
    constructor(view) {
        this.view = view;
        this.idx = this.view.idx;
        this.server;
        this.requestTimeOut = false;
        /*
           true: This devices is using by ourself.
           false: We are not using this device.
        */
        this.valid = true;
        this.machineState = MEDIASTATUS_TYPE.NONE;
        this.selfUse = false;
        this.asyncOperationFlag = false;
        this.lastSelect = 0; // last selected item

        this.view.mediaTypeSelector.onchange = () => this.view.mediaTypeSelected();
        this.view.mediaSelectBtn.onclick = () => this.view.mediaInput.click();
        this.view.mediaInput.onchange = (evt) => {
            if (this.view.updateFileName(evt)) {
                this.view.mediaPlugBtnRender(true);
            } else {
                this.view.mediaPlugBtnRender(false);
            }
        };

        this.deviceAction = {
            [lang.LANG_VM_HTML5_PLUG_IN]: this.plugInMedia.bind(this),
            [lang.LANG_VM_HTML5_PULL_OUT]: this.pullOutMedia.bind(this)
        };
        this._eventHandlers = {
            'updateLD': function () { alert("No onunmount callback function!"); }
        };

        this.view.mediaPlugPullBtn.onclick = (evt) => this.deviceAction[evt.target.innerText]();
    }

    on = function (evt, handler) {
        this._eventHandlers[evt] = handler;
    }

    available(bool, msg) {
        if (bool) {
            if (!this.valid) {
                this.valid = true;
                this.view.mediaTypeSelector.disabled = false;
            }
        } else {
            if (this.valid) {
                this.valid = false;
                this.view.mediaTypeSelector.disabled = true;
                this.view.mediaTypeSelector.value = "none";
                this.view.mediaSelectBtn.disabled = true;
                this.view.mediaInput.value = "";
                this.view.mediaPlugBtnRender(true);
                this.view.mediaFileName.textContent = lang.LANG_VM_HTML5_NO_MEDIA_SELECT;
            }
        }

        this.view.updateMediaStatus(msg);
    }

    plugInMedia() {
        this.selfUse = true;
        let file = this.view.mediaInput.files[0];
        var vid = this.idx + 1;
        var host = location.host;
        var WebSocketEndPoint =
            Ginfo.LocalImageInfo[vid].Oem.OpenBMC.WebSocketEndpoint;
        var token = getCSRFToken();
        // var file = document.getElementById("virtual_file_" + vid).files[0];
        // Allowing file type
        var allowedExtensions = /(\.ima|\.iso|\.img)$/i;
        if (file && allowedExtensions.exec(file.name)) {
            var url = "wss://" + host + WebSocketEndPoint;
            this.server = new NBDServer(url, file, vid, token);
        } else {
            this.view.mediaFileName.textContent = lang.LANG_VM_HTML5_NO_MEDIA_SELECT;
            alert(lang.LANG_VM_WEBISO_SELECT_IMAGE_ERR);
            return;
        }
        this.view.updateMediaStatus(lang.LANG_VM_HTML5_PLUGING);
        this.view.mediaPlugPullBtnRender(null, lang.LANG_VM_HTML5_PLUG_PULL_PROCESS, true);
        this.view.mediaTypeSelector.disabled = true;
        this.view.mediaSelectBtn.disabled = true;
        this.server.on('ready', () => this.onReady());
        this.server.on('mount', () => this.onPlugIn());
        this.server.on('unmount', () => this.onPullout());
        this.server.on('error', (msg) => this.onError(msg));
        this.server.on('process', (msg) => this.onProcess(msg));
        this.server.start();
        this.machineState = MEDIASTATUS_TYPE.StartMount;
    }

    pullOutMedia() {
        this.selfUse = false;
        if (this.server) {
            this.server.stop();
            this.server = null;
        }
        this.view.updateMediaStatus(lang.LANG_VM_HTML5_PULLING);
        this.view.mediaPlugPullBtnRender(null, lang.LANG_VM_HTML5_PLUG_PULL_PROCESS, true);
    }

    onReady() {
        this.machineState = MEDIASTATUS_TYPE.Ready;
        this.valid = true;
        this.selfUse = false;
        this.view.mediaTypeSelector.disabled = false;
        this.view.updateMediaStatus(lang.LANG_VM_HTML5_DEVICE_READY);
        if (this.view.mediaTypeSelector.value != "none") {
            this.view.mediaSelectBtn.disabled = false;
            if (this.view.mediaFileName.textContent != "No Media Selected")
                this.view.mediaPlugBtnRender(false);
        }
    }

    onNotReady() {
        this.machineState = MEDIASTATUS_TYPE.NotReady;
        this.view.mediaTypeSelector.disabled = true;
        this.view.updateMediaStatus(lang.LANG_VM_HTML5_DEVICE_NOT_READY);
        this.view.mediaSelectBtn.disabled = true;
        this.view.mediaPlugBtnRender(true);
    }

    onPlugIn() {
        this.machineState = MEDIASTATUS_TYPE.Mounted;
        this.valid = false;
        this.view.updateMediaStatus(lang.LANG_VM_HTML5_PLUG_SUCCESS);
        this.view.container.classList.add("tab-content-active");

        setTimeout(() => {
            this.view.mediaPullBtnRender(false);
            this.onProcess(this.server.sendbytes);
        }, 1000);
    }

    onPullout() {
        this.valid = true;
        this.view.mediaType = MEDIA_TYPE.NONE;
        this.view.mediaTypeSelector.disabled = false;
        this.view.mediaSelectBtn.disabled = false;
        this.view.updateMediaStatus(lang.LANG_VM_HTML5_PULL_SUCCESS);
        this.view.container.classList.remove("tab-content-active");

        // setTimeout(() => {
        //     this.view.updateMediaStatus(lang.LANG_VM_HTML5_DEVICE_READY);
        //     this.view.mediaPlugBtnRender(false);
        // }, 1000);

        setTimeout(() => {
            this._eventHandlers.updateLD();
        }, 1000);
    }

    errorHandler() {
        if (this.machineState != MEDIASTATUS_TYPE.Ready) {
            this.onNotReady();
            this._eventHandlers.updateLD();
        }
    }

    onError(msg) {
        this.view.mediaSelectBtn.disabled = true;

        this.view.mediaPlugBtnRender(true);
        console.error(msg);
        alert(`Virtual media on-error: ${msg}`, {
            onClose: () => this.errorHandler()
        });
    }

    onProcess(msg) {
        if (this.machineState == MEDIASTATUS_TYPE.Mounted) {
            let status = `${msg} bytes (${this.readableBytes(msg)}) sent`;
            this.view.updateMediaStatus(status);
        }
        else if (this.machineState == MEDIASTATUS_TYPE.StartMount) {
            this.view.updateMediaStatus(lang.LANG_VM_HTML5_PLUG_PULL_PROCESS);
        }
    }

    readableBytes(bytes) {
        if (bytes == 0) return 'n/a';

        let units = ["Bytes", "KiB", "MiB", "GiB", "TiB"];
        let log1024 = (bytes) => Math.log(bytes) / Math.log(1024);
        let expo = parseInt(Math.floor(log1024(bytes)));

        if (expo == 0) return `${bytes} ${units[expo]}`;
        else return `${(bytes / Math.pow(1024, expo)).toFixed(2)} ${units[expo]}`;
    }

    terminate() {
        if (this.model != null) {
            if (this.valid == false)
                this.model.Unmount(this.idx,
                    decodeURI(this.uri.username),
                    decodeURI(this.uri.password),
                    this.uri.host);

            this.model.Stop();
            this.model = null;
        }

        if (this.ws != null) {
            this.ws.close();
            this.ws = null;
        }
    }
}

class MediaWatcher {
    constructor(controller, interval) {
        this.medias = controller;
        this.interval = interval * ONE_SEC_MS;
        this.queryTimeID = -1;
    }
    open() {
        console.log(`MediaWatcher open`);
        this.queryTimeID = setInterval(() => this.updateStatus(this.medias), this.interval);
        for (let dev = 0; dev < MAX_DEVICE_NUMBER; dev++) {
            this.medias[dev].on('updateLD', () => this.message());
        }
    }
    message() {
        this.updateStatus(this.medias);
    }
    close(evt) {
        let code = evt.code || "unknown";
        let reason = evt.reason || "unknown";
        console.log(`WebSocket on-close (code: ${code}, reason: ${reason})`);
        window.clearInterval(this.queryTimeID);
    }
    error(evt) {
        alert(`WebSocket on-error: ${evt}`);
    }

    anyMediaInUsed() {
        return this.medias.some(dev => dev.valid == false);
    }

    GetVMWebisoStatus(watchHandle, id, medias) {
        medias[id].asyncOperationFlag = true;
        var ajax_url = '/redfish/v1/Managers/bmc/VirtualMedia/LocalImage' + (id + 1);
        var ajax_req = new Ajax.Request(ajax_url, {
            method: 'GET',
            contentType: 'application/json',
            timeout: g_CGIRequestTimeout,
            // ontimeout: onCGIRequestTimeout,
            onSuccess: function (originalRequest) {
                watchHandle(originalRequest, id, medias);
            },
            onFailure: function () {
                console.log('get local image', (id + 1), 'failed, status is: ', medias[id].machineState);
                medias[id].asyncOperationFlag = false;
            }
        });
    }

    parseVMWebisoStatus(originalRequest, id, medias) {
        medias[id].asyncOperationFlag = false;
        if (originalRequest.readyState == 4 && originalRequest.status == 200) {
            var response = JSON.parse(originalRequest.responseText);
            if (response.hasOwnProperty("Inserted")) {
                if (response.Oem.OpenBMC.State == "ActiveState" &&
                    response.Inserted == true) {
                    if (medias[id].machineState == MEDIASTATUS_TYPE.StartMount) {
                        medias[id].onPlugIn();
                    }
                    else if (medias[id].requestTimeOut == true &&
                            medias[id].machineState != MEDIASTATUS_TYPE.Mounted) {
                        medias[id].onPlugIn();
                    }
                    else if (medias[id].machineState != MEDIASTATUS_TYPE.Mounted){
                        console.log("  unknow status ");
                    }
                    if (!medias[id].selfUse) {
                        // others user used
                        medias[id].available(false, lang.LANG_VM_HTML5_IN_USE);
                    }
                }
                else if (response.Oem.OpenBMC.State == "ReadyState" &&
                    response.Inserted == false) {
                    // mount faile or ready State
                    if (medias[id].machineState == MEDIASTATUS_TYPE.StartMount) {
                        console.log("get state is ready, but is start mount , need err deal");
                    }
                    else {
                        medias[id].onReady();
                    }
                }
            }
            medias[id].requestTimeOut = false;
            return;
        }
        // request timeout
        if (medias[id].machineState != MEDIASTATUS_TYPE.StartMount) {
            medias[id].requestTimeOut = true;
            medias[id].onNotReady();
        }
    }

    updateStatus(medias) {
        for (let id = 0; id < MAX_DEVICE_NUMBER; id++) {
            if (medias[id].asyncOperationFlag) continue;
            this.GetVMWebisoStatus(this.parseVMWebisoStatus, id, this.medias);
        }
    }
}

function GetMediaSlots() {
    var ajax_url = "/redfish/v1/Managers/bmc/VirtualMedia";
    var ajax_req = new Ajax.Request(ajax_url, {
        method: 'GET',
        contentType: 'application/json',
        timeout: g_CGIRequestTimeout,
        onSuccess: UpdateInputFields,
        onFailure: function () {
            alert(lang.CONF_RMEDIA_ERROR_MSG);
        }
    });
}

function UpdateInputFields(originalRequest) {
    if (originalRequest.readyState == 4 && originalRequest.status == 200) {
        var response = JSON.parse(originalRequest.responseText);
        if (response.hasOwnProperty("Members") && response.Members.length) {
            for (var i = 0; i < response.Members.length; i++) {
                RenderInputFields(response.Members[i]["@odata.id"]);
            }
        }
    }
}

function RenderInputFields(data) {
    if (data.indexOf("LocalImage") != -1) {
        var vid = data.split("LocalImage").pop();
        GetLocalImageInfo(data, vid);
    }
}

function GetLocalImageInfo(url, vid) {
    var ajax_req = new Ajax.Request(url, {
        method: 'GET',
        contentType: 'application/json',
        timeout: g_CGIRequestTimeout,
        onSuccess: function (org) {
            var response = JSON.parse(org.responseText);
            Ginfo.LocalImageInfo[vid] = response;
        },
        onFailure: function () {
            alert(lang.CONF_RMEDIA_ERROR_MSG);
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {

    const vmTitle = document.getElementById("vm-title");
    vmTitle.textContent = lang.LANG_VM_HTML5_CAPTION;

    const warnSlogan = document.getElementById("warning-slogan");
    warnSlogan.textContent = lang.LANG_VM_HTML5_WARN;

    let devicesControl = [];

    GetMediaSlots();

    for (let idx = 0; idx < MAX_DEVICE_NUMBER; idx++) {
        devicesControl[idx] = new DeviceControl(
            new DevicePanel(
                idx,
                new Tabs(
                    {
                        "id": `device-tab${idx + 1}`,
                        "text": lang[`LANG_VM_HTML5_DEVICE${idx + 1}`]
                    },
                    "device-tabs")));
    }

    let watcher = new MediaWatcher(devicesControl, 5);
    watcher.open();
    // TODO
    document.getElementById("device-tab1").click();

    window.onbeforeunload = () => {
        for (let i = 0; i < MAX_DEVICE_NUMBER; i++) {
            devicesControl[i].terminate();
        }
        watcher.close();
    };
});

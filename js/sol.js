document.writeln('<script src="/preauth/js/flot/jquery.min.js"></script>');
document.writeln('<link rel="stylesheet" href="/preauth/css/jquery-ui/jquery-ui.min.css">');
document.writeln('<script src="/preauth/js/flot/jquery-ui.min.js"></script>');

var ctx =  null;
var ws = null;
// var attemp = 1;
var charPad = 1;
var fontSize = "12";
var lineHeight = 0;
var cursorWidth =  0;
var cursorHeight = 0;
var cursorInt = 300;
var org_fontColor = "#C0C0C0";
var fontColor = "#C0C0C0";
var org_backgroundColor = "#000000";
var backgroundColor = "#000000";
var scrollColor = "#DE744C";
var scrollBarColor = "#808080";
var reverseColor = "#e6e6e6";
var scrollWidth = 15;
var org_outFont = "";
var outFont = "";
var charWidth = 0;
var map = [];
var promptPad = 3;
var cursor = null;
var flashCounter = 1;
var map_history = 1000;
var cols = 80;
var rows = 25;
var currentPos = 0;//how many lines need to be ignored because it will overflow the pag;
var bottomPos = 0;//record of bottom num of currentpo;
var mouseDownFlag = false;
var termstate = 0;
var state = {
         TOPLEVEL: 0,
        SEEN_ESC: 1,
        SEEN_CSI: 2,
        SEEN_CONTRL: 3,
};
var ESCFlag = false;
var CrtlKeyFlag = false;
var strBuffer = "";//for recursive
var esc_args = "";
var esc_query = "";
var mouseDownPos = 0;
var linuxKeyMap = [[8,[0x08]],[9,[0x09]],[13,[0x0d]],[27,[0x1b]],[33,[0x1b,0x5b,0x35,0x7e]],[34,[0x1b,0x5b,0x36,0x7e]],[35,[0x1b,0x5b,0x46]],[36,[0x1b,0x5b,0x48]],[37,[0x1b,0x5b,0x44]],[38,[0x1b,0x5b,0x41]],[39,[0x1b,0x5b,0x43]],[40,[0x1b,0x5b,0x42]],[45,[0x1b,0x5b,0x32,0x7e]],[46,[0x1b,0x5b,0x33,0x7e]],[112,[0x1b,0x5b,0x5b,0x41]],[113,[0x1b,0x5b,0x5b,0x42]],[114,[0x1b,0x5b,0x5b,0x43]],[115,[0x1b,0x5b,0x5b,0x44]],[116,[0x1b,0x5b,0x5b,0x45]],[117,[0x1b,0x5b,0x31,0x37,0x7e]],[118,[0x1b,0x5b,0x31,0x38,0x7e]],[119,[0x1b,0x5b,0x31,0x39,0x7e]],[120,[0x1b,0x5b,0x32,0x30,0x7e]],[121,[0x1b,0x5b,0x32,0x31,0x7e]],[122,[0x1b,0x5b,0x32,0x33,0x7e]],[123,[0x1b,0x5b,0x32,0x34,0x7e]]];

var AsciiKeyMap = [[50,0x00],[65,0x01],[66,0x02],[67,0x03],[68,0x04],[69,0x05],[70,0x06],[71,0x07],[72,0x08],[73,0x09],[74,0x0a],[75,0x0b],[76,0x0c],[77,0x0d],[78,0x0e],[79,0x0f],[80,0x10],[81,0x11],[82,0x12],[83,0x13],[84,0x14],[85,0x15],[86,0x16],[87,0x17],[88,0x18],[89,0x19],[90,0x1a],[219,0x1b],[220,0x1c],[221,0x1d],[54,0x1e],[189,0x1f],[191,0x7f]];
		//last two keycode need shift keypress

		// Constructor function for pixel objects
var pixel = function pixel(text, bkground, fontcol, outfont) {
    this.txt = text;
    this.bkgd = bkground;
    this.fontcol = fontcol;
    outfont = outfont;
}
var ANSIFlag = true;

window.addEventListener('load', PageInit);

function PageInit() {
    initialize();
    canvasObj = document.getElementById("console-screen");
    closeObj = document.getElementById("close");
    canvasObj.addEventListener("keydown", keyDownHandler);
    canvasObj.addEventListener("keypress", keyPressHandler);
    canvasObj.addEventListener("wheel", scrollHdl);
    canvasObj.addEventListener("mousemove", mouseMoveHdl);
    canvasObj.addEventListener("mouseout", mouseOutHdl);
    canvasObj.addEventListener("mouseup", mouseUpHdl);
    canvasObj.addEventListener("mousedown", mouseDownHdl);
    closeObj.addEventListener("click", close_sol_window);

}

function initialize() {
    // this.on("changed:currentPos", this.drawScrollBar, this);    
    for (var i = 0; i < map_history; i++) {
        map[i] = [];
    }

    $(window).on("resize", $.proxy(Fitfn, this));
    connect();
    afterRender();
    setBodyattr();
}

function setBodyattr(){
    document.body.className += " overflow";
}

function close_sol_window(){
    ws.close();
    window.close();
}

function afterRender() {
    ctx = $("#console-screen").get(0).getContext("2d");
    outFont = fontSize+"pt Consolas";
    org_outFont = outFont;
    lineHeight = Math.ceil(parseInt(fontSize, 10)*1.44);
    //set cursor height as one of four of linehieght
    cursorHeight = Math.ceil((parseInt(fontSize, 10)*1.44)/4);
    ctx.font = outFont;
    var metrics = ctx.measureText("W");
    // rounded to nearest int
    charWidth = Math.ceil(metrics.width)+charPad;
    cursorWidth = charWidth;
    cursor = new appCursor({x:promptPad,y:lineHeight,width:cursorWidth,height:cursorHeight});
    var that = this;

    setInterval(function () {
        flashCursor();
    },cursorInt);
    
    function appCursor (cursor){
        this.x = cursor.x;
        this.y = cursor.y;
        this.width = cursor.width;
        this.height = cursor.height;
    }

    //draw empty background
    drawmap(currentPos,rows);

    $("#termCols").on("keypress", function(e) {
        if(e.charCode == 13 && this.value > 0)
        {
            //console.log(this.value);
            setTermSize(0 , this.value);
        }
    });

    $("#termRows").on("keypress", function(e) {
        if(e.charCode == 13 && this.value > 0)
        {
            //console.log(this.value);
            setTermSize(1 , this.value);
        }
    });

    //var h = window.innerHeight-$("#container").height();
    //console.log(h);

    // resize to init cols and rows value 
    window.resizeTo(window.outerWidth - window.innerWidth + cols*charWidth + scrollWidth + promptPad , window.outerHeight - window.innerHeight + $("#container").height() + rows*lineHeight);
    window.focus();
}

function connect(){
    var that = this;
    var protocol = location.protocol;
    var bmc_ip = location.hostname;
    var ws_proto;	
    if(protocol.indexOf("https") != -1) {
        ws_proto = "wss://";
    }
    else {
        ws_proto = "ws://";
    }
    if (bmc_ip.indexOf("[") != -1 && /Trident\/|MSIE /.test(window.navigator.userAgent)) {
        //for IE  ,IPV6 should be in "Literal IPv6 addresses in UNC path names"
        //request should be in following format
        // ws://2001-db8-100-f101-211-22ff-fe33-4444.ipv6-literal.net:85/kvm

        bmc_ip= bmc_ip.split(":").join("-");        //replace : with -
        bmc_ip = bmc_ip.replace(/[\[\]]+/g, '');    //remove [ ]
        bmc_ip += ".ipv6-literal.net";              //append at the end
        bmc_ip += (location.port) ? (":"+location.port) : "";           // append : with port number
    }    
    ws = null;
    //console.log(localStorage.getItem("garc"));
    //console.log(sessionStorage.getItem("garc"));

    if(sessionStorage.getItem("garc") == null || sessionStorage.getItem("garc") == undefined)
    {
        alert("CSRF Token not found");
        return;
    }

    ws = new WebSocket(ws_proto + bmc_ip + "/sol" + "?" + "CSRFTOKEN=" + sessionStorage.getItem("garc"));
    ws.binaryType = "arraybuffer";

    ws.onopen = function()
    {
        // Web Socket is connected
        //that.attempt = 1;
        console.log("WebSocket Connected");
        // app.hideLoader();
    };
        
    ws.onmessage = function (evt) 
    {
        //For binary tranfer
        if (evt.data instanceof ArrayBuffer)
        {
            var txt = new Int8Array(evt.data);
            //int8arry didn't include splice function so copy one to array type
            var txt_tmp = Array.from(txt);
            //get the index of first newline
            var index=0;

            if(that.bottomPos > 0 && (that.cursor.y)/that.lineHeight == that.rows && txt_tmp.indexOf(27) === -1 && txt_tmp.indexOf(94) === -1) // exlucde esc and ctrl code 
            {
                var count=0;
                var ax;
                while ((ax = txt_tmp.indexOf(10)) !== -1 && count < that.rows) {
                    if(count==0 && ax != 0)
                    {
                        //we expect to skip first newline and start from printalbe text
                        index=ax+1;
                        var remain = txt.slice(0,ax);
                        for (var i = 0; i < remain.length; i++) {
                            that.drawVt100(String.fromCharCode(remain[i]));
                        }
                    }
                    txt_tmp.splice(ax, 1);
                    count++;
                }
                //console.log("newline:"+ count);

                if(that.map_history-count < that.bottomPos +(that.cursor.y)/that.lineHeight)
                {
                    that.map.splice(0,that.bottomPos+ (that.cursor.y)/that.lineHeight - that.map_history+count);
                    for (var i = 0; i < that.bottomPos+ (that.cursor.y)/that.lineHeight - that.map_history+count; i++) {
                        that.map.push([]);
                    }

                    that.bottomPos = that.map_history -(that.cursor.y)/that.lineHeight-count;
                }

                if(count != 0) //don't call drawmap while there is no newline
                {
                    that.bottomPos+=count;
                    that.currentPos = that.bottomPos;
                    that.drawmap(that.bottomPos, count);
                }
            }

            for (var i = index; i < txt.length; i++) {
                that.drawVt100(String.fromCharCode(txt[i]));
            }
        }
        /** This is used for text-only (valid UTF-8 encoding)
        var txt = evt.data;
        for(var i=0;i<txt.length;i++)
        {
            that.drawVt100(txt[i]);
        }
        **/
    };
        
    ws.onclose = function()
    {
        //var time = that.generateInterval(attempt);
        // app.hideLoader();
        setTimeout(function () {
            // We've tried to reconnect so increment the attempts by 1
            //that.attempt++;
            // Connection has closed so try to reconnect every 10 seconds.
            connect(); 
            // app.showLoader();
        }, 50000);

        // websocket is closed.
        //alert("Connection is closed..."); 
    };

    //this.ws = new WebSocket("wss://192.168.0.193/sol");
}

function Fitfn(){
    var hideline = updateSize();
    if(currentPos == 0)
    {
        drawmap(currentPos, hideline);
        //cuz drawmap function will end up with newline so draw last content if we have
        var y_index = rows - hideline;
        for(var j=0;j<map[y_index].length;j++)
        {
            if(typeof map[y_index][j] == 'object')
            {
                ctx.fillStyle = map[y_index][j].bkgd;
                ctx.fillRect(cursor.x,cursor.y-lineHeight,charWidth,lineHeight );

                ctx.font = map[y_index][j].outfont;
                ctx.fillStyle = map[y_index][j].fontcol;
                ctx.textBaseline='bottom';
                ctx.fillText(map[y_index][j].txt,cursor.x, cursor.y);
            }
            cursor.x += charWidth;
        }
    }else{
        drawmap(currentPos,0);
    }
}

function set_currentPos(value) {
    if(currentPos != value)
    {
        currentPos = value;
        this.trigger("changed:currentPos");
        drawmap(value, 0);
    }
}

function setTermSize(sel , val) {
    if(!sel) // if sel 0, set columns
    {
        window.resizeTo(window.outerWidth - window.innerWidth + val*charWidth + scrollWidth + promptPad , window.outerHeight);
    }
    else // if sel 1, set rows
    {
        window.resizeTo(window.outerWidth , window.outerHeight - window.innerHeight + $("#container").height() + val*lineHeight);
    }
    window.focus();
}

function updateSize() {
    var temp = currentPos;
    var all = (cursor.y)/lineHeight -1 + bottomPos;
    var h = window.innerHeight -$("#container").height();
    var w = window.innerWidth - scrollWidth - promptPad;
    rows = Math.floor(h/lineHeight);
    cols = Math.floor(w/charWidth);

    // update value of cols and rows
    $("#termCols").val(cols);
    $("#termRows").val(rows);

    //add currentPos because of resize
    if(all>rows)
    {
        currentPos = all - rows;
        bottomPos= bottomPos +currentPos - temp;
    }
    else
    {
        currentPos = 0;
        bottomPos= bottomPos +currentPos - temp;
    }
    return rows-temp-(cursor.y)/lineHeight+1;
}

function drawScrollBar() {
    //it will be called only after over full of page
    ctx.fillStyle = scrollBarColor;		
    ctx.fillRect(ctx.canvas.width-scrollWidth,0,scrollWidth,ctx.canvas.height);
    ctx.fillStyle = scrollColor;		
    var barHeightUnit = ctx.canvas.height/(rows + bottomPos);
    //All=limit+current
    ctx.fillRect(ctx.canvas.width-scrollWidth,barHeightUnit*currentPos,scrollWidth,barHeightUnit*(rows));
}

function mouseOutHdl(e) {
    mouseDownFlag=false;
}

function mouseUpHdl(e) {
    mouseDownFlag=false;
}

function mouseDownHdl(e) {
    var Yoffset = $("#console-screen").position().top;
    var YabsPos = e.pageY-Yoffset;
    mouseDownPos = e.pageY-Yoffset;	
    mouseDownFlag=true;
}

function mouseMoveHdl(e) {
    //console.log(e.pageX+ ", " + e.pageY);
    //console.log(this.$el.find("#console-screen").position().left+ ", " +this.$el.find("#console-screen").position().top);
    if(mouseDownFlag)
    {
        var Yoffset = $("#console-screen").position().top;
        var YabsPos = e.pageY-Yoffset;
        //console.log(XabsPos+ ", " + YabsPos);
        var movePos = YabsPos - mouseDownPos;//positive down
        
        var barHeightUnit = ctx.canvas.height/(rows + bottomPos);
        if(movePos < 0)
        {
            if(currentPos>0)
            {
                var PosInt = Math.floor(Math.abs(movePos)/barHeightUnit);
                if(PosInt>0)
                {
                    if(currentPos-PosInt>=0)
                    {
                        mouseDownPos = YabsPos;
                        set_currentPos(currentPos-PosInt);
                        //mouseDownPos = YabsPos;
                    }
                    else
                    {
                        mouseDownPos = YabsPos;
                        set_currentPos(0);
                        //mouseDownPos = 0;
                    }
                }
            }
        }
        else if(movePos > 0)
        {
            //if current = bottom, it reach down
            if(currentPos<bottomPos)
            {
                var PosInt = Math.floor(movePos/barHeightUnit);
                if(PosInt>0)
                {
                    if(currentPos+PosInt<=bottomPos)
                    {
                        mouseDownPos = YabsPos;
                        set_currentPos(currentPos+PosInt);
                        //mouseDownPos = YabsPos;
                    }
                    else
                    {
                        mouseDownPos = YabsPos;
                        set_currentPos(bottomPos);
                        //mouseDownPos = this.ctx.canvas.height;
                    }
                }
            }
        }
        else{}
    }
}

function gcd(a, b) {
    if ( ! b) {
        return a;
    }
    return gcd(b, a % b);
}

function scrollHdl(e) {
    e.stopPropagation();
    e.preventDefault();
    
    var Yoffset = e.deltaY;
    if(Yoffset < 0)
    {
        //Yoffset = Math.abs(Yoffset)/100;
        Yoffset = 1;
        if(currentPos>0)
        {
            if(currentPos-Yoffset>=0)
                set_currentPos(currentPos-Yoffset);
            else
                set_currentPos(0);
        }
    }
    else if(Yoffset > 0)
    {
        //Yoffset = Yoffset/100;
        Yoffset = 1;
        if(currentPos<bottomPos)
        {
            if(currentPos+Yoffset<=bottomPos)
                set_currentPos(currentPos+Yoffset);
            else
                set_currentPos(bottomPos);
        }
    }
    else
        console.log("Wheel event error");
}

function blotPrevChar() {
    ctx.fillStyle = org_backgroundColor;
    cursor.x-=charWidth;
    ctx.fillRect(cursor.x,cursor.y-lineHeight,charWidth,lineHeight);
}

function keyDownHandler(e) {
    e.stopPropagation();
    var that = this;	
    var currentKey = null;
    currentKey = e.keyCode;
    if(currentKey == 17)
    {}
    else if(currentKey == 16)
    {}
    else
    {
        if(e.ctrlKey && e.shiftKey)
        {
            var MapLen = AsciiKeyMap.length;
            for(var i = MapLen-2;i<MapLen;i++)
            {
                if(currentKey == AsciiKeyMap[i][0])
                {
                    e.preventDefault();
                    var encoder = String.fromCharCode(AsciiKeyMap[i][1]);
                    ws.send(encoder);
                    break;				
                }
            }
        }
        else if(e.ctrlKey)
        {
            for(var i=0;i<AsciiKeyMap.length-2;i++)
            {
                if(currentKey == AsciiKeyMap[i][0])
                {
                    e.preventDefault();
                    var encoder = String.fromCharCode(AsciiKeyMap[i][1]);
                    ws.send(encoder);
                    break;
                }
            }
        }
        else
        {
            for(var i=0;i<linuxKeyMap.length;i++)
            {
                if(currentKey == linuxKeyMap[i][0])
                {
                    e.preventDefault();
                    var encoder="";
                    for(var j = 0; j < linuxKeyMap[i][1].length; j++)
                    {
                        encoder += String.fromCharCode(linuxKeyMap[i][1][j]);
                    }
                    ws.send(encoder);
                    break;
                }
            }
        }
    }
}

function keyPressHandler(e) {
    e.stopPropagation();
    e.preventDefault();
    var that = this;    
    if(e.charCode == 13) 
    {
        //exclude enter
    }   
    else
    {  
        ws.send(String.fromCharCode(e.charCode));
    }   
}

function drawVt100(text) {
    if(ANSIFlag)
    {
        var patt = /[a-zA-Z]/;
        var pass_esc = /[0-9\[\;]/;
        if(patt.test(text))
        {
            strBuffer += text;
            var re = /\033\[(\d*)(;*\d*)(;*\d*)([A-Za-z]{0,1}).*/;
            codeFirst = strBuffer;
            var par_1 = codeFirst.replace(re, "$1");
            var par_2 = codeFirst.replace(re, "$2");
            var par_3 = codeFirst.replace(re, "$3");
            var par_4 = codeFirst.replace(re, "$4");
        
            if(par_2 != "")
                par_2 = par_2.slice(1);
            if(par_3 != "")
                par_3 = par_3.slice(1);
            switch (par_4) {
                case 'm':
                    SetTxtFormat(par_1);
                    SetTxtFormat(par_2);
                    SetTxtFormat(par_3);
                    break;
                case 'H':
                    if(par_1 == "")
                    {
                    }
                    else
                    {
                        par_1 = parseInt(par_1);
                        //console.log("H_par1:" + par_1);
                        if(par_1 == 0)
                        {
                            cursor.y = lineHeight;
                        }
                        else if(par_1 > rows)
                        {
                            cursor.y = lineHeight*rows;
                        }
                        else
                        {
                            cursor.y = lineHeight*(par_1);
                        }
                    }
                    if(par_2 == "")
                    {
                    }
                    else
                    {
                        par_2 = parseInt(par_2);
                        //console.log("H_par2:" + par_2);
                        if(par_2 == 0)
                        {
                            cursor.x= promptPad;
                        }
                        else if(par_2 > cols)
                        {
                            cursor.x=promptPad+cols*charWidth;
                        }
                        else
                        {
                            cursor.x=promptPad+(par_2-1)*charWidth;
                        }
                    }
                    if(par_1 == "" && par_2 == "")
                    {
                        cursor.y = lineHeight;
                        cursor.x= promptPad;
                    }
                    break;
                case 'K':
                    switch(par_1){
                        case '':
                        case '0':
                            ctx.fillStyle = org_backgroundColor;
                            ctx.fillRect(cursor.x,cursor.y-lineHeight,ctx.canvas.width-cursor.x-scrollWidth,lineHeight);
                            var len = map[bottomPos+ (cursor.y)/lineHeight -1 ].length;
                            map[bottomPos+ (cursor.y)/lineHeight -1 ].splice((cursor.x - promptPad)/charWidth,len);
                            break;
                        case '1':
                            ctx.fillStyle = org_backgroundColor;
                            ctx.fillRect(0,cursor.y-lineHeight,cursor.x,lineHeight);
                            for(var i=0;i<(cursor.x - promptPad)/charWidth;i++)
                            {
                                map[bottomPos+ (cursor.y)/lineHeight -1][i].txt = " ";
                            }
                            break;
                        case '2':
                            ctx.fillStyle = org_backgroundColor;
                            ctx.fillRect(0,cursor.y-lineHeight,ctx.canvas.width-scrollWidth,lineHeight);
                            var len = map[bottomPos+ (cursor.y)/lineHeight -1 ].length;
                            map[bottomPos+ (cursor.y)/lineHeight -1 ].splice(0,len);
                            break;
                    }
                    break;
                case 'J':
                    switch(par_1){
                        case '':
                        case '0':
                            ctx.fillStyle = org_backgroundColor;
                            ctx.fillRect(0,cursor.y-lineHeight,ctx.canvas.width-scrollWidth,ctx.canvas.height+lineHeight-cursor.y);
                            for(var i=bottomPos+ (cursor.y)/lineHeight -1;i<bottomPos+rows;i++)
                            {
                                if(i < map_history)
                                {
                                    map[i] = [];
                                }else{
                                    break;
                                }
                            }
                            break;
                        case '1':
                            ctx.fillStyle = org_backgroundColor;
                            ctx.fillRect(0,0,ctx.canvas.width-scrollWidth,cursor.y);
                            for(var i=bottomPos;i<bottomPos+(cursor.y)/lineHeight -1;i++)
                            {
                                if(i < map_history)
                                {
                                    map[i] = [];
                                }else{
                                    break;
                                }
                            }
                            break;
                        case '2':
                            ctx.fillStyle = org_backgroundColor;
                            ctx.fillRect(0,0,ctx.canvas.width-scrollWidth, ctx.canvas.height);
                            for(var i=bottomPos;i<bottomPos+rows;i++)
                            {
                                if(i < map_history)
                                {
                                    map[i] = [];
                                }else{
                                    break;
                                }
                            }
                            break;
                    }
                    break;
                default:
                    if(par_4.length>1)
                    {
                        console.log(par_4.charCodeAt(0));
                        console.log(par_4.charCodeAt(1));
                        console.log("This is not ANSI code");
                        for(var i=0;i<strBuffer.length;i++)
                        {
                            drawTxt(strBuffer[i]);
                        }
                    }
                    else if(par_4 !== '')
                    {
                        console.log("ANSI code undefine:"+par_4);
                    }
                    else
                    {
                        console.log("String missed");
                        for(var i=0;i<strBuffer.length;i++)
                        {
                            drawTxt(strBuffer[i]);
                        }
                    }
                    ANSIFlag = false;
                    return;
            }
            ANSIFlag = false;
        }
        else if(pass_esc.test(text))
        {
            strBuffer += text;
        }
        else
        {
            console.log("No ANSI cmd found");	
            for(var i=0;i<strBuffer.length;i++)
            {
                drawTxt(strBuffer[i]);
            }
            ANSIFlag = false;
            drawVt100(text);
        }
    }
    else if(CrtlKeyFlag)
    {
        var patt = /[a-zA-Z]/;
        if(patt.test(text))
        {
            switch(text){
                case 'H':
                    //map[bottomPos+ (cursor.y)/lineHeight -1 ][(cursor.x - promptPad)/charWidth].txt = " ";
                    cursor.x-=charWidth;
                    break;
                default:
                    CrtlKeyFlag = false;
                    console.log("crtl undefine");
            }
        }
        else
        {
            console.log("No Crtl key found");
            drawTxt(strBuffer);
            CrtlKeyFlag = false;
            drawVt100(text);
        }
    }
    else
    {
        switch(text){
            case '\n':
                cursor.x=promptPad;
                cursor.y+=lineHeight;
                if((cursor.y)/lineHeight > rows) //Not include equal cuz y incresased already
                {
                    if(map_history-1 < bottomPos +(cursor.y)/lineHeight)
                    {
                        //(bottomPos+(cursor.y)/lineHeight-history+1) might always be 1
                        map.splice(0,bottomPos+ (cursor.y)/lineHeight - map_history+1);
                        for (var i = 0; i < bottomPos+ (cursor.y)/lineHeight - map_history+1; i++) {
                            map.push([]);
                        }

                        bottomPos = map_history -(cursor.y)/lineHeight-1;
                    }
                    bottomPos++;
                    currentPos = bottomPos;
                    drawmap(bottomPos, 1);
                }
                break;
            case '\r':
                break;
            case '\033':
                ANSIFlag = true;
                strBuffer = '\033';
                break;
            case '\b':
                //map[bottomPos+ (cursor.y)/lineHeight -1 ][(cursor.x - promptPad)/charWidth].txt = " ";
                cursor.x-=charWidth;
                break;
            case '^':
                CrtlKeyFlag = true;
                strBuffer = '^';
                break;
            case '\007':
                break;
            default:
                drawTxt(text);
        }
    }
}

function drawTxt(text) {
    if(currentPos !== bottomPos)//if there are not equal, it must be shifted by scroll
    {
        //console.log("pos:" + currentPos + ":" + bottomPos);
        set_currentPos(bottomPos);	
    }

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(cursor.x,cursor.y-lineHeight,charWidth,lineHeight );
        
    if(fontColor === backgroundColor)
    {
        fontColor = 'Gray';
    }
    ctx.font = outFont;
    ctx.fillStyle = fontColor;
    ctx.textBaseline='bottom';
    if(cursor.x >= promptPad+cols*charWidth){drawVt100('\n');} //if col overflow then give it newline
    ctx.fillText(text,cursor.x, cursor.y);
    map[bottomPos+ (cursor.y)/lineHeight -1 ][(cursor.x - promptPad)/charWidth] = new pixel(text, backgroundColor, fontColor, outFont);
    cursor.x += charWidth;
}
		
function SetTxtFormat(par) {
    switch(par){
        case '':
            break;
        case '0':
        case '00':
            fontColor = org_fontColor;
            backgroundColor = org_backgroundColor;
            outFont = org_outFont;
            break;
        case '1':
        case '01':
            if(!outFont.includes("bold"))
                outFont = "bold "+outFont;
            break;
        case '2':
        case '02':
            //console.log("this is dim attr");
            break;
        case '7':
        case '07':
            //FIXME reverse color. Set font color as black.
            fontColor = org_backgroundColor;
            backgroundColor=reverseColor;
            break;
        case '30':
            //fontColor = 'Black';
            fontColor = "#262626";
            break;
        case '31':
            fontColor = 'Red';
            break;
        case '32':
            fontColor = 'Green';
            break;
        case '33':
            fontColor = 'Yellow';
            break;
        case '34':
            fontColor = 'Blue';
            break;
        case '35':
            fontColor = 'Magenta';
            break;
        case '36':
            fontColor = 'Cyan';
            break;
        case '37':
            fontColor = 'White';
            break;
        case '40':
            //backgroundColor = 'Black';
            backgroundColor = "#262626";
            break;
        case '41':
            backgroundColor = 'Red';
            break;
        case '42':
            backgroundColor = 'Green';
            break;
        case '43':
            backgroundColor = 'Yellow';
            break;
        case '44':
            backgroundColor = 'Blue';
            break;
        case '45':
            backgroundColor = 'Magenta';
            break;
        case '46':
            backgroundColor = 'Cyan';
            break;
        case '47':
            backgroundColor = 'White';
            break;
        default:
            console.log("Set text attr undefine:"+par);
    }
}

function rgbToHex(r, g, b) {
	if (r > 255 || g > 255 || b > 255)
		console.log("Invalid color component");
	return ((r << 16) | (g << 8) | b).toString(16);
}

function flashCursor() {
    var flag = flashCounter % 3;
    var that = this;

    //Get original background color of pixel (1,1)
    var p = ctx.getImageData(cursor.x,cursor.y-lineHeight, 1, 1).data; 
    var cursorbkgdColor = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);

    // add 1 px for font and cursor overlapping
    var x= cursor.x;
    var y= cursor.y-cursor.height+1;
    var w= cursor.width;
    var h= cursor.height-1;

    switch (flag)
    {
        case 1 :
        case 2 :
        {
            ctx.fillStyle = org_fontColor;
            ctx.fillRect(x,y,w,h);
            that.flashCounter++;
            //Revert the original background color every 3 times cursor interval
            setTimeout(function(){ctx.fillStyle = cursorbkgdColor;ctx.fillRect(x,y,w,h);}, cursorInt *(3 - flag));
            break;
        }
        default:
        {
            that.flashCounter= 1;
        }
    }
}

function cursor(cursor) {
    this.x = cursor.x;
    this.y = cursor.y;
    this.width = cursor.width;
    this.height = cursor.height;
}

function drawmap(pos, offset) {
    ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight-$("#container").height();

    ctx.fillStyle = org_backgroundColor;
    ctx.fillRect(0,0,ctx.canvas.width-scrollWidth, ctx.canvas.height);

    cursor.x = promptPad;
    cursor.y = lineHeight;
    
    for (var i=pos;i<pos+rows-offset;i++)
    {
        //if(i >= history){console.log("overflow index: "+ i);}
        for(var j=0;j<map[i].length;j++)
        {
            if(typeof map[i][j] == 'object')
            {
                ctx.fillStyle = map[i][j].bkgd;
                ctx.fillRect(cursor.x,cursor.y-lineHeight,charWidth,lineHeight );

                ctx.font = map[i][j].outfont;
                ctx.fillStyle = map[i][j].fontcol;
                ctx.textBaseline='bottom';
                ctx.fillText(map[i][j].txt,cursor.x, cursor.y);
            }
            cursor.x += charWidth;
        }
        cursor.x=promptPad;
        cursor.y+=lineHeight;
    }
    if(0 == bottomPos)
    {
        //if not full over page
        ctx.fillStyle = scrollColor;		
        ctx.fillRect(ctx.canvas.width-scrollWidth,0,scrollWidth,ctx.canvas.height);
    }
    else
    {
        drawScrollBar();
    }
}

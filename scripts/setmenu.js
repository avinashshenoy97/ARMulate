var mb = new nw.Menu({type:"menubar"});
if(process.platform == "darwin")
	mb.createMacBuiltin("armulate");

var smb = new nw.Menu({type:"menubar"});
var sb = new nw.MenuItem({label:"Decimal"});
sb.click = decdriver;
smb.append(sb);
var sb = new nw.MenuItem({label:"Binary"});
sb.click = bindriver;
smb.append(sb);
var sb = new nw.MenuItem({label:"Hexadecimal"});
sb.click = hexdriver;
smb.append(sb);

mb.append(new nw.MenuItem({label:"Register", submenu: smb}));

var smb = new nw.Menu({type:"menubar"});
var sb = new nw.MenuItem({label:"1 Bit View"});
sb.click = function() {instateMemory(1);}
smb.append(sb);
var sb = new nw.MenuItem({label:"8 Bit View"});
sb.click = function() {instateMemory(8);}
smb.append(sb);

mb.append(new nw.MenuItem({label:"Memory", submenu: smb}));

nw.Window.get().menu = mb;
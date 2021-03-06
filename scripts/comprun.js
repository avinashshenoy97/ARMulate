var datasec = new Object();     //labels in data section
var cont = [];
var labs = new Object();        //labels in code(branch targets)
var interpreter = new Object();

//setup the interpreter object
function setup_interpreter() {
    interpreter = window.interpreter;
    cont = window.cont;
    datasec = window.datasec
    labs = window.labs

    interpreter["code"] = cont;     //all the code
    interpreter['lines'] = cont.length;         //lines of code
    interpreter["data"] = datasec;  //data section
    interpreter["labels"] = labs;   //branch targets
    interpreter["cline"] = 0;       //current line
    interpreter["regvals"] = window.decreg;    //register values
    interpreter["flags"] = window.flags;        //CPSR
    interpreter["instate"] = window.instate;    //update UI with register values
    interpreter["memwrite"] = window.writeToMem;        //write to memory
    interpreter["bindriver"] = window.bindriver;      //convert all registers to binary values
    interpreter["hexdriver"] = window.hexdriver;      //convert all registers to hexadecimal values
    interpreter["copier"] = window.copy;                //copy decimalregisters to registers
    //interpreter["deci"] = window.deci;                  //flags to indicate register content state
    //interpreter["bin"] = window.bin;
    //interpreter["hexa"] = window.hexa;
    interpreter["compiled"] = true;
    
    interpreter['regvals'][15] = 400;
    interpreter['regvals'][13] = 100;
    instateRegisters();
}



var conco = {'eq' : '0000', 'ne' : '0001', 'cs' : '0010', 'hs' : '0010', 'cc' : '0011', 'lo' : '0011', 'mi' : '0100', 'pl' : '0101', 'vs' : '0110', 'vc' : '0111', 'hi' : '1000', 'ls' : '1001', 'ge' : '1010', 'lt' : '1011', 'gt' : '1100', 'le' : '1101', 'al' : '1110', 'nv' : '1111'};
var dpsco = {'clz' : '1011', 'and' : '0000', 'eor' : '0001', 'sub' : '0010', 'rsb' : '0011', 'add' : '0100', 'adc' : '0101', 'sbc' : '0110', 'rsc' : '0111', 'tst' : '1000', 'teq' : '1001', 'cmp' : '1010', 'cmn' : '1011', 'orr' : '1100', 'mov' : '1101', 'bic' : '1110', 'mvn' : '1111'};
var mulco = {'mul' : '000', 'mla' : '001', 'umull' : '100', 'umlal' : '101', 'smull' : '110', 'smlal' : '111'};
var shiftco = {'lsl' : '00', 'lsr' : '01', 'asr' : '10', 'ror' : '11'};

//preprocess
function preprocess() {
    cont = window.cont;
    datasec = window.datasec
    labs = window.labs
    var memadd = 1000;        //start storing from

    var d = document.getElementById("compile");
    d.style.display = "none";
    d = d.nextElementSibling;
    d.style.display = "inline";

    var d = document.createElement("div");
    var e = document.createElement("div");

    var icont = document.getElementById('code').value    // get the code
    d.innerHTML = icont;
    d.id = "code";
    e.id = "encode";

    e.style.backgroundColor = d.style.backgroundColor = "Gainsboro";
    e.style.fontWeight = d.style.fontWeight = "bold";
    
    var w = (parseInt(document.getElementById("editor").style.width) - (8));
    d.style.width = (w * 74 / 100) + "px";
    e.style.width = (w * 25 / 100) + "px";
    e.style.height = "100%";
    
    document.getElementById("code").remove();
    document.getElementById("editor").appendChild(e);
    document.getElementById("editor").appendChild(d);

    var icont = icont.split('\n');        // makes a list of instructions
    for(var _i = 0 ; _i < icont.length ; _i++) {
        icont[_i] = icont[_i].trim();
        com = icont[_i].search(';');
        if(com != -1){
            icont[_i] = icont[_i].slice(0, com);
        }
        //alert(icont[i]);
        if(icont[_i].toLowerCase() == ".data") {
            //alert("entered data section, " + _i);
            _i += 1;
            for( ; _i < icont.length ; _i++) {
                //alert("i = " + _i);
                icont[_i].replace(/\s+/gi, " ");
                icont[_i].replace(/\s*\,\s*/gi, ",")
                if(icont[_i].length == 0)
                    continue;

                var ind = icont[_i].indexOf(":");
                var labl = icont[_i].slice(0, ind);
                datasec[labl] = memadd;
                
                if(icont[_i][ind+1] == ' ') {
                    //alert("hereee")
                    ind = icont[_i].indexOf("."); //alert("ind " + ind)
                    var d = icont[_i].slice(ind).indexOf(" ") + ind; //alert("d " + d)
                    var type = icont[_i].slice(ind, d).toLowerCase();
                    //alert(type)
                    var size = 8;       //bits
                    var dat = icont[_i].slice(d+1).split(",")
                    console.log(dat)

                    if(type == ".asciz") {
                        size *= 1;
                        var dat = String(icont[_i].match(/["]\w*["]/gi));
                        //alert("d " + dat + " " + typeof dat)
                        //alert("w " + typeof writeToMem(0, 0));
                        console.log(dat.charCodeAt(k))
                        console.log(memadd)
                        for(var k = 1 ; k < dat.length-1 ; k++) {
                            writeToMem(dat.charCodeAt(k), memadd, size);
                            memadd += size;
                        }
                    }
                    else if(type == ".byte") {
                        size *= 1;
                        for(var i = 0 ; i < dat.length ; i++) {
                            var d = parseInt(dat[i]);
                            if(d > 0) {
                                if(d > (Math.pow(2, size) -1))
                                    return true;
                            }
                            else {
                                if(d < -(Math.pow(2, size-1)))
                                    return true;
                            }
                            writeToMem(d, memadd, size);
                            memadd += size;
                        }
                    }
                    else if(type == ".word") {
                        size *= 4;
                        for(var i = 0 ; i < dat.length ; i++) {
                            var d = parseInt(dat[i]);
                            if(d > 0) {
                                if(d > (Math.pow(2, size) -1)) {
                                    //alert("true 3");
                                    return true;
                                }
                            }
                            else {
                                if(d < -(Math.pow(2, size-1))) {
                                    //alert("true 4");
                                    return true;
                                }
                            }
                            writeToMem(d, memadd, size);
                            memadd += size;
                        }
                        //alert(dat);
                    }
                    else if(type == ".halfword") {
                        size *= 2;
                        for(var i = 0 ; i < dat.length ; i++) {
                            var d = parseInt(dat[i]);
                            if(d > 0) {
                                if(d > (Math.pow(2, size) -1))
                                    return true;
                            }
                            else {
                                if(d < -(Math.pow(2, size-1)))
                                    return true;
                            }
                            writeToMem(d, memadd, size);
                            memadd += size;
                        }
                    }
                    else {
                        //alert("true 1");
                        return true;
                    }
                }
                else {
                    //alert("true 2" + icont[i] + " " + icont[i][ind + 1]);
                    return true;
                }
            }
        }
        else {
            var blabl = icont[_i].search(":");
            if(blabl != -1) {
                var ins = icont[_i].slice(blabl+1).trim();
                if(ins.search(/^bl^(ic)?/gi) != -1) {
                    var t = ins.indexOf(" ");
                    ins = ins.slice(0, t).toLowerCase() + ins.slice(t);
                }
                else {
                    //if(ins.length == 0)
                        //continue;
                    ins = ins.toLowerCase();
                }

                ins = remspace(ins);
                cont.push(ins);

                blabl = icont[_i].slice(0, blabl);
                if(blabl.search(" ") != -1)
                    return true;
                
                labs[blabl] = _i;
            }
            else {
                var ins = icont[_i];
                if(ins.search(/^(b)(l)?/gi) != -1) {
                    var t = ins.indexOf(" ");
                    ins = ins.slice(0, t).toLowerCase() + ins.slice(t);
                }
                else {
                    var t = ins.indexOf("=");
                    if(t == -1)
                        ins = ins.toLowerCase();
                    else {
                        ins = ins.slice(0, t).toLowerCase() + ins.slice(t);
                    }
                }
                ins = remspace(ins);
                cont.push(ins);
            }
        }
    }

    return false;
}

var dataprocessing = ['and', 'add', 'sub', 'rsb', 'adc', 'sbc', 'rsc', 'orr', 'eor', 'bic'];
var dataprotworeg = ['mov', 'mvn', 'cmp', 'cmn', 'clz', 'tst', 'teq'];
var memoryaccess = ['ldr', 'str', 'ldm', 'stm']
var mult_instr = ['mul', 'mla']
var longmul_instr = ['umull', 'umlal', 'smull', 'smlal']
var controlflow = ['bl', 'b']       //important : has to be arranged in descending order of length
var swiins = ['0x00', '0x02', '0x011', '0x12', '0x13', '0x66', '0x68', '0x69', '0x6a', '0x6b', '0x6c', '0x6d'];
var conditioncodes = ['eq', 'ne', 'cs', 'hs', 'cc', 'lo', 'mi', 'pl', 'vs', 'vc', 'hi', 'ls', 'ge','lt', 'gt', 'le', 'al']

// Compiles a given program
function processcont(tp){
    error_flag = 0;         // indicates if there is a syntax error while compiling. Set to 1 if there is an error
    error_msg = null;
    var i;
    cont = window.cont;
    datasec = window.datasec
    labs = window.labs

    if(preprocess()) {
        error_flag = 1;
        error_msg = "Error in .DATA section.";
        i = cont.length;
    }
    else {
        i = 0;
    }
    
    //alert(cont)
    //alert("HELP" + error_flag);
    //alert(JSON.stringify(datasec))
    //alert(JSON.stringify(labs))
    //alert(cont.length);
    //alert(cont.length);
    for( ; i < cont.length; i++){
        //alert(cont[i] + '  ' + i + ' ' + cont.length);
        var ins = '';  
        var regs = '';       
        var cc = undefined;
        for(k = 0; k < cont[i].length; k++){    // check for label
            if(cont[i][k] == ':'){
                break;
            }
        }
        if(k < cont[i].length){
            j = k + 2;
        }
        else{
            j = 0;
        }
        for(j ; j < cont[i].length; j++){
            if(cont[i][j] == ' '){
                break;
            }
            ins += cont[i][j];
        }
        for(k = j + 1; k < cont[i].length; k++){
            regs += cont[i][k];
        }
        var opcode = ins.slice(0, 3);   // get the opcode
        for(j = 0; j < dataprocessing.length; j++){     
            if(opcode == dataprocessing[j]){
                break;
            }
        }

        if(j < dataprocessing.length){  // check if it is a data processing instruction
            //alert('lo')
            if(ins.length > 3){         // check if the cpsr contents have to be set
                conds = ins.slice(3);
                //alert(conds);   
                if(conds.length > 1){
                    if(conds.length > 2){
                        if(conds[2] != 's'){    // check if 's' is the last character, if not, error
                            error_flag = 1;
                            error_msg = "S bit error.";
                            break;
                        }
                    }
                    conds = conds.slice(0, 2);   // get the condition codes  
                    for(j = 0; j < conditioncodes.length; j++){
                        if(conds == conditioncodes[j]){
                            break;
                        }
                    }
                    if(j == conditioncodes.length){     // check the validity of the condition codes
                        error_flag = 1;
                        error_msg = "Invalid condition codes.";
                        break;
                    }
                }
                else if(conds[0] != 's'){    // check if 's' is the last character, if not, error
                    error_flag = 1;
                    error_msg = "S bit error.";
                    //alert("SIGH");
                    break;
                }
            }
            //alert("error flag " + error_flag) ;
            error_flag = checkdpregs(regs, 0);
            //alert("error flag "+ error_flag);
            if(error_flag){
                //alert(regs);
                //alert("HERE");
                error_msg = "Invalid registers/location.";
                break;
            }   
            
            //add code to execute instruction here (if tp)

            continue;       //move on to next instruction
        }
        for(j = 0; j < dataprotworeg.length; j++){     
            if(opcode == dataprotworeg[j]){
                break;
            }
        }
        if(j < dataprotworeg.length){  // check if it is a data processing instruction having 2 registers
            if(ins.length > 3){         // check if the cpsr contents have to be set
                conds = ins.slice(3);
                //alert(conds);   
                if(conds.length > 1){
                    if(conds.length > 2){
                        if(conds[2] != 's'){    // check if 's' is the last character, if not, error
                            error_flag = 1;
                            error_msg = "S bit error.";
                            break;
                        }
                    }
                    conds = conds.slice(0, 2);   // get the condition codes  
                    for(j = 0; j < conditioncodes.length; j++){
                        if(conds == conditioncodes[j]){
                            break;
                        }
                    }
                    if(j == conditioncodes.length){     // check the validity of the condition codes
                        error_flag = 1;
                        error_msg = "Invalid condition codes.";
                        break;
                    }
                }
                else if(conds[0] != 's'){    // check if 's' is the last character, if not, error
                    error_flag = 1;
                    error_msg = "S bit error.";
                    //alert("SIGH");
                    break;
                }
            }
            //alert(error_flag);
            //alert(regs);
            error_flag = checkdpregs(regs, 1);
            //alert(error_flag);
            if(error_flag){
                error_msg = "Invalid registers/location.";
                break;
            }

            //add code to execute instruction here (if tp)

            continue;       //move on to next instruction  
        }
        for(j = 0; j < memoryaccess.length; j++){     
            if(opcode == memoryaccess[j]){
                break;
            }
        }
        if(j < memoryaccess.length){  // check if it is a memory accessing instruction
            if(j < 2) {
                if(ins.length > 7){
                    error_flag = 1;
                    error_msg = "Invalid instruction.";
                    break;
                }

                if(ins.length > 4){
                    cc = ins.slice(3,5);
                    if(typeof (conditioncodes.find(function(c) {return c == cc})) === 'undefined') {
                        if(cc != 'sh' && cc != 'sb') {
                            error_flag = 1;
                            error_msg = "Invalid condition codes.";
                            break;
                        }
                    }
                }
                if(ins.length == 4 || ins.length == 6) {
                    if(ins.slice(-1) != 'b' && ins.slice(-1) != 'h') {
                        error_flag = 1;
                        error_msg = "Invalid size specification.";
                        break;
                    }
                }
                if(ins.length == 7) {
                    var sizspec = ins.slice(-2);
                    if(sizspec != 'sb' && sizspec != 'sh') {
                        error_flag = 1;
                        error_msg = "Invalid size specification.";
                        break;
                    }
                }

                error_flag = checkdpregs(regs, 2);
                if(error_flag){
                    error_msg = "Invalid registers/location.";
                    break;
                }

                //add code to execute instruction here (if tp)

                continue;       //move on to next instruction 
            }
            else {
                modes = ['ia', 'ib', 'da', 'db', 'fa', 'fd', 'ed', 'ea'];
                if(ins.length > 5) {
                    cc = ins.slice(3,5);
                    if(typeof (conditioncodes.find(function(c) {return c == cc})) === 'undefined') {
                        error_flag = 1;
                        error_msg = "Invalid condition codes.";
                        break;
                    }

                    mode = ins.slice(5,7);
                    if(typeof(modes.find(function(m) {return m == mode})) === 'undefined') {
                        error_flag = 1;
                        error_msg = "Invalid mode.";
                        break;
                    }
                }
                else {
                    mode = ins.slice(3, 5); 
                    if(typeof(modes.find(function(m) {return m == mode})) === 'undefined') {
                        error_flag = 1;
                        error_msg = "Invalid mode."; alert(mode)
                        break;
                    }
                }

                error_flag = checkdpregs(regs, 3);
                if(error_flag){
                    error_msg = "Invalid registers/location.";
                    break;
                }

                //add code to execute instruction here (if tp)

                continue;       //move on to next instruction 
            }
        }
                                        //MULtiply
        for(j = 0; j < mult_instr.length; j++){     
            if(opcode == mult_instr[j]){
                break;
            }
        }
        if(j < mult_instr.length){  // check if it is a multiply instruction
            if(ins.length == 6 || ins.length == 4) {
                if(ins.slice(-1) != 's') {
                    error_flag = 1;
                    error_msg = "S bit error.";
                    break;
                }
                /*else {
                    if(ins[2] == 's') {
                        error_flag = 1;
                        error_msg = "S bit error. MLS cannot have S bit.";
                        break;
                    }
                }*/
            }

            if(ins.length >= 5) {
                var cc = ins.slice(3,5);
                if(typeof (conditioncodes.find(function(c) {return c == cc})) === 'undefined') {
                    error_flag = 1;
                    error_msg = "Invalid condition codes.";
                    break;
                }
            }

            if(j < 1) {
                error_flag = checkdpregs(regs, 4);
                if(error_flag) {
                    error_msg = "Invalid registers/location.";
                    break;
                }
            }
            else {
                error_flag = checkdpregs(regs, 5);
                if(error_flag) {
                    error_msg = "Invalid registers/location.";
                    break;
                }
            }

            continue;
        }

        if(ins.length >= 5) {           //for long MUL/MLA
            opcode = ins.slice(0, 5);
        }
        for(j = 0; j < longmul_instr.length; j++){   
            if(opcode == longmul_instr[j]){
                break;
            }
        }

        if(j < longmul_instr.length) {
            if(ins.length == 6 || ins.length == 8) {
                if(ins[5] != 's') {
                    error_flag = 1;
                    error_msg = "S bit error.";
                    break;
                }
            }

            if(ins.length >= 7) {
                var cc = ins.slice(-2);
                if(typeof (conditioncodes.find(function(c) {return c == cc})) === 'undefined') {
                    error_flag = 1;
                    error_msg = "Invalid condition codes.";
                    break;
                }
            }

            error_flag = checkdpregs(regs, 5);
            if(error_flag) {
                error_msg = "Invalid registers/location.";
                break;
            }
            

            continue;
        }
        if(ins.slice(0, 3) == 'swi'){
            //alert('found swi');
            conds = ins.slice(3);
            //alert(conds);
            if(conds.length > 0) {
                for(k = 0; k < conditioncodes.length; k++){
                    if(conds == conditioncodes[k]){
                        break;
                    }
                }
                if(k == conditioncodes.length){
                    error_flag = 1;
                    error_msg = 'Invalid condition code.'
                    alert('lolol');
                }
            }
            if(regs.length == 4){
                for(k = 0; k < swiins.length; k++){
                    if(regs == swiins[k]){
                        break;
                    }
                }
                if(k == swiins.length){
                    error_flag == 1;
                    break;
                }
            }
            else if(regs.length > 10){
                error_flag = 1;
                error_msg = "Invalid interrupt.";
                break;
            }
            else{
                swierr = 0;
                nregs = regs.slice(0, 2);
                for(k = 2; k < regs.length - 2; k++){
                    if(regs[k] != '0'){
                        swierr = 1;
                        break;
                    }
                }
                if(swierr){
                    error_flag = 1;
                    error_msg = "Invalid interrupt.";
                    break;
                }
                else{
                    nregs += regs.slice(k);
                    for(k = 0; k < swiins.length; k++){
                        if(regs == swiins[k]){
                            break;
                        }
                    }
                    if(k == swiins.length){
                        error_flag == 1;
                        break;
                    }
                }
            }
            continue;
        }
        //alert(ins + i);
        //alert(regs + i );
        if(ins.length == 3){            // check for B
            opcode = ins.slice(0, 1);
            conds = ins.slice(1);
        }
        else if(ins.length == 4){       //check for BL
            opcode = ins.slice(0, 2);
            conds = ins.slice(2);
        }
        else if(ins.length <= 2){
            opcode = ins;
            conds = '';
        }
        else{
            error_flag = 1;
            error_msg = "Invalid instruction.";
            break;
        }
        for(j = 0; j < controlflow.length; j++){
            if(opcode == controlflow[j]){
                break;
            }
        }
        if(j < controlflow.length){     // check if it is a control flow instruction
            if(conds != ''){
                for(k = 0; k < conditioncodes.length; k++){
                    if(conds == conditioncodes[k]){
                        break;
                    }
                }
                if(k == conditioncodes.length){
                    error_flag = 1;
                    error_msg = "Invalid condition codes.";
                    break;
                }
            }
            labflag = 1;       // flag to check the validity of the label in the instruction
            for(key in labs){
                if(regs == key){
                    labflag = 0;
                }
            }
            if(labflag){
                error_flag = 1;alert("si " + regs)
                error_msg = "Invalid label.";
                break;
            }
            //alert("DONE" + i + ' ' +cont[i]);
            continue;
        }

        if(cont[i].length != 0) {
            error_flag = 1;
            error_msg = "Invalid instruction.";
            break;
        }
    }

    if(error_flag){
        if(error_msg === null)
            alert("Syntax error!");
        else
            alert(error_msg);

        var btn = document.getElementById("run");
        btn.style.display = "none";
        btn.nextElementSibling.style.display = "inline";

        var cont = document.getElementById("code").innerHTML;
        var fcont = '';
        cont = cont.split('\n');
        var sptext = "<span class='error'>";
        for(x = 0 ; x < i ; x++) {
            fcont += cont[x] + "<br/>";
        }
        fcont += sptext + cont[i] + "</span>";
        for(x = i+1 ; x < cont.length ; x++) {
            fcont += "<br/>" + cont[x];
        }
        document.getElementById("code").innerHTML = fcont;
        window.interpreter.compile_error = true;
    }  
    else{
        alert("No errors!");
        //alert(labs['L1']);
        enc = encode(cont);
        encds = '';
        //alert(enc.length);
        k = 0;
        for(i = 0; i < cont.length; i++){
            if(cont[i] == ''){
                encds += '<center>' + 'NOOP' + '</center>' 
            }
            else{
                encds += '<center>' + enc[k] + '</center>' 
                k += 1;
            }
            console.log(encds);
        }
        var cont = document.getElementById("code").innerHTML;
        cont = cont.replace(/\n/g, "<br/>");
        document.getElementById("code").innerHTML = cont;
        document.getElementById("encode").innerHTML = encds;
        document.getElementById("code").addEventListener("scroll", scrollTogether);

        var btn = document.getElementById("interpreticn");
        btn.style.display = "inline";
        btn.nextElementSibling.style.display = "none";
    }

    setup_interpreter();
}

// Removes extra spaces in the list of instructions
function remspace(cont){
    cont = cont.replace(/\s+\:/g, ': ');
    cont = cont.replace(/\,/g, ', ');
    cont = cont.replace(/\s+\,/g, ', ');
    cont =  cont.replace(/\s+/g, ' ').trim();
        //alert(cont[i]);
    return cont;
}

// Checks the validity of the registers in the register list
function checkdpregs(regs, categ){
    var noshift = /^[r]([0-9]|1[0-5])[,]\s[r]([0-9]|1[0-5])[,]\s[r]([0-9]|1[0-5])$/
    var noshiftimm = /^[r]([0-9]|1[0-5])[,]\s[r]([0-9]|1[0-5])[,]\s[#][-]?([0-9]|[1-9][0-9]|[1-9][0-9][0-9]|[1-3][0-9][0-9][0-9]|[4][0][0-9][0-5])$/
    var immshift = /^[r]([0-9]|1[0-5])[,]\s[r]([0-9]|1[0-5])[,]\s[r]([0-9]|1[0-5])[,]\s([l][s][lr]|[a][s][r]|[r][o][r])\s[#][-]?([0-9]|[1-2][0-9]|3[0-1])$/
    var regshift = /^[r]([0-9]|1[0-5])[,]\s[r]([0-9]|1[0-5])[,]\s[r]([0-9]|1[0-5])[,]\s([l][s][lr]|[a][s][r]|[r][o][r])\s[r]([0-9]|1[0-5])$/
    var grptwo = /^[r]([0-9]|1[0-5])[,]\s[r]([0-9]|1[0-5])$/
    var grptwoshift = /^[r]([0-9]|1[0-5])[,]\s[r]([0-9]|1[0-5])[,]\s([l][s][lr]|[a][s][r]|[r][o][r])\s[#][-]?([0-9]|[1-2][0-9]|3[0-1])$/
    var grptwoimm = /^[r]([0-9]|1[0-5])[,]\s[#][-]?([0-9]|[1-9][0-9]|[1-9][0-9][0-9]|[1-3][0-9][0-9][0-9]|[4][0][0-9][0-5])$/
    var grptwolink = /^[p][c][,]\s[l][r]$/
    
    var nooffset = /^[r]([0-9]|1[0-5])[,]\s(\[[r]([0-9]|1[0-5])\]|[=]([a-z]|[A-Z]|_)(\w)*)$/
    var immorpreoffset = /^[r]([0-9]|1[0-5])[,]\s\[[r]([0-9]|1[0-5])[,]\s([#]\-?([0-9]|[1-9][0-9]|[1-9][0-9][0-9]|[1-3][0-9][0-9][0-9]|40[0-8][0-9]|409[0-5])|([r]([0-9]|1[0-5])))\]!?$/
    var postind = /^[r]([0-9]|1[0-5])[,]\s\[[r]([0-9]|1[0-5])\][,]\s([#]\-?([0-9]|[1-9][0-9]|[1-9][0-9][0-9]|[1-3][0-9][0-9][0-9]|40[0-8][0-9]|409[0-5]))|[r]([0-9]|1[0-5])$/

    var mulreglist = /^[r]([0-9]|1[0-5])!?[,]\s\{(([r]([0-9]|1[0-5]))|([r]([0-9]|1[0-5])\-[r]([0-9]|1[0-5])))([,]\s(([r]([0-9]|1[0-5]))|([r]([0-9]|1[0-5])\-[r]([0-9]|1[0-5]))))*\}$/

    var mla4reg = /^[r]([0-9]|1[0-5])[,]\s[r]([0-9]|1[0-5])[,]\s[r]([0-9]|1[0-5])[,]\s[r]([0-9]|1[0-5])$/

    switch(categ) {
    case 0:                     // for 3 register instructions
        var noshiftval = noshift.exec(regs);
        if(noshiftval != null) {
            return 0;
        }
        var noshiftimmval = noshiftimm.exec(regs); 
        if(noshiftimmval != null) {
            return 0;
        }
        var immshiftval = immshift.exec(regs); 
        if(immshiftval != null) {
            return 0;
        }
        var regshiftval = regshift.exec(regs); 
        if(regshiftval != null) {
            return 0;
        }
        return 1;
    
    case 1:        // for 2 register instructions
        var grptwoval = grptwo.exec(regs);
        var grptwoshiftval = grptwoshift.exec(regs);
        var grptwoimmval = grptwoimm.exec(regs);
        var grptwolinkval = grptwolink.exec(regs);
        if(grptwoval != null || grptwoimmval != null || grptwoshiftval != null || grptwolinkval != null){
            return 0;
        }
        return 1;

    case 2:         //for memory access
        var nooffsetval = nooffset.exec(regs);
        if(nooffsetval != null) {
            return 0;
        }
        var immorpreoffsetval = immorpreoffset.exec(regs); 
        alert(regs)
        if(immorpreoffsetval != null) {
            return 0;
        }
        var postindval = postind.exec(regs); 
        if(postindval != null) {
            return 0;
        }
        return 1;

    case 3:         //memory access with multiple registers
        var mulregval = mulreglist.exec(regs);
        if(mulregval != null) {
            return 0;
        }
        return 1;

    case 4:         //MUL
        var mulinsval = noshift.exec(regs);
        if(mulinsval != null) {
            var r = regs.match(/1[0-5]|[0-9]/g);
            if(r[0] == r[1])
                return 1;
            return 0;
        }
        return 1;

    case 5:         //MLA with 4 reg
        var mlainsval = mla4reg.exec(regs);
        if(mlainsval != null) {
            var r = regs.match(/1[0-5]|[0-9]/g);
            if(r[0] == r[1])
                return 1;
            return 0;
        }
        return 1;

    }
    return 1;
}

function encode(cont){
    //alert("ENTER " + cont.length);
    var encodes = [];
    var bin;
    console.log("encode\n", cont);
    for(i = 0; i < cont.length; i++){
        //alert(cont[i]);
        /*console.log(encodes);
        if(cont[i].length === 0) {
            encodes.push(' ')
            continue;
        }*/
        ins = cont[i].split(' ');
        bin = ''
        // check if it is a dataprocessing instruction with 3 registers
        op = ins[0].slice(0, 3);
        cond = ins[0].slice(3);
        set_flg = 0;
        imm_flg = 0;
        for(k = 0; k < dataprocessing.length; k++){
            if(op == dataprocessing[k]){
                break;
            }
        }
        
        if(k < dataprocessing.length){
            //alert("HELLO");
            if(cond.length >= 2){
                cond_code = cond.slice(0, 2);
                if(cond.slice(2) != ''){
                    set_flg = 1;
                }
                bin = bin + conco[cond_code] + '00';
            }
            else if(cond.length == 1){
                bin = bin + conco['al'] + '00';     // set to always if no condition is present
                set_flg = 1;
            }
            else{
                bin = bin + conco['al'] + '00';
            }
            //alert(bin);
            if(ins[3].search('#') != -1){       // check if there is an immediate operand
                imm_flg = 1;
                bin += '1';
            }
            else{
                bin += '0';
            }
            //alert(op);
            bin += dpsco[op];       // opcode
            if(set_flg){
                bin += '1';
            }
            else{
                bin += '0';
            }
            bin += toBin(parseInt(ins[2].slice(1)), 4);    // first operand
            bin += toBin(parseInt(ins[1].slice(1)), 4);     // destination operand
            if(imm_flg){
                bin += toBin(parseInt(ins[3].slice(1)), 12);     // second immediate operand
            }
            else if(ins.length > 4){
                if(ins[5].search('#') != -1){       // immediate shift value
                    bin = bin + toBin(parseInt(ins[5].slice(1)), 5) + shiftco[ins[4]] + '0' + toBin(parseInt(ins[3].slice(1)), 4);  
                }
                else{           // register shift value
                    bin = bin + toBin(parseInt(ins[5].slice(1)), 4) + '0' + shiftco[ins[4]] + '1' + toBin(parseInt(ins[3].slice(1)), 4);
                }
            }
            else{
                bin = bin + '00000' + shiftco['lsl'] + '0' + toBin(parseInt(ins[3].slice(1)), 4);  
            }
            //alert(bin.length + ' ' + bin);
            encodes.push(toHex(bin));   // add to the encodes array
            continue;
        }
        // check if it is a dataprocessing instruction with 2 registers
        for(k = 0; k < dataprotworeg.length; k++){
            if(op == dataprotworeg[k]){
                break;
            }
        }
        if(k < dataprotworeg.length){
            if(cond.length >= 2){
                cond_code = cond.slice(0, 2);
                if(cond.slice(2) != ''){
                    set_flg = 1;
                }
                bin = bin + conco[cond_code] + '00';
            }
            else if(cond.length == 1){
                bin = bin + conco['al'] + '00';     // set to always if no condition is present
                set_flg = 1;
            }
            else{
                bin = bin + conco['al'] + '00';
            }
            if(ins[2].search('#') != -1){       // check if there is an immediate operand
                imm_flg = 1;
                bin += '1';
            }
            else{
                bin += '0';
            }
            bin += dpsco[op];       // opcode
            //alert(dpsco[op]);
            if(set_flg || op == 'cmp' || op == 'cmn'){
                bin += '1';
            }
            else{
                bin += '0';
            }
            if(op == 'clz'){
                bin += '1111';
            }
            else{
                bin += '0000';
            }
            bin += toBin(parseInt(ins[1].slice(1)), 4);     // destination operand
            if(op == 'clz'){
                bin += '11110001'
                bin += toBin(parseInt(ins[2].slice(1)), 4);
                encodes.push(toHex(bin));   // add to the encodes array
                //alert(bin.length + ' ' + bin);
                continue;    
            }
            if(imm_flg){
                bin += toBin(parseInt(ins[2].slice(1)), 12);     // second immediate operand
            }
            else if(ins.length > 3){
                if(ins[4].search('#') != -1){       // immediate shift value
                    bin = bin + toBin(parseInt(ins[4].slice(1)), 5) + shiftco[ins[3]] + '0' + toBin(parseInt(ins[2].slice(1)), 4);  
                }
                else{           // register shift value
                    bin = bin + toBin(parseInt(ins[4].slice(1)), 4) + '0' + shiftco[ins[3]] + '1' + toBin(parseInt(ins[2].slice(1)), 4);
                }
            }
            else{
                bin += toBin(parseInt(ins[2].slice(1)), 12);     // second immediate operand
            }
            encodes.push(toHex(bin));   // add to the encodes array
            continue;
        }
        // check if it is a multiply instruction (32bit)
        for(k = 0; k < mult_instr.length; k++){
            if(op == mult_instr[k]){
                break;
            }
        }
        if(k < mult_instr.length){
            acc = 0;
            if(cond.length >= 2){
                cond_code = cond.slice(0, 2);
                if(cond.slice(2) != ''){
                    set_flg = 1;
                }
                bin = bin + conco[cond_code] + '000000';
            }
            else if(cond.length == 1){
                bin = bin + conco['al'] + '000000';     // set to always if no condition is present
                set_flg = 1;
            }
            else{
                bin = bin + conco['al'] + '000000';
            }
            if(op == 'mla'){
                acc = 1;
                bin += '1';
            }
            else{
                bin += '0';
            }
            if(set_flg){
                bin += '1';
            }
            else{
                bin += '0';
            }
            bin += toBin(parseInt(ins[1].slice(1)), 4);
            if(acc){
                bin += toBin(parseInt(ins[4].slice(1)), 4);
            }
            else{
                bin += '0000';
            }
            bin = bin + toBin(parseInt(ins[3].slice(1)), 4) + '1001' + toBin(parseInt(ins[2].slice(1)), 4);
            encodes.push(toHex(bin));   // add to the encodes array
            continue;
            //alert(encodes);
        }
        for(k = 0; k < memoryaccess.length; k++){
            if(op == memoryaccess[k]){
                break;
            }
        }
        if(k < memoryaccess.length){
            pre_flg = 0;
            zer_flg = 0;
            if(op == 'ldr' || op == 'str'){
                //alert(cond.length);
                if(cond.length == 2){
                    bin = bin + conco[cond] + '01';
                    //alert(bin);
                }
                else{
                    bin = bin + conco['al'] + '01';
                }
                if(cont[i].search('#') != -1){
                    bin += '0';
                }
                else{
                    bin += '1';
                }
                //alert(bin);
                if(ins.length == 4 && ins[3].search(']') != -1){
                    pre_flg = 1;
                    bin += '1';
                }
                else if(ins.length == 4 && ins[3].search(']') == -1 ){
                    bin += '0';
                }
                else{
                    zer_flg = 1;
                    bin += '1';
                }
                if(zer_flg){
                    binarr = [];
                    for(j = 0; j < bin.length; j++){
                        binarr.push(bin[j]);
                    }
                    binarr[6] = '0';
                    bin = '';
                    for(j = 0; j < binarr.length; j++){
                        bin += binarr[j];
                    }
                }
                if(cont[i].search('-') != -1){
                    bin += '0';
                }
                else{
                    bin += '1';
                }
                if(ins[0].search('b') != -1){
                    bin += '1';
                }
                else{
                    bin += '0';
                }
                if(cont[i].search('!') != -1){
                    bin += '1';
                }
                else{
                    bin += '0';
                }
                if(op == 'ldr'){
                    bin += '1';
                }
                else{
                    bin += '0';
                }
                bin = bin + toBin(parseInt(ins[2].slice(2)), 4) + toBin(parseInt(ins[1].slice(1)), 4);
                if(pre_flg){
                    hash_ind = ins[3].search('#');
                    if(hash_ind == -1){
                        bin = bin + toBin(parseInt(ins[3].slice(1)), 12);
                    }
                    else{
                        bin = bin + toBin(parseInt(ins[3].slice(1)), 12);
                    }
                }
                else if(zer_flg){
                    bin = bin + toBin(parseInt('0'), 12);
                }
                else{
                    bin = bin + toBin(parseInt(ins[3].slice(1)), 12);
                }
                encodes.push(toHex(bin));   // add to the encodes array
                continue;
            }
            else{
                //alert(cond);
                if(cond.length == 4){
                    cond_code = cond.slice(0, 2);
                    modco = cond.slice(2);
                    ins[0] = ins[0].slice(0, 3) + modco;
                    bin += conco[cond_code] + '100';
                    //alert(bin);
                }
                else{
                    modco = cond.slice(0);
                    bin += conco['al'] + '100';
                }
                if(modco.slice(1) == 'b' || ins[0] == 'ldmed' || ins[0] == 'ldmea' || ins[0] == 'stmfa' || ins[0] == 'stmfd'){
                    bin += '1';
                }
                else{
                    bin += '0';
                }
                //alert(modco);
                if(modco.slice(0, 1) == 'i' || ins[0] == 'ldmed' || ins[0] == 'ldmfd' || ins[0] == 'stmfd' || ins[0] == 'stmea'){
                    bin += '1';
                }
                else{
                    bin += '0';
                }
                //alert(bin);
                bin += '0';
                if(cont[i].search('!') != -1){
                    bin += '1';
                }
                else{
                    bin += '0';
                }
                if(op == 'ldm'){
                    bin += '1';
                }
                else{
                    bin += '0';
                }
                bin += toBin(parseInt(ins[1].slice(1)), 4);
                reg_list = ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0']
                //alert(ins + ' ' +ins[2]);
                for(j = 2; j < ins.length; j++){
                    if(ins[j].search('-') != -1){
                        min_ind = ins[j].search('-');
                        lim = [0, 0];
                        m = 0;
                        for(u = 0; u < ins[j].length; u++){
                            if(ins[j][u] == 'r'){
                                lim[m] = parseInt(ins[j].slice(u + 1));
                                m += 1;
                            }
                        }
                        alert("LIMS : " + lim);
                        for(u = lim[0]; u <= lim[1]; u++){
                            reg_list[u] = '1';
                        }
                    }
                    else{
                        reg_list[parseInt(ins[j].slice(1))] = '1';
                    }
                }
                for(j = reg_list.length - 1 ; j >= 0; j--){
                    bin += reg_list[j];
                }
                encodes.push(toHex(bin));   // add to the encodes array
                continue;
            }
        }
        if(ins[0].slice(0, 1) == 'b' || ins[0].slice(0, 2) == 'bl'){
            if(ins[0].length == 4 || ins[0].length == 2){
                cond = ins[0].slice(2);
                if(cond != ''){
                    bin = bin + conco[cond] + '1011'; 
                }
                else{
                    bin = bin + conco['al'] + '1011';
                }
            }
            else{
                if(ins[0].length == 3){
                    bin = bin + conco[ins[0].slice(1)] + '1010';
                }
                else{
                    bin = bin + conco['al'] + '1010';
                }
            }
            branch_offset = 0;
            if(labs[ins[1]] > i){
                branch_offset = labs[ins[1]] - i;
            }
            else{
                branch_offset = i - labs[ins[1]];
            }
            bin += toBin(branch_offset, 24);
            encodes.push(toHex(bin));
            continue;
        }
        op = ins[0].slice(0, 5);
        cond = ins[0].slice(5);
        for(k = 0; k < longmul_instr.length; k++){
            if(op == longmul_instr[k]){
                break;
            }
        }
        if(k < longmul_instr.length){
            if(cond.length >= 2){
                cond_code = cond.slice(0, 2);
                if(cond.slice(2) != ''){
                    set_flg = 1;
                }
                bin = bin + conco[cond_code] + '00001';
            }
            else if(cond.length == 1){
                bin = bin + conco['al'] + '00001';     // set to always if no condition is present
                set_flg = 1;
            }
            else{
                bin = bin + conco['al'] + '00001';
            }
            if(op[0] == 'u'){
                bin += '0';
            }
            else{
                bin += '1';
            }
            if(op[3] == 'a'){
                bin += '1';
            }
            else{
                bin += '0';
            }
            if(set_flg){
                bin += '1';
            }
            else{
                bin += '0';
            }
            bin = bin + toBin(parseInt(ins[2].slice(1)), 4) + toBin(parseInt(ins[1].slice(1)), 4) + toBin(parseInt(ins[4].slice(1)), 4) + '1001' + toBin(parseInt(ins[3].slice(1)), 4);
            encodes.push(toHex(bin));   // add to the encodes array
        }
        if(ins[0].slice(0, 3) == 'swi'){
            cond = ins[0].slice(3);
            if(cond.length == 2){
                bin = bin + conco[cond] + '1111';
            }
            else{
                bin = bin + conco['al'] + '1111';
            }
            x_ind = ins[1].search('x');
            hex_num = ins[1].slice(x_ind + 1);
            bin = bin + toBin(parseInt(hex_num, 16), 24);
            encodes.push(toHex(bin));   // add to the encodes array
        }
    }

    //alert("RETURNING : " + encodes)
    return encodes;
}

// function to convert a decimal number to binary correct upto the given number of bits
function toBin(num, bits){
    ret = num.toString(2);
    while(ret.length < bits){
        ret = '0' + ret;
    }
    return ret;
}

// function to convert a binary number to hexadecimal
function toHex(bits){
    ret = parseInt(bits, 2).toString(16).toUpperCase();
    while(ret.length < 8){
        ret = '0' + ret;
    }
    return ret;
}

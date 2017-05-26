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
    interpreter["deci"] = window.deci;                  //flags to indicate register content state
    interpreter["bin"] = window.bin;
    interpreter["hexa"] = window.hexa;
}



var conco = {'eq' : '0000', 'ne' : '0001', 'cs' : '0010', 'hs' : '0010', 'cc' : '0011', 'lo' : '0011', 'mi' : '0100', 'pl' : '0101', 'vs' : '0110', 'vc' : '0111', 'hi' : '1000', 'ls' : '1001', 'ge' : '1010', 'lt' : '1011', 'gt' : '1100', 'le' : '1101', 'al' : '1110', 'nv' : '1111'};
var dpsco = {'and' : '0000', 'eor' : '0001', 'sub' : '0010', 'rsb' : '0011', 'add' : '0100', 'adc' : '0101', 'sbc' : '0110', 'rsc' : '0111', 'tst' : '1000', 'teq' : '1001', 'cmp' : '1010', 'cmn' : '1011', 'orr' : '1100', 'mov' : '1101', 'bic' : '1110', 'mvn' : '1111'};
var mulco = {'mul' : '000', 'mla' : '001', 'umull' : '100', 'umlal' : '101', 'smull' : '110', 'smlal' : '111'};


//preprocess
function preprocess() {
    cont = window.cont;
    datasec = window.datasec
    labs = window.labs
    var memadd = 10000;        //start storing from

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
    for(var i = 0 ; i < icont.length ; i++) {
        icont[i] = icont[i].trim();
        com = icont[i].search(';');
        if(com != -1){
            icont[i] = icont[i].slice(0, com);
        }
        //alert(icont[i]);
        if(icont[i] == ".DATA") {
            i += 1;
            for( ; i < icont.length ; i++) {
                icont[i].replace(/\s+/gi, " ");
                icont[i].replace(/\s*\,\s*/gi, ",")
                if(icont[i].length == 0)
                    continue;

                var ind = icont[i].indexOf(":");
                var labl = icont[i].slice(0, ind);
                datasec[labl] = memadd;

                if(icont[i][ind+1] == ' ') {
                    alert("hereee")
                    ind = icont[i].indexOf("."); alert("ind " + ind)
                    var d = icont[i].slice(ind).indexOf(" ") + ind; alert("d " + d)
                    var type = icont[i].slice(ind, d).toLowerCase();
                    alert(type)
                    var size = 8;
                    var dat = icont[i].slice(d+1).split(",")
                    if(type == ".asciz") {
                        size *= 1;
                        var dat = String(icont[i].match(/["]\w*["]/gi));
                        alert("d " + dat + " " + typeof dat)
                        //alert("w " + typeof writeToMem(0, 0));
                        console.log(dat.charCodeAt(k))
                        console.log(memadd)
                        for(var k = 1 ; k < dat.length-1 ; k++) {
                            writeToMem(dat.charCodeAt(k), memadd);
                            memadd += size;
                        }
                    }
                    else if(type == ".byte")
                        size *= 1;
                    else if(type == ".word")
                        size *= 2;
                    else if(type == ".halfword")
                        size *= 4;
                    else
                        return true;
                    
                    //var 
                }
                else {
                    return true;
                }
            }
        }
        else {
            var blabl = icont[i].search(":");
            if(blabl != -1) {
                var ins = icont[i].slice(blabl+1).trim();
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

                blabl = icont[i].slice(0, blabl);
                if(blabl.search(" ") != -1)
                    return true;
                
                labs[blabl] = i;
            }
            else {
                var ins = icont[i];
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

// Compiles a given program
function processcont(tp){
    var dataprocessing = ['and', 'add', 'sub', 'rsb', 'adc', 'sbc', 'rsc', 'orr', 'eor', 'bic', 'clz', 'tst', 'teq']
    var dataprotworeg = ['mov', 'mvn', 'cmp', 'cmn']
    var memoryaccess = ['ldr', 'str', 'ldm', 'stm']
    var mult_instr = ['mul', 'mla', 'mls']
    var longmul_instr = ['umull', 'umlal', 'smull', 'smlal']
    var controlflow = ['bl', 'b']       //important : has to be arranged in descending order of length
    var swiins = ['0x00', '0x02', '0x011', '0x12', '0x13', '0x66', '0x68', '0x69', '0x6a', '0x6b', '0x6c', '0x6d'];
    var conditioncodes = ['eq', 'ne', 'cs', 'hs', 'cc', 'lo', 'mi', 'pl', 'vs', 'vc', 'hi', 'ls', 'ge', 'lt', 'gt', 'le', 'al']
    

    var error_flag = 0;         // indicates if there is a syntax error while compiling. Set to 1 if there is an error
    var error_msg = null;
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
    
    alert(cont)
    //alert("HELP" + error_flag);
    //alert(JSON.stringify(datasec))
    alert(JSON.stringify(labs))
    alert(cont.length);
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
            error_flag = checkdpregs(regs, 0);
            if(error_flag){
                alert(regs);
                alert("HERE");
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
            error_flag = checkdpregs(regs, 1);
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
                if(ins.length > 4){
                    cc = ins.slide(3,5);
                    if(typeof (conditioncodes.find(function(c) {return c == cc})) === 'undefined') {
                        error_flag = 1;
                        error_msg = "Invalid condition codes.";
                        break;
                    }
                }
                if(ins.length == 4 || ins.length == 6) {
                    if(ins.slice(-1) != 'b') {
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
                        error_msg = "Invalid mode.";
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
                if(ins[3] != 's') {
                    error_flag = 1;
                    error_msg = "S bit error.";
                    break;
                }
                else {
                    if(ins[2] == 's') {
                        error_flag = 1;
                        error_msg = "S bit error. MLS cannot have S bit.";
                        break;
                    }
                }
            }

            if(ins.length >= 5) {
                var cc = ins.slice(-2);
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
        if(ins == 'swi'){
            if(regs.length == 2){
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
    }  
    else{
        alert("No errors!");
        var cont = document.getElementById("code").innerHTML;
        cont = cont.replace(/\n/g, "<br/>");
        document.getElementById("code").innerHTML = cont;
        //alert(cont);
        //encode(cont);
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
    var noshiftimm = /^[r]([0-9]|1[0-5])[,]\s[r]([0-9]|1[0-5])[,]\s[#]([0-9]|[1-9][0-9]|[1-9][0-9][0-9]|[1-3][0-9][0-9][0-9]|[4][0][0-9][0-5])$/
    var immshift = /^[r]([0-9]|1[0-5])[,]\s[r]([0-9]|1[0-5])[,]\s[r]([0-9]|1[0-5])[,]\s([l][s][lr]|[a][s][r])\s[#]([0-9]|[1-2][0-9]|3[0-1])$/
    var regshift = /^[r]([0-9]|1[0-5])[,]\s[r]([0-9]|1[0-5])[,]\s[r]([0-9]|1[0-5])[,]\s([l][s][lr]|[a][s][r])\s[r]([0-9]|1[0-5])$/
    var grptwo = /^[r]([0-9]|1[0-5])[,]\s[r]([0-9]|1[0-5])$/
    var grptwoshift = /^[r]([0-9]|1[0-5])[,]\s[r]([0-9]|1[0-5])[,]\s([l][s][lr]|[a][s][r])\s[#]([0-9]|[1-2][0-9]|3[0-1])$/
    var grptwoimm = /^[r]([0-9]|1[0-5])[,]\s[#]([0-9]|[1-9][0-9]|[1-9][0-9][0-9]|[1-3][0-9][0-9][0-9]|[4][0][0-9][0-5])$/
    var grptwolink = /^[p][c][,]\s[l][r]$/
    
    var nooffset = /^[r]([0-9]|1[0-5])[,]\s(\[[r]([0-9]|1[0-5])\]|[=]([a-z]|[A-Z]|_)(\w)*)$/
    var immorpreoffset = /^[r]([0-9]|1[0-5])[,]\s\[[r]([0-9]|1[0-5])[,]\s[#]\-?([0-9]|[1-9][0-9]|[1-9][0-9][0-9]|[1-3][0-9][0-9][0-9]|40[0-8][0-9]|409[0-5])\]!?$/
    var postind = /^[r]([0-9]|1[0-5])[,]\s\[[r]([0-9]|1[0-5])\][,]\s[#]\-?([0-9]|[1-9][0-9]|[1-9][0-9][0-9]|[1-3][0-9][0-9][0-9]|40[0-8][0-9]|409[0-5])?$/

    var mulreglist = /^[r]([0-9]|1[0-5])[,]\s\{(([r]([0-9]|1[0-5]))|([r]([0-9]|1[0-5])\-[r]([0-9]|1[0-5])))([,]\s(([r]([0-9]|1[0-5]))|([r]([0-9]|1[0-5])\-[r]([0-9]|1[0-5]))))*\}$/

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

function processconditions(cc) {
    var conditioncodes = ['eq', 'ne', 'cs', 'hs', 'cc', 'lo', 'mi', 'pl', 'vs', 'vc', 'hi', 'ls', 'ge', 'lt', 'gt', 'le', 'al'];

    var p = conditioncodes.findIndex(function(c) { return c == cc });

    switch(p) {
        case 0:     //eq
            return Boolean(flags.z);   //if z = 1; return true
        
        case 1:     //ne
            return !Boolean(flags.z);    //if z = 0; return true

        case 2: case 3:     //cs or hs
            return Boolean(flag.c);     //if c = 1; return true

        case 4: case 5:     //cc or lo
            return !Boolean(flag.c);    //if c = 0; return true

        case 6:             //mi
            return Boolean(flag.n);     //if n = 1; return true

        case 7:             //pl
            return (!Boolean(flag.n) || Boolean(flag.z));   //if n=0 or z=1; return true

        case 8:             //vs
            return Boolean(flag.v);     //if v=1; return true

        case 9:             //vc
            return !Boolean(flag.v);    //if v=0; return false

        case 10:            //hi
            return !Boolean(flag.n);     //if n=0; return true

        case 11:            //ls
            return (Boolean(flag.n) || Boolean(flag.z));    //if n=1 or z=1;

        case 12:            //ge
            return (!Boolean(flag.n) || Boolean(flag.z));   //if n=0 or z=1; return true

        case 13:            //lt
            return Boolean(flag.n);     //if n = 1; return true

        case 14:            //gt
            return !Boolean(flag.n);     //if n=0; return true

        case 15:            //le
            return (Boolean(flag.n) || Boolean(flag.z));    //if n=1 or z=1;

        case 16:            //al
            return true;
    }

    return undefined;
}

function interpret(line) {
    var interpreter = window.interpreter;

    //Identify, process and execute 
    
    //Data Processing
    
    //Memory Access

    //Multiply

    //Long Multiply

    //Control Flow

    if(interpreter.deci) {
        interpreter.copier();
        interpreter.instate();
    }
    else if(interpreter.bin) {
        interpreter.copier();
        interpreter.bindriver();
        interpreter.instate();
    }
    else if(interpreter.hexa) {
        interpreter.copier();
        interpreter.hexdriver();
        interpreter.instate();
    }
}
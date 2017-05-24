// Compiles a given program
function processcont(tp){
    var d = document.createElement("div");
    var cont = document.getElementById('code').value    // get the code
    d.innerHTML = cont;
    d.id = "code";
    d.style.backgroundColor = "Gainsboro";
    d.style.fontWeight = "bold";
    d.style.width = (parseInt(document.getElementById("editor").style.width) - (8)) + "px";
    document.getElementById("code").remove();
    document.getElementById("editor").appendChild(d);

    var dataprocessing = ['and', 'add', 'sub', 'rsb', 'adc', 'sbc', 'rsc', 'orr', 'eor', 'bic', 'clz', 'tst', 'teq']
    var dataprotworeg = ['mov', 'mvn', 'cmp', 'cmn']
    var memoryaccess = ['ldr', 'str', 'ldm', 'stm']
    var mult_instr = ['mul', 'mla', 'mls']
    var controlflow = ['b', 'bl']
    var conditioncodes = ['eq', 'ne', 'cs', 'hs', 'cc', 'lo', 'mi', 'pl', 'vs', 'vc', 'hi', 'ls', 'ge', 'lt', 'gt', 'le', 'al', 'al', 'nv']
    
    cont = cont.toLowerCase();      // change to lower case
    cont = cont.split('\n');        // makes a list of instructions
    remspace(cont);         // removes extra spaces in the instructions

    var error_flag = 0;         // indicates if there is a syntax error while compiling. Set to 1 if there is an error
    var i;
    for(i = 0; i < cont.length; i++){
        var ins = '';  
        var regs = '';       
        for(j = 0; j < cont[i].length; j++){
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
            if(ins.length > 3){         // check if the cpsr contents have to be set
                conds = ins.slice(3);   
                if(conds.length > 2){
                    if(conds[2] != 's'){    // check if 's' is the last character, if not, error
                        error_flag = 1;
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
                    break;
                }
            }
            error_flag = checkdpregs(regs, 0);
            if(error_flag){
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
            if(ins.length > 3){        // check if cpsr contents have to be set
                if(ins[3] != 's'){      
                    error_flag = 1;
                    break;
                }
            }
            error_flag = checkdpregs(regs, 1);
            if(error_flag){
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
                if(opcode.length > 4){
                    if(typeof (conditioncodes.find(opcode.slide(3,5))) === 'undefined') {
                        error_flag = 1;
                        break;
                    }
                }
                if(opcode.length == 4 || opcode.length == 6) {
                    if(opcode.slice(-1) != 'b') {
                        error_flag = 1;
                        break;
                    }
                }
            }

            error_flag = checkdpregs(regs, 2);
            if(error_flag){
                break;
            }

            //add code to execute instruction here (if tp)

            continue;       //move on to next instruction  
        }
    }
    
    if(error_flag){
        alert("Syntax error!");
        var cont = document.getElementById("code").innerHTML;
        var fcont = '';
        cont = cont.split('\n');
        var sptext = "<span class='error'>";
        for(x = 0 ; x < i ; x++) {
            fcont += cont[x] + "<br/>";
        }
        fcont += sptext + cont[i] + "</span><br/>";
        for(x = i+1 ; x < cont.length ; x++) {
            fcont += cont[x] + "<br/>";
        }
        document.getElementById("code").innerHTML = fcont + "<br/>";
    }  
    else{
        alert("No errors!");
    }
}

// Removes extra spaces in the list of instructions
function remspace(cont){
    for(i = 0; i < cont.length; i++){
        cont[i] = cont[i].replace(/\s+\,/g, ', ');
        cont[i] =  cont[i].replace(/\s+/g, ' ').trim();
    }
}

// Checks the validity of the registers in the register list
function checkdpregs(regs, categ){
    var noshift = /^[r]([0-9]|1[0-5])[,]\s[r]([0-9]|1[0-5])[,]\s[r]([0-9]|1[0-5])$/
    var immshift = /^[r]([0-9]|1[0-5])[,]\s[r]([0-9]|1[0-5])[,]\s[r]([0-9]|1[0-5])[,]\s([l][s][lr]|[a][s][r])\s[#]([0-9]|[1-2][0-9]|3[0-1])$/
    var regshift = /^[r]([0-9]|1[0-5])[,]\s[r]([0-9]|1[0-5])[,]\s[r]([0-9]|1[0-5])[,]\s([l][s][lr]|[a][s][r])\s[r]([0-9]|1[0-5])$/
    var grptwo = /^[r]([0-9]|1[0-5])[,]\s[r]([0-9]|1[0-5])$/
    
    var nooffset = /^[r]([0-9]|1[0-5])[,]\s[r]([0-9]|1[0-5])$/
    var immorpreoffset = /^[r]([0-9]|1[0-5])[,]\s\[[r]([0-9]|1[0-5])[,]\s[#]\-?([0-9]|[1-9][0-9]|[1-9][0-9][0-9]|[1-3][0-9][0-9][0-9]|40[0-8][0-9]|409[0-5])\]!?$/
    var postind = /^[r]([0-9]|1[0-5])[,]\s\[[r]([0-9]|1[0-5])\][,]\s[#]\-?([0-9]|[1-9][0-9]|[1-9][0-9][0-9]|[1-3][0-9][0-9][0-9]|40[0-8][0-9]|409[0-5])?$/

    switch(categ) {
    case 0:                     // for 3 register instructions
        var noshiftval = noshift.exec(regs);
        if(noshiftval != null) {
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
        if(grptwoval != null){
            return 0;
        }
        return 1;

    case 2:         //for memory access
        var nooffsetval = nooffset.exec(regs);
        if(nooffsetval != null) {
            return 0;
        }
        var immorpreoffset = immorpreoffset.exec(regs); 
        if(immorpreoffset != null) {
            return 0;
        }
        var postind = postind.exec(regs); 
        if(postind != null) {
            return 0;
        }
        return 1;
    }
    return 1;
}
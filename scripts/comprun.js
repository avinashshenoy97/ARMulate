// Compiles a given program
function processcont(tp){
    var dataprocessing = ['and', 'add', 'sub', 'rsb', 'adc', 'sbc', 'rsc', 'orr', 'eor', 'bic', 'clz', 'tst', 'teq']
    var dataprotworeg = ['mov', 'mvn', 'cmp', 'cmn']
    var datatransfer = ['ldr', 'str', 'ldm', 'stm']
    var conditioncodes = ['eq', 'ne', 'cs', 'hs', 'cc', 'lo', 'mi', 'pl', 'vs', 'vc', 'hi', 'ls', 'ge', 'lt', 'gt', 'le', 'al', 'al', 'nv']
    var cont = document.getElementById('code').value    // get the code
    cont = cont.toLowerCase();      // change to lower case
    cont = cont.split('\n');        // makes a list of instructions
    remspace(cont);         // removes extra spaces in the instructions
    var error_flag = 0;         // indicates if there is a syntax error while compiling. Set to 1 if there is an error
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
                }
            }
            error_flag = checkdpregs(regs, 0);
            if(error_flag){
                break;
            }   
        }
        for(j = 0; j < dataprocessing.length; j++){     
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
        }
    }
    if(error_flag){
        alert("Syntax error!");
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
    if(categ == 0){                     // for 3 register instructions
        var noshiftval = noshift.exec(regs);
        var immshiftval = immshift.exec(regs); 
        var regshiftval = regshift.exec(regs); 
        if(noshiftval != null || immshiftval != null || regshiftval != null){
            return 0;
        }
        return 1;
    }
    else if(categ == 1){        // for 2 register instructions
        var grptwoval = grptwo.exec(regs);
        if(grptwoval != null){
            return 0;
        }
        return 1;
    }
    return 1;
}
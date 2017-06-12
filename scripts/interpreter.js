function processconditions(cc) {
    var conditioncodes = ['eq', 'ne', 'cs', 'hs', 'cc', 'lo', 'mi', 'pl', 'vs', 'vc', 'hi', 'ls', 'ge', 'lt', 'gt', 'le', 'al'];

    var p = conditioncodes.findIndex(function (c) { return c == cc });
    alert(p);
    switch (p) {
        case 0:     //eq
            return Boolean(window.interpreter['flags'].z);   //if z = 1; return true

        case 1:     //ne
            return !Boolean(window.interpreter['flags'].z);    //if z = 0; return true

        case 2: case 3:     //cs or hs
            return Boolean(window.interpreter['flags'].c);     //if c = 1; return true

        case 4: case 5:     //cc or lo
            return !Boolean(window.interpreter['flags'].c);    //if c = 0; return true

        case 6:             //mi
            return Boolean(window.interpreter['flags'].n);     //if n = 1; return true

        case 7:             //pl
            return (!Boolean(window.interpreter['flags'].n) || Boolean(flag.z));   //if n=0 or z=1; return true

        case 8:             //vs
            return Boolean(window.interpreter['flags'].v);     //if v=1; return true

        case 9:             //vc
            return !Boolean(window.interpreter['flags'].v);    //if v=0; return false

        case 10:            //hi
            return !Boolean(window.interpreter['flags'].n);     //if n=0; return true

        case 11:            //ls
            return (Boolean(window.interpreter['flags'].n) || Boolean(window.interpreter['flags'].z));    //if n=1 or z=1;

        case 12:            //ge
            return (!Boolean(window.interpreter['flags'].n) || Boolean(window.interpreter['flags'].z));   //if n=0 or z=1; return true

        case 13:            //lt
            return Boolean(window.interpreter['flags'].n);     //if n = 1; return true

        case 14:            //gt
            return !Boolean(window.interpreter['flags'].n);     //if n=0; return true

        case 15:            //le
            return (Boolean(window.interpreter['flags'].n) || Boolean(window.interpreter['flags'].z));    //if n=1 or z=1;

        case 16:            //al
            return true;
    }

    return undefined;
}

function instateRegisters() {
    window.interpreter.copier();
    window.interpreter.instate(window.interpreter['regvals'], window.interpreter['flags']);
    
    if(window.interpreter.bin)
        window.interpreter.bindriver();
    else if(window.interpreter.hexa)
        window.interpreter.hexdriver();
}


var dataprocessing = ['and', 'add', 'sub', 'rsb', 'adc', 'sbc', 'rsc', 'orr', 'eor', 'bic'];
var dataprotworeg = ['mov', 'mvn', 'cmp', 'cmn', 'clz', 'tst','teq'];
var memoryaccess = ['ldr', 'str', 'ldm', 'stm']
var mult_instr = ['mul', 'mla', 'mls']
var longmul_instr = ['umull', 'umlal', 'smull', 'smlal']
var controlflow = ['bl', 'b']       //important : has to be arranged in descending order of length
var swiins = ['0x00', '0x02', '0x011', '0x12', '0x13', '0x66', '0x68', '0x69', '0x6a', '0x6b', '0x6c', '0x6d'];

function interpret() {
    var cont = window.interpreter['code'];
    var ins = cont[window.interpreter['cline']].split(' ');
    var op = ins[0].slice(0, 3);
    var cond = ins[0].slice(3);
    if(ins[0].length >= 5){
        for(k = 0; k < longmul_instr.length; k++){
            if(ins[0].slice(0, 5) == longmul_instr[k]){
                op = ins[0].slice(0, 5);
                cond = ins[0].slice(5);
                break;
            }
        }
    }
    var cond_exec = 1;
    pcval = (1024 + 4 * window.interpreter['cline']).toString(16);
    while(pcval.length < 4){
        pcval = '0' + pcval;
    } 
    window.interpreter['regvals'][15] = pcval;
    window.interpreter['cline'] += 1;
    if(cond != ''){
        if(cond.length > 2){
            cond_exec = processconditions(cond.slice(0, 2));
        }
        else if(cond.length == 2){
            cond_exec = processconditions(cond);
        }
        if(!cond_exec){
            return;
        }
    }
    for(k = 0; k < dataprotworeg.length; k++){
        if(op == dataprotworeg[k]){
            break;
        }
    }
    if(k < dataprotworeg.length){
        switch(op){
            case 'mov':
                dest = parseInt(ins[1].slice(1));
                op_one = parseInt(ins[2].slice(1));
                if(ins[2].slice(0, 1) == 'r'){
                    op_one = window.interpreter['regvals'][op_one];
                }
                if(ins.length > 3){
                    shift_val = parseInt(ins[4].slice(1));
                    if(ins[4].slice(0, 1) == 'r'){
                        shift_val = window.interpreter['regvals'][shift_val];
                    }
                    switch(ins[3]){
                        case 'lsl':
                            op_one = op_one << shift_val;
                            //alert(op_one + ' ' + shift_val);
                            break;
                        case 'lsr':
                            op_one = op_one >> shift_val;
                            break;
                        case 'asr':
                            op_one = op_one >> shift_val;
                            break;
                    }
                }
                window.interpreter['regvals'][dest] = op_one;
                if(cond.length > 2 || cond.length == 1){
                    if(window.interpreter['regvals'][dest] == 0){
                        window.interpreter['flags'].z = 1;
                        window.interpreter['flags'].n = 0;
                        window.interpreter['flags'].c = 0;
                        window.interpreter['flags'].v = 0;
                    }
                    if(window.interpreter['regvals'][dest] < 0){
                        window.interpreter['flags'].n = 1;
                        window.interpreter['flags'].z = 0;
                        window.interpreter['flags'].c = 0;
                        window.interpreter['flags'].v = 0;
                    }
                }
                instateRegisters();
                break;
            case 'mvn':
                dest = parseInt(ins[1].slice(1));
                op_one = parseInt(ins[2].slice(1));
                if(ins[2].slice(0, 1) == 'r'){
                    op_one = window.interpreter['regvals'][op_one];
                }
                if(ins.length > 3){
                    shift_val = parseInt(ins[4].slice(1));
                    if(ins[4].slice(0, 1) == 'r'){
                        shift_val = window.interpreter['regvals'][shift_val];
                    }
                    switch(ins[3]){
                        case 'lsl':
                            op_one = op_one << shift_val;
                            break;
                        case 'lsr':
                            op_one = op_one >> shift_val;
                            break;
                        case 'asr':
                            op_one = op_one >> shift_val;
                            break;
                    }
                }
                window.interpreter['regvals'][dest] = -op_one;
                if(cond.length > 2 || cond.length == 1){
                    if(window.interpreter['regvals'][dest] == 0){
                        window.interpreter['flags'].z = 1;
                        window.interpreter['flags'].n = 0;
                        window.interpreter['flags'].c = 0;
                        window.interpreter['flags'].v = 0;
                    }
                    if(window.interpreter['regvals'][dest] < 0){
                        window.interpreter['flags'].n = 1;
                        window.interpreter['flags'].z = 0;
                        window.interpreter['flags'].c = 0;
                        window.interpreter['flags'].v = 0;
                    }
                }
                instateRegisters();
                break;
            case 'cmp':
                op_one = window.interpreter['regvals'][parseInt(ins[1].slice(1))];
                op_two = parseInt(ins[2].slice(1));
                if(ins[2].slice(0, 1) == 'r'){
                    op_two = window.interpreter['regvals'][op_two];
                }
                res = 0;
                res = op_one - op_two;
                if(res == 0){
                    window.interpreter['flags'].z = 1;
                    window.interpreter['flags'].c = 1;
                    window.interpreter['flags'].n = 0;
                    window.interpreter['flags'].v = 0;
                }
                else if(res > 0){
                    window.interpreter['flags'].c = 1;
                    window.interpreter['flags'].n = 0;
                    window.interpreter['flags'].z = 0;
                    window.interpreter['flags'].v = 0;
                }
                else if(res < 0){
                    window.interpreter['flags'].n = 1;
                    window.interpreter['flags'].z = 0;
                    window.interpreter['flags'].c = 0;
                    window.interpreter['flags'].v = 0;
                }
                instateRegisters();
                break;
            case 'cmn':
                op_one = window.interpreter['regvals'][parseInt(ins[1].slice(1))];
                op_two = parseInt(ins[2].slice(1));
                if(ins[2].slice(0, 1) == 'r'){
                    op_two = window.interpreter['regvals'][op_two];
                }
                res = 0;
                res = op_two - op_one;
                if(res == 0){
                    window.interpreter['flags'].z = 1;
                    window.interpreter['flags'].c = 1;
                    window.interpreter['flags'].n = 0;
                    window.interpreter['flags'].v = 0;
                }
                else if(res > 0){
                    window.interpreter['flags'].c = 1;
                    window.interpreter['flags'].n = 0;
                    window.interpreter['flags'].z = 0;
                    window.interpreter['flags'].v = 0;
                }
                else if(res < 0){
                    window.interpreter['flags'].n = 1;
                    window.interpreter['flags'].z = 0;
                    window.interpreter['flags'].c = 0;
                    window.interpreter['flags'].v = 0;
                }
                instateRegisters();
                break;
            case 'clz':
                dest = parseInt(ins[1].slice(1));
                op_one = window.interpreter['regvals'][parseInt(ins[2].slice(1))];
                window.interpreter['regvals'][dest] = 32 - parseInt((op_one.toString(2)).length);
                window.interpreter.instate(window.interpreter['regvals'], window.interpreter['flags']);
                instateRegisters();
                break;
            case 'tst':
                op_one = window.interpreter['regvals'][parseInt(ins[1].slice(1))];
                op_two = parseInt(ins[2].slice(1));
                if(ins[2].search('r') != -1){
                    op_two = window.interpreter['regvals'][op_two];
                }
                res = 0;
                res = op_one & op_two;
                if(res == 0){
                    window.interpreter['flags'].z = 1;
                    window.interpreter['flags'].n = 0;
                    window.interpreter['flags'].c = 0;
                    window.interpreter['flags'].v = 0;
                }
                else if(res < 0){
                    window.interpreter['flags'].z = 0;
                    window.interpreter['flags'].n = 1;
                    window.interpreter['flags'].c = 0;
                    window.interpreter['flags'].v = 0;
                }
                else{
                    window.interpreter['flags'].z = 0;
                    window.interpreter['flags'].n = 0;
                    window.interpreter['flags'].c = 0;
                    window.interpreter['flags'].v = 0;
                }
                instateRegisters();
                break;
            case 'teq':
                op_one = window.interpreter['regvals'][parseInt(ins[1].slice(1))];
                op_two = parseInt(ins[2].slice(1));
                if(ins[2].search('r') != -1){
                    op_two = window.interpreter['regvals'][op_two];
                }
                res = 0;
                res = op_one ^ op_two;
                if(res == 0){
                    window.interpreter['flags'].z = 1;
                    window.interpreter['flags'].n = 0;
                    window.interpreter['flags'].c = 0;
                    window.interpreter['flags'].v = 0;
                }
                else if(res < 0){
                    window.interpreter['flags'].z = 0;
                    window.interpreter['flags'].n = 1;
                    window.interpreter['flags'].c = 0;
                    window.interpreter['flags'].v = 0;
                }
                else{
                    window.interpreter['flags'].z = 0;
                    window.interpreter['flags'].n = 0;
                    window.interpreter['flags'].c = 0;
                    window.interpreter['flags'].v = 0;
                }
                instateRegisters();
                break;
        }
        return;
    }
    for(k = 0; k < dataprocessing.length; k++){
        if(op == dataprocessing[k]){
            break;
        }
    }
    if(k < dataprocessing.length){
        switch(op){
            case 'add':
                dest = parseInt(ins[1].slice(1));
                op_one = window.interpreter['regvals'][parseInt(ins[2].slice(1))];
                op_two = parseInt(ins[3].slice(1));
                if(ins[3].slice(0, 1) == 'r'){
                    op_two = window.interpreter['regvals'][op_two];
                }
                if(ins.length > 4){
                    shift_val = parseInt(ins[5].slice(1));
                    if(ins[5].slice(0, 1) == 'r'){
                        shift_val = window.interpreter['regvals'][shift_val];
                    }
                    switch(ins[4]){
                        case 'lsl':
                            op_two = op_two << shift_val;
                            break;
                        case 'lsr':
                            op_two = op_two >> shift_val;
                            break;
                        case 'asr':
                            op_two = op_two >> shift_val;
                            break;
                    }
                }
                window.interpreter['regvals'][dest] = op_one + op_two;
                if(window.interpreter['regvals'][dest].toString(2).length > 32){
                    extend = window.interpreter['regvals'][dest].toString(2).length - 32;
                    window.interpreter['regvals'][dest] = window.interpreter['regvals'][dest].slice(extend);
                    if(cond.length == 3 || cond.length == 1){
                        window.interpreter['flags'].c = 1;
                    }
                }
                else{
                    if(cond.length == 3 || cond.length == 1){
                        window.interpreter['flags'].c = 0;
                    }
                }
                if(window.interpreter['regvals'][dest] == 0 && (cond.length == 3 || cond.length == 1)){
                    window.interpreter['flags'].z = 1;
                }
                else{
                    if(cond.length == 3 || cond.length == 1){
                        window.interpreter['flags'].z = 0;
                    }
                }
                if(cond.length == 3 || cond.length == 1){
                    window.interpreter['flags'].n = 0;
                    window.interpreter['flags'].v = 0;
                }
                instateRegisters();
                break;
            case 'adc':
                dest = parseInt(ins[1].slice(1));
                op_one = window.interpreter['regvals'][parseInt(ins[2].slice(1))];
                op_two = parseInt(ins[3].slice(1));
                if(ins[3].slice(0, 1) == 'r'){
                    op_two = window.interpreter['regvals'][op_two];
                }
                if(ins.length > 4){
                    shift_val = parseInt(ins[5].slice(1));
                    if(ins[5].slice(0, 1) == 'r'){
                        shift_val = window.interpreter['regvals'][shift_val];
                    }
                    switch(ins[4]){
                        case 'lsl':
                            op_two = op_two << shift_val;
                            break;
                        case 'lsr':
                            op_two = op_two >> shift_val;
                            break;
                        case 'asr':
                            op_two = op_two >> shift_val;
                            break;
                    }
                }
                window.interpreter['regvals'][dest] = op_one + op_two;
                if(window.interpreter['flags'].c){
                    window.interpreter['regvals'][dest] += 1;
                }
                if(window.interpreter['regvals'][dest].toString(2).length > 32){
                    extend = window.interpreter['regvals'][dest].toString(2).length - 32;
                    window.interpreter['regvals'][dest] = window.interpreter['regvals'][dest].slice(extend);
                    if(cond.length == 3 || cond.length == 1){
                        window.interpreter['flags'].c = 1;
                    }
                }
                else{
                    if(cond.length == 3 || cond.length == 1){
                        window.interpreter['flags'].c = 0;
                    }
                }
                if(window.interpreter['regvals'][dest] == 0 && (cond.length == 3 || cond.length == 1)){
                    window.interpreter['flags'].z = 1;
                }
                else{
                    if(cond.length == 3 || cond.length == 1){
                        window.interpreter['flags'].z = 0;
                    }
                }
                if(cond.length == 3 || cond.length == 1){
                    window.interpreter['flags'].n = 0;
                    window.interpreter['flags'].v = 0;
                }
                instateRegisters();
                break;
            case 'sub':
                dest = parseInt(ins[1].slice(1));
                op_one = window.interpreter['regvals'][parseInt(ins[2].slice(1))];
                op_two = parseInt(ins[3].slice(1));
                if(ins[3].slice(0, 1) == 'r'){
                    op_two = window.interpreter['regvals'][op_two];
                }
                if(ins.length > 4){
                    shift_val = parseInt(ins[5].slice(1));
                    if(ins[5].slice(0, 1) == 'r'){
                        shift_val = window.interpreter['regvals'][shift_val];
                    }
                    switch(ins[4]){
                        case 'lsl':
                            op_two = op_two << shift_val;
                            break;
                        case 'lsr':
                            op_two = op_two >> shift_val;
                            break;
                        case 'asr':
                            op_two = op_two >> shift_val;
                            break;
                    }
                }
                window.interpreter['regvals'][dest] = op_one - op_two;
                if(window.interpreter['regvals'][dest].toString(2).length > 32){
                    extend = window.interpreter['regvals'][dest].toString(2).length - 32;
                    window.interpreter['regvals'][dest] = window.interpreter['regvals'][dest].slice(extend);
                    if(cond.length == 3 || cond.length == 1){
                        window.interpreter['flags'].c = 1;
                    }
                }
                else{
                    if(cond.length == 3 || cond.length == 1){
                        window.interpreter['flags'].c = 0;
                    }
                }
                if(window.interpreter['regvals'][dest] == 0 && (cond.length == 3 || cond.length == 1)){
                    window.interpreter['flags'].z = 1;
                }
                else{
                    if(cond.length == 3 || cond.length == 1){
                        window.interpreter['flags'].z = 0;
                    }
                }
                if(cond.length == 3 || cond.length == 1){
                    if(window.interpreter['regvals'][dest] < 0){
                        window.interpreter['flags'].n = 1;
                    }
                    else{
                        window.interpreter['flags'].n = 0;
                    }
                    window.interpreter['flags'].v = 0;
                }
                instateRegisters();
                break;
            case 'rsb':
                dest = parseInt(ins[1].slice(1));
                op_one = window.interpreter['regvals'][parseInt(ins[2].slice(1))];
                op_two = parseInt(ins[3].slice(1));
                if(ins[3].slice(0, 1) == 'r'){
                    op_two = window.interpreter['regvals'][op_two];
                }
                if(ins.length > 4){
                    shift_val = parseInt(ins[5].slice(1));
                    if(ins[5].slice(0, 1) == 'r'){
                        shift_val = window.interpreter['regvals'][shift_val];
                    }
                    switch(ins[4]){
                        case 'lsl':
                            op_two = op_two << shift_val;
                            break;
                        case 'lsr':
                            op_two = op_two >> shift_val;
                            break;
                        case 'asr':
                            op_two = op_two >> shift_val;
                            break;
                    }
                }
                window.interpreter['regvals'][dest] = op_two - op_one;
                if(window.interpreter['regvals'][dest].toString(2).length > 32){
                    extend = window.interpreter['regvals'][dest].toString(2).length - 32;
                    window.interpreter['regvals'][dest] = window.interpreter['regvals'][dest].slice(extend);
                    if(cond.length == 3 || cond.length == 1){
                        window.interpreter['flags'].c = 1;
                    }
                }
                else{
                    if(cond.length == 3 || cond.length == 1){
                        window.interpreter['flags'].c = 0;
                    }
                }
                if(window.interpreter['regvals'][dest] == 0 && (cond.length == 3 || cond.length == 1)){
                    window.interpreter['flags'].z = 1;
                }
                else{
                    if(cond.length == 3 || cond.length == 1){
                        window.interpreter['flags'].z = 0;
                    }
                }
                if(cond.length == 3 || cond.length == 1){
                    if(window.interpreter['regvals'][dest] < 0){
                        window.interpreter['flags'].n = 1;
                    }
                    else{
                        window.interpreter['flags'].n = 0;
                    }
                    window.interpreter['flags'].v = 0;
                }
                instateRegisters();
                break;
            case 'sbc':
                dest = parseInt(ins[1].slice(1));
                op_one = window.interpreter['regvals'][parseInt(ins[2].slice(1))];
                op_two = parseInt(ins[3].slice(1));
                if(ins[3].slice(0, 1) == 'r'){
                    op_two = window.interpreter['regvals'][op_two];
                }
                if(ins.length > 4){
                    shift_val = parseInt(ins[5].slice(1));
                    if(ins[5].slice(0, 1) == 'r'){
                        shift_val = window.interpreter['regvals'][shift_val];
                    }
                    switch(ins[4]){
                        case 'lsl':
                            op_two = op_two << shift_val;
                            break;
                        case 'lsr':
                            op_two = op_two >> shift_val;
                            break;
                        case 'asr':
                            op_two = op_two >> shift_val;
                            break;
                    }
                }
                window.interpreter['regvals'][dest] = op_one - op_two + window.interpreter['flags'].c - 1;
                if(window.interpreter['regvals'][dest].toString(2).length > 32){
                    extend = window.interpreter['regvals'][dest].toString(2).length - 32;
                    window.interpreter['regvals'][dest] = window.interpreter['regvals'][dest].slice(extend);
                    if(cond.length == 3 || cond.length == 1){
                        window.interpreter['flags'].c = 1;
                    }
                }
                else{
                    if(cond.length == 3 || cond.length == 1){
                        window.interpreter['flags'].c = 0;
                    }
                }
                if(window.interpreter['regvals'][dest] == 0 && (cond.length == 3 || cond.length == 1)){
                    window.interpreter['flags'].z = 1;
                }
                else{
                    if(cond.length == 3 || cond.length == 1){
                        window.interpreter['flags'].z = 0;
                    }
                }
                if(cond.length == 3 || cond.length == 1){
                    if(window.interpreter['regvals'][dest] < 0){
                        window.interpreter['flags'].n = 1;
                    }
                    else{
                        window.interpreter['flags'].n = 0;
                    }
                    window.interpreter['flags'].v = 0;
                }
                instateRegisters();
                break; 
            case 'rsc':
                dest = parseInt(ins[1].slice(1));
                op_one = window.interpreter['regvals'][parseInt(ins[2].slice(1))];
                op_two = parseInt(ins[3].slice(1));
                if(ins[3].slice(0, 1) == 'r'){
                    op_two = window.interpreter['regvals'][op_two];
                }
                if(ins.length > 4){
                    shift_val = parseInt(ins[5].slice(1));
                    if(ins[5].slice(0, 1) == 'r'){
                        shift_val = window.interpreter['regvals'][shift_val];
                    }
                    switch(ins[4]){
                        case 'lsl':
                            op_two = op_two << shift_val;
                            break;
                        case 'lsr':
                            op_two = op_two >> shift_val;
                            break;
                        case 'asr':
                            op_two = op_two >> shift_val;
                            break;
                    }
                }
                window.interpreter['regvals'][dest] = op_two - op_one + window.interpreter['flags'].c - 1;
                if(window.interpreter['regvals'][dest].toString(2).length > 32){
                    extend = window.interpreter['regvals'][dest].toString(2).length - 32;
                    window.interpreter['regvals'][dest] = window.interpreter['regvals'][dest].slice(extend);
                    if(cond.length == 3 || cond.length == 1){
                        window.interpreter['flags'].c = 1;
                    }
                }
                else{
                    if(cond.length == 3 || cond.length == 1){
                        window.interpreter['flags'].c = 0;
                    }
                }
                if(window.interpreter['regvals'][dest] == 0 && (cond.length == 3 || cond.length == 1)){
                    window.interpreter['flags'].z = 1;
                }
                else{
                    if(cond.length == 3 || cond.length == 1){
                        window.interpreter['flags'].z = 0;
                    }
                }
                if(cond.length == 3 || cond.length == 1){
                    if(window.interpreter['regvals'][dest] < 0){
                        window.interpreter['flags'].n = 1;
                    }
                    else{
                        window.interpreter['flags'].n = 0;
                    }
                    window.interpreter['flags'].v = 0;
                }
                instateRegisters();
                break; 
            case 'and':
                dest = parseInt(ins[1].slice(1));
                op_one = window.interpreter['regvals'][parseInt(ins[2].slice(1))];
                op_two = parseInt(ins[3].slice(1));
                if(ins[3].slice(0, 1) == 'r'){
                    op_two = window.interpreter['regvals'][op_two];
                }
                if(ins.length > 4){
                    shift_val = parseInt(ins[5].slice(1));
                    if(ins[5].slice(0, 1) == 'r'){
                        shift_val = window.interpreter['regvals'][shift_val];
                    }
                    switch(ins[4]){
                        case 'lsl':
                            op_two = op_two << shift_val;
                            break;
                        case 'lsr':
                            op_two = op_two >> shift_val;
                            break;
                        case 'asr':
                            op_two = op_two >> shift_val;
                            break;
                    }
                }
                window.interpreter['regvals'][dest] = op_one & op_two;
                if(window.interpreter['regvals'][dest].toString(2).length > 32){
                    extend = window.interpreter['regvals'][dest].toString(2).length - 32;
                    window.interpreter['regvals'][dest] = window.interpreter['regvals'][dest].slice(extend);
                    if(cond.length == 3 || cond.length == 1){
                        window.interpreter['flags'].c = 1;
                    }
                }
                else{
                    if(cond.length == 3 || cond.length == 1){
                        window.interpreter['flags'].c = 0;
                    }
                }
                if(window.interpreter['regvals'][dest] == 0 && (cond.length == 3 || cond.length == 1)){
                    window.interpreter['flags'].z = 1;
                }
                else{
                    if(cond.length == 3 || cond.length == 1){
                        window.interpreter['flags'].z = 0;
                    }
                }
                if(cond.length == 3 || cond.length == 1){
                    if(window.interpreter['regvals'][dest] < 0){
                        window.interpreter['flags'].n = 1;
                    }
                    else{
                        window.interpreter['flags'].n = 0;
                    }
                    window.interpreter['flags'].v = 0;
                }
                instateRegisters();
                break;
            case 'orr':
                dest = parseInt(ins[1].slice(1));
                op_one = window.interpreter['regvals'][parseInt(ins[2].slice(1))];
                op_two = parseInt(ins[3].slice(1));
                if(ins[3].slice(0, 1) == 'r'){
                    op_two = window.interpreter['regvals'][op_two];
                }
                if(ins.length > 4){
                    shift_val = parseInt(ins[5].slice(1));
                    if(ins[5].slice(0, 1) == 'r'){
                        shift_val = window.interpreter['regvals'][shift_val];
                    }
                    switch(ins[4]){
                        case 'lsl':
                            op_two = op_two << shift_val;
                            break;
                        case 'lsr':
                            op_two = op_two >> shift_val;
                            break;
                        case 'asr':
                            op_two = op_two >> shift_val;
                            break;
                    }
                }
                window.interpreter['regvals'][dest] = op_one | op_two;
                if(window.interpreter['regvals'][dest].toString(2).length > 32){
                    extend = window.interpreter['regvals'][dest].toString(2).length - 32;
                    window.interpreter['regvals'][dest] = window.interpreter['regvals'][dest].slice(extend);
                    if(cond.length == 3 || cond.length == 1){
                        window.interpreter['flags'].c = 1;
                    }
                }
                else{
                    if(cond.length == 3 || cond.length == 1){
                        window.interpreter['flags'].c = 0;
                    }
                }
                if(window.interpreter['regvals'][dest] == 0 && (cond.length == 3 || cond.length == 1)){
                    window.interpreter['flags'].z = 1;
                }
                else{
                    if(cond.length == 3 || cond.length == 1){
                        window.interpreter['flags'].z = 0;
                    }
                }
                if(cond.length == 3 || cond.length == 1){
                    if(window.interpreter['regvals'][dest] < 0){
                        window.interpreter['flags'].n = 1;
                    }
                    else{
                        window.interpreter['flags'].n = 0;
                    }
                    window.interpreter['flags'].v = 0;
                }
                instateRegisters();
                break;
            case 'eor':
                dest = parseInt(ins[1].slice(1));
                op_one = window.interpreter['regvals'][parseInt(ins[2].slice(1))];
                op_two = parseInt(ins[3].slice(1));
                if(ins[3].slice(0, 1) == 'r'){
                    op_two = window.interpreter['regvals'][op_two];
                }
                if(ins.length > 4){
                    shift_val = parseInt(ins[5].slice(1));
                    if(ins[5].slice(0, 1) == 'r'){
                        shift_val = window.interpreter['regvals'][shift_val];
                    }
                    switch(ins[4]){
                        case 'lsl':
                            op_two = op_two << shift_val;
                            break;
                        case 'lsr':
                            op_two = op_two >> shift_val;
                            break;
                        case 'asr':
                            op_two = op_two >> shift_val;
                            break;
                    }
                }
                window.interpreter['regvals'][dest] = op_one ^ op_two;
                if(window.interpreter['regvals'][dest].toString(2).length > 32){
                    extend = window.interpreter['regvals'][dest].toString(2).length - 32;
                    window.interpreter['regvals'][dest] = window.interpreter['regvals'][dest].slice(extend);
                    if(cond.length == 3 || cond.length == 1){
                        window.interpreter['flags'].c = 1;
                    }
                }
                else{
                    if(cond.length == 3 || cond.length == 1){
                        window.interpreter['flags'].c = 0;
                    }
                }
                if(window.interpreter['regvals'][dest] == 0 && (cond.length == 3 || cond.length == 1)){
                    window.interpreter['flags'].z = 1;
                }
                else{
                    if(cond.length == 3 || cond.length == 1){
                        window.interpreter['flags'].z = 0;
                    }
                }
                if(cond.length == 3 || cond.length == 1){
                    if(window.interpreter['regvals'][dest] < 0){
                        window.interpreter['flags'].n = 1;
                    }
                    else{
                        window.interpreter['flags'].n = 0;
                    }
                    window.interpreter['flags'].v = 0;
                }
                instateRegisters();
                break;
            case 'bic':
                dest = parseInt(ins[1].slice(1));
                op_one = window.interpreter['regvals'][parseInt(ins[2].slice(1))];
                op_two = parseInt(ins[3].slice(1));
                if(ins[3].slice(0, 1) == 'r'){
                    op_two = window.interpreter['regvals'][op_two];
                }
                if(ins.length > 4){
                    shift_val = parseInt(ins[5].slice(1));
                    if(ins[5].slice(0, 1) == 'r'){
                        shift_val = window.interpreter['regvals'][shift_val];
                    }
                    switch(ins[4]){
                        case 'lsl':
                            op_two = op_two << shift_val;
                            break;
                        case 'lsr':
                            op_two = op_two >> shift_val;
                            break;
                        case 'asr':
                            op_two = op_two >> shift_val;
                            break;
                    }
                }
                window.interpreter['regvals'][dest] = op_one & (~op_two);
                if(window.interpreter['regvals'][dest].toString(2).length > 32){
                    extend = window.interpreter['regvals'][dest].toString(2).length - 32;
                    window.interpreter['regvals'][dest] = window.interpreter['regvals'][dest].slice(extend);
                    if(cond.length == 3 || cond.length == 1){
                        window.interpreter['flags'].c = 1;
                    }
                }
                else{
                    if(cond.length == 3 || cond.length == 1){
                        window.interpreter['flags'].c = 0;
                    }
                }
                if(window.interpreter['regvals'][dest] == 0 && (cond.length == 3 || cond.length == 1)){
                    window.interpreter['flags'].z = 1;
                }
                else{
                    if(cond.length == 3 || cond.length == 1){
                        window.interpreter['flags'].z = 0;
                    }
                }
                if(cond.length == 3 || cond.length == 1){
                    if(window.interpreter['regvals'][dest] < 0){
                        window.interpreter['flags'].n = 1;
                    }
                    else{
                        window.interpreter['flags'].n = 0;
                    }
                    window.interpreter['flags'].v = 0;
                }
                instateRegisters();
                break;
        }
        return;   
    }
    for(k = 0; k < mult_instr.length; k++){
        if(op == mult_instr[k]){
            break;
        }
    }
    if(k < mult_instr.length){
        switch(op){
            case 'mul':
                dest = parseInt(ins[1].slice(1));
                op_one = window.interpreter['regvals'][parseInt(ins[2].slice(1))];
                op_two = parseInt(ins[3].slice(1));
                if(ins[3].slice(0, 1) == 'r'){
                    op_two = window.interpreter['regvals'][op_two];
                }
                window.interpreter['regvals'][dest] = op_one * op_two;
                if(window.interpreter['regvals'][dest].toString(2).length > 32){
                    extend = window.interpreter['regvals'][dest].toString(2).length - 32;
                    window.interpreter['regvals'][dest] = window.interpreter['regvals'][dest].slice(extend);
                    if(cond.length == 3 || cond.length == 1){
                        window.interpreter['flags'].c = 1;
                    }
                }
                else{
                    if(cond.length == 3 || cond.length == 1){
                        window.interpreter['flags'].c = 0;
                    }
                }
                if(window.interpreter['regvals'][dest] == 0 && (cond.length == 3 || cond.length == 1)){
                    window.interpreter['flags'].z = 1;
                }
                else{
                    if(cond.length == 3 || cond.length == 1){
                        window.interpreter['flags'].z = 0;
                    }
                }
                if(cond.length == 3 || cond.length == 1){
                    window.interpreter['flags'].n = 0;
                    window.interpreter['flags'].v = 0;
                }
                instateRegisters();
                break;
            case 'mla':
                dest = parseInt(ins[1].slice(1));
                op_one = window.interpreter['regvals'][parseInt(ins[2].slice(1))];
                op_two = window.interpreter['regvals'][parseInt(ins[3].slice(1))];
                op_three = window.interpreter['regvals'][parseInt(ins[4].slice(1))];
                window.interpreter['regvals'][dest] = op_one * op_two + op_three;
                if(window.interpreter['regvals'][dest].toString(2).length > 32){
                    extend = window.interpreter['regvals'][dest].toString(2).length - 32;
                    window.interpreter['regvals'][dest] = window.interpreter['regvals'][dest].slice(extend);
                    if(cond.length == 3 || cond.length == 1){
                        window.interpreter['flags'].c = 1;
                    }
                }
                else{
                    if(cond.length == 3 || cond.length == 1){
                        window.interpreter['flags'].c = 0;
                    }
                }
                if(window.interpreter['regvals'][dest] == 0 && (cond.length == 3 || cond.length == 1)){
                    window.interpreter['flags'].z = 1;
                }
                else{
                    if(cond.length == 3 || cond.length == 1){
                        window.interpreter['flags'].z = 0;
                    }
                }
                if(cond.length == 3 || cond.length == 1){
                    window.interpreter['flags'].n = 0;
                    window.interpreter['flags'].v = 0;
                }
                instateRegisters();
                break;
        }
        return;
    }
    for(k = 0; k < longmul_instr.length; k++){
        if(op == longmul_instr[k]){
            break;
        }
    }
    if(k < longmul_instr.length){
        switch(op){
            case 'smull':
                destlo = parseInt(ins[1].slice(1));
                desthi = parseInt(ins[2].slice(1));
                op_one = window.interpreter['regvals'][parseInt(ins[3].slice(1))];
                op_two = window.interpreter['regvals'][parseInt(ins[4].slice(1))];
                res = 0;
                res = op_one * op_two;
                res = res.toString(2);
                if(res.length > 64){
                    window.interpreter['regvals'][destlo] = parseInt(res.slice(32), 2);
                    window.interpreter['regvals'][desthi] = parseInt(res.slice((64 - res.length), 32), 2);
                    if(cond.length == 3 || cond.length == 1){
                        window.interpreter['flags'].c = 1;
                    }
                }
                else{
                    while(res.length < 64){
                        res = '0' + res;
                    }
                    window.interpreter['regvals'][desthi] = parseInt(res.slice(0, 32), 2);
                    window.interpreter['regvals'][destlo] = parseInt(res.slice(32), 2);
                    if(cond.length == 3 || cond.length == 1){
                        window.interpreter['flags'].c = 0;
                    }
                }
                if(window.interpreter['regvals'][destlo] == 0 && window.interpreter['regvals'][desthi] == 0 && (cond.length == 3 || cond.length == 1)){
                    window.interpreter['flags'].z = 1;
                }
                else{
                    if(cond.length == 3 || cond.length == 1){
                        window.interpreter['flags'].z = 0;
                    }
                }
                if(cond.length == 3 || cond.length == 1){
                    window.interpreter['flags'].n = 0;
                    window.interpreter['flags'].v = 0;
                }
                instateRegisters();
                break;
            case 'umull':
                destlo = parseInt(ins[1].slice(1));
                desthi = parseInt(ins[2].slice(1));
                op_one = window.interpreter['regvals'][parseInt(ins[3].slice(1))];
                op_two = window.interpreter['regvals'][parseInt(ins[4].slice(1))];
                res = 0;
                res = op_one * op_two;
                res = res.toString(2);
                if(res.length > 64){
                    window.interpreter['regvals'][destlo] = parseInt(res.slice(32), 2);
                    window.interpreter['regvals'][desthi] = parseInt(res.slice((64 - res.length), 32), 2);
                    if(cond.length == 3 || cond.length == 1){
                        window.interpreter['flags'].c = 1;
                    }
                }
                else{
                    while(res.length < 64){
                        res = '0' + res;
                    }
                    window.interpreter['regvals'][desthi] = parseInt(res.slice(0, 32), 2);
                    window.interpreter['regvals'][destlo] = parseInt(res.slice(32), 2);
                    if(cond.length == 3 || cond.length == 1){
                        window.interpreter['flags'].c = 0;
                    }
                }
                if(window.interpreter['regvals'][destlo] == 0 && window.interpreter['regvals'][desthi] == 0 && (cond.length == 3 || cond.length == 1)){
                    window.interpreter['flags'].z = 1;
                }
                else{
                    if(cond.length == 3 || cond.length == 1){
                        window.interpreter['flags'].z = 0;
                    }
                }
                if(cond.length == 3 || cond.length == 1){
                    window.interpreter['flags'].n = 0;
                    window.interpreter['flags'].v = 0;
                }
                instateRegisters();
                break;
            case 'umlal':
                destlo = parseInt(ins[1].slice(1));
                desthi = parseInt(ins[2].slice(1));
                op_one = window.interpreter['regvals'][parseInt(ins[3].slice(1))];
                op_two = window.interpreter['regvals'][parseInt(ins[4].slice(1))];
                prevres = window.interpreter['regvals'][desthi].toString(2) + window.interpreter['regvals'][destlo].toString(2);
                prevres = parseInt(prevres, 2);
                res = 0;
                res = op_one * op_two + prevres;
                res = res.toString(2);
                if(res.length > 64){
                    window.interpreter['regvals'][destlo] = parseInt(res.slice(32), 2);
                    window.interpreter['regvals'][desthi] = parseInt(res.slice((64 - res.length), 32), 2);
                    if(cond.length == 3 || cond.length == 1){
                        window.interpreter['flags'].c = 1;
                    }
                }
                else{
                    while(res.length < 64){
                        res = '0' + res;
                    }
                    window.interpreter['regvals'][desthi] = parseInt(res.slice(0, 32), 2);
                    window.interpreter['regvals'][destlo] = parseInt(res.slice(32), 2);
                    if(cond.length == 3 || cond.length == 1){
                        window.interpreter['flags'].c = 0;
                    }
                }
                if(window.interpreter['regvals'][destlo] == 0 && window.interpreter['regvals'][desthi] == 0 && (cond.length == 3 || cond.length == 1)){
                    window.interpreter['flags'].z = 1;
                }
                else{
                    if(cond.length == 3 || cond.length == 1){
                        window.interpreter['flags'].z = 0;
                    }
                }
                if(cond.length == 3 || cond.length == 1){
                    window.interpreter['flags'].n = 0;
                    window.interpreter['flags'].v = 0;
                }
                instateRegisters();
                break;
            case 'smlal':
                destlo = parseInt(ins[1].slice(1));
                desthi = parseInt(ins[2].slice(1));
                op_one = window.interpreter['regvals'][parseInt(ins[3].slice(1))];
                op_two = window.interpreter['regvals'][parseInt(ins[4].slice(1))];
                prevres = window.interpreter['regvals'][desthi].toString(2) + window.interpreter['regvals'][destlo].toString(2);
                prevres = parseInt(prevres, 2);
                res = 0;
                res = op_one * op_two + prevres;
                res = res.toString(2);
                if(res.length > 64){
                    window.interpreter['regvals'][destlo] = parseInt(res.slice(32), 2);
                    window.interpreter['regvals'][desthi] = parseInt(res.slice((64 - res.length), 32), 2);
                    if(cond.length == 3 || cond.length == 1){
                        window.interpreter['flags'].c = 1;
                    }
                }
                else{
                    while(res.length < 64){
                        res = '0' + res;
                    }
                    window.interpreter['regvals'][desthi] = parseInt(res.slice(0, 32), 2);
                    window.interpreter['regvals'][destlo] = parseInt(res.slice(32), 2);
                    if(cond.length == 3 || cond.length == 1){
                        window.interpreter['flags'].c = 0;
                    }
                }
                if(window.interpreter['regvals'][destlo] == 0 && window.interpreter['regvals'][desthi] == 0 && (cond.length == 3 || cond.length == 1)){
                    window.interpreter['flags'].z = 1;
                }
                else{
                    if(cond.length == 3 || cond.length == 1){
                        window.interpreter['flags'].z = 0;
                    }
                }
                if(cond.length == 3 || cond.length == 1){
                    window.interpreter['flags'].n = 0;
                    window.interpreter['flags'].v = 0;
                }
                instateRegisters();
                break;
        }
        return;
    }
}

function run(lines) {
    for (var i = 0; i < lines.length; i++) {
        interpret(lines[i]);
    }
}
function processconditions(cc) {
    var conditioncodes = ['eq', 'ne', 'cs', 'hs', 'cc', 'lo', 'mi', 'pl', 'vs', 'vc', 'hi', 'ls', 'ge', 'lt', 'gt', 'le', 'al'];

    var p = conditioncodes.findIndex(function (c) { return c == cc });

    switch (p) {
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

var dataprocessing = ['and', 'add', 'sub', 'rsb', 'adc', 'sbc', 'rsc', 'orr', 'eor', 'bic', 'clz', 'tst', 'teq']
var dataprotworeg = ['mov', 'mvn', 'cmp', 'cmn']
var memoryaccess = ['ldr', 'str', 'ldm', 'stm']
var mult_instr = ['mul', 'mla', 'mls']
var longmul_instr = ['umull', 'umlal', 'smull', 'smlal']
var controlflow = ['bl', 'b']       //important : has to be arranged in descending order of length
var swiins = ['0x00', '0x02', '0x011', '0x12', '0x13', '0x66', '0x68', '0x69', '0x6a', '0x6b', '0x6c', '0x6d'];

function interpret(line) {
    var interpreter = window.interpreter;

    //Identify, process and execute :-

    //SWI

    //Data Processing

    //Memory Access

    //Multiply

    //Long Multiply

    //Control Flow

    if (interpreter.deci) {
        interpreter.copier();
    }
    else if (interpreter.bin) {
        interpreter.copier();
        interpreter.bindriver();
    }
    else if (interpreter.hexa) {
        interpreter.copier();
        interpreter.hexdriver();
    }
}

function run(lines) {
    for (var i = 0; i < lines.length; i++) {
        interpret(lines[i]);
    }
}
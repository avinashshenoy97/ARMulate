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
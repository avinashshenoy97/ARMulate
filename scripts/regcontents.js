var regvals = [], decreg = [];
regvals.size = 32;
var flags = new Object();
var conv = new Object();
for(var x = 0 ; x < 10 ; x++) {
	conv[x] = (x + "");
}
for(x = "0" ; x < "9" ; x++) {
	conv[x] = parseInt(x);
}
conv[10] = "A";
conv[11] = "B";
conv[12] = "C";
conv[13] = "D";
conv[14] = "E";
conv[15] = "F";
conv["A"] = 10;
conv["B"] = 11;
conv["C"] = 12;
conv["D"] = 13;
conv["E"] = 14;
conv["F"] = 15;

flags["n"] = flags["c"] = flags["z"] = flags["v"] = 0;

var deci = true, bin = false, hexa = false;

function instate(regvals, flags) {				//put regvals in regbank on UI and maintain decimal regvals
	//alert("YOLO");
	//alert(regvals);
	for(var x = 0 ; x < 16 ; x++) {
		var d = document.getElementById("r" + x + "val");
		d.innerHTML = (regvals[x]);
	}

	for(var x in flags) {
		var d = document.getElementById(x + "flag");
		d.innerHTML = flags[x];
	}
}

function strrev(s) {					//return reverse string
	var ns = "";
	for(var x = 0 ; x < s.length ; x++) {
		ns += s[s.length - 1 - x];
	}

	return ns;
}

function todec(n, base) {				//convert from base to decimal
	var dec = 0;
	var p = 0;

	for(x = n.length-1 ; x >= 0 ; x--) {
		dec += conv[n[x]] * Math.pow(base, p++);
	}

	return dec;
}

function tobase(n, base) {			//convert decimal to base
	if(n == 0)
		return "0";

	var b = "";
	while(n != 0) {
		b = b + conv[(n%base)];
		n = Math.floor(n/base);
	}

	b = strrev(b);
	return b;
}

function decdriver() {
	deci = window.deci;
	bin = window.bin;
	hexa = window.hexa;
	
	var btn = document.getElementById("dec");
	btn.style.display = "none";
	btn.nextElementSibling.style.display = "inline";	//disable the button

	var dec = 0;
	if(bin) {
		var btn = document.getElementById("bin");
		btn.style.display = "inline";
		btn.nextElementSibling.style.display = "none";	//enable the button

		for(var x = 0 ; x < 13 ; x++) {
			regvals[x] = parseInt(regvals[x], 2);
		}
		instate(regvals, flags);
	}
	else if(hexa) {
		var btn = document.getElementById("hex");
		btn.style.display = "inline";
		btn.nextElementSibling.style.display = "none";	//enable the button

		for(var x = 0 ; x < 13 ; x++) {
			regvals[x] = parseInt(regvals[x].slice(2), 16);
		}
		instate(regvals, flags);
	}

	window.interpreter.bin = window.interpreter.hexa = false;
	window.interpreter.deci = true;
}

function bindriver() { 
	deci = window.deci;
	bin = window.bin;
	hexa = window.hexa;
	
	var btn = document.getElementById("bin");
	btn.style.display = "none";
	btn.nextElementSibling.style.display = "inline";	//disable the button

	if(hexa) {
		var btn = document.getElementById("hex");
		btn.style.display = "inline";
		btn.nextElementSibling.style.display = "none";	//enable the button

		for(var x = 0 ; x < 13 ; x++) {
			regvals[x] = parseInt(regvals[x].slice(2), 16);
		}
		deci = true;
	}

	if(deci) {
		var btn = document.getElementById("dec");
		btn.style.display = "inline";
		btn.nextElementSibling.style.display = "none";	//enable the button

		var x = 0;
		while(x < 13) {
			regvals[x] = (regvals[x] >>> 0).toString(2);
			if(regvals[x].length != regvals.size)
				regvals[x] = extend(regvals[x], regvals.size);
			x += 1;
		}
		instate(regvals, flags);
	}

	window.interpreter.deci = window.interpreter.hexa = false;
	window.interpreter.bin = true;
}

function hexdriver() {
	deci = window.deci;
	bin = window.bin;
	hexa = window.hexa;
	
	var btn = document.getElementById("hex");
	btn.style.display = "none";
	btn.nextElementSibling.style.display = "inline";	//disable the button

	if(bin) {
		var btn = document.getElementById("bin");
		btn.style.display = "inline";
		btn.nextElementSibling.style.display = "none";	//enable the button

		for(var x = 0 ; x < 13 ; x++) {
			regvals[x] = parseInt(regvals[x], 2);
		}
		deci = true;
	}

	if(deci) {
		var btn = document.getElementById("dec");
		btn.style.display = "inline";
		btn.nextElementSibling.style.display = "none";	//enable the button

		for(var x = 0 ; x < 13 ; x++) {
			regvals[x] = "0x" + (regvals[x]).toString(16).toUpperCase();
		}
		instate(regvals, flags);
	}

	window.interpreter.deci = window.interpreter.bin = false;
	window.interpreter.hexa = true;
}

function copy() {
	for(var x = 0 ; x < 16 ; x++) {
		regvals[x] = decreg[x];
	}
}

function decinstate() {				//put regvals in regbank on UI and maintain decimal regvals
	for(var x = 0 ; x < 16 ; x++) {
		if(deci) {
			decreg[x] = regvals[x];
		}
		else if(bin) {
			decreg[x] = todec(regvals[x], 2);
		}
		else if(hexa) {
			decreg[x] = todec(regvals[x], 16);
		}
	}
}

for(var x = 0 ; x < 16 ; x++)
	regvals[x] = 0;

regvals[13] = "0x" + (5000).toString(16);

decinstate();
instate(regvals, flags);

document.getElementById("dec").addEventListener("click", decdriver, false);
document.getElementById("bin").addEventListener("click", bindriver, false);
document.getElementById("hex").addEventListener("click", hexdriver, false);
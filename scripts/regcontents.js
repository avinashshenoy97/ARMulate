var regvals = [], decreg = [];
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

/*function extend(n) {		//pad 0s to string or number to length 8
	var s = "" + n;
	while(s.length != 8)
		s = "0" + s;

	return s;
}

function concise(s) {		//un-pad 0s
	var n = s;
	while(n[0] != "0" || n.length == 1)
		n = n.slice(1);
}*/

function instate() {				//put regvals in regbank on UI and maintain decimal regvals
	for(var x = 0 ; x < 16 ; x++) {
		var d = document.getElementById("r" + x + "val");
		d.innerHTML = (regvals[x]);
		
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
	var btn = document.getElementById("dec");
	btn.style.display = "none";
	btn.nextElementSibling.style.display = "inline";	//disable the button

	var dec = 0;
	if(bin) {
		var btn = document.getElementById("bin");
		btn.style.display = "inline";
		btn.nextElementSibling.style.display = "none";	//enable the button

		for(var x = 0 ; x < 16 ; x++) {
			regvals[x] = todec(regvals[x], 2);
		}
		instate();
	}
	else if(hex) {
		var btn = document.getElementById("hex");
		btn.style.display = "inline";
		btn.nextElementSibling.style.display = "none";	//enable the button

		for(var x = 0 ; x < 16 ; x++) {
			regvals[x] = todec(regvals[x].slice(2), 16);
		}
		instate();
	}

	bin = hexa = false;
	deci = true;
}

function bindriver() {
	var btn = document.getElementById("bin");
	btn.style.display = "none";
	btn.nextElementSibling.style.display = "inline";	//disable the button

	if(hex) {
		var btn = document.getElementById("hex");
		btn.style.display = "inline";
		btn.nextElementSibling.style.display = "none";	//enable the button

		for(var x = 0 ; x < 16 ; x++) {
			regvals[x] = todec(regvals[x].slice(2), 16);
		}
		deci = true;
	}

	if(deci) {
		var btn = document.getElementById("dec");
		btn.style.display = "inline";
		btn.nextElementSibling.style.display = "none";	//enable the button

		var x = 0;
		while(x < 16) {
			regvals[x] = tobase(regvals[x], 2);
			x += 1;
		}
		instate();
	}

	deci = hexa = false;
	bin = true;
}

function hexdriver() {
	var btn = document.getElementById("hex");
	btn.style.display = "none";
	btn.nextElementSibling.style.display = "inline";	//disable the button

	if(bin) {
		var btn = document.getElementById("bin");
		btn.style.display = "inline";
		btn.nextElementSibling.style.display = "none";	//enable the button

		for(var x = 0 ; x < 16 ; x++) {
			regvals[x] = todec(regvals[x], 2);
		}
		deci = true;
	}

	if(deci) {
		var btn = document.getElementById("dec");
		btn.style.display = "inline";
		btn.nextElementSibling.style.display = "none";	//enable the button

		for(var x = 0 ; x < 16 ; x++) {
			regvals[x] = "0x" + tobase(regvals[x], 16);
		}
		instate();
	}

	deci = bin = false;
	hexa = true;
}

function copy() {
	for(var x = 0 ; x < 16 ; x++) {
		regvals[x] = decreg[x];
	}
}

for(var x = 0 ; x < 16 ; x++)
	regvals[x] = 0;

instate();

document.getElementById("dec").addEventListener("click", decdriver, false);
document.getElementById("bin").addEventListener("click", bindriver, false);
document.getElementById("hex").addEventListener("click", hexdriver, false);
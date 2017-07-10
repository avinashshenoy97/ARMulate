function extend(n, toLen) {		//pad 0s to string or number to length 8
	var s = "" + n;
	while(s.length != toLen)
		s = "0" + s;

	return s;
}

function concise(s) {		//un-pad 0s
	var n = s;
	while(n[0] != "0" || n.length == 1)
		n = n.slice(1);
}

function createMemoryComponent() {
	var tr = document.createElement("tr");
	tr.appendChild(document.createElement("td"));
	tr.appendChild(document.createElement("td"));

	tr.children[0].className = "dcol1";
	tr.children[1].className = "dcol2";
	tr.children[1].appendChild(document.createElement("div"))
	tr.children[1].children[0].className = "memdata";			//div class name

	return tr;
}

//Any bit view for memory contents
function instateMemory(bitView) {
	mem = window.mem;
	mem.currBitView = bitView;
	var d = document.getElementById("data");	//d has first and only child tbody

	d.children[0].remove();
	d.appendChild(document.createElement("tbody"));
	d = d.children[0];									//d is tbody

	d.appendChild(createMemoryComponent());

	var w = 0;
	var oflow = d.children[0];	//first tr
	oflow = oflow.children[1];	//second column
	oflow = oflow.children[0];	//the div of memory data
	oflow.style.width = oflow.clientWidth;
	oflow.innerHTML = "";

	switch(bitView) {				//select widest character to check overflow
		case 1:
			checker = "00000000";
			break;

		case 8:
			checker = "WWWWWWWW";
			break;
	}
	
	while(oflow.offsetWidth >= oflow.scrollWidth && oflow.clientHeight >= oflow.scrollHeight) {	//detect overflow
		console.log(oflow.offsetWidth + " " + oflow.scrollWidth + " " + oflow.clientHeight + " " + oflow.scrollHeight)
		oflow.innerHTML += checker + "<pre>  </pre>";
		w += 10;
		console.log(w)
	}
	
	mem.width = w - 12;
	console.log(mem.width)
	d.children[0].remove();		//remove the first tr

	//start filling memory tables with known width
	var r = 0;
	for(var i = 0 ; i < mem.size ; i++) {
		d.appendChild(createMemoryComponent());
		d.children[r].children[0].innerHTML = i + "";			//set byte address
		d.children[r].children[0].id = "a" + i;
		d.children[r].children[1].id = "b" + i;
		var memdiv = d.children[r++].children[1].children[0];	//the div for the data
		memdiv.style.width = memdiv.clientWidth;
		var s = "";

		for(var j = 1 ; j <= mem.width && i < mem.size; j++) {
			var num = "";
			var ch = false;
			for(var k = 0 ; k < bitView && i < mem.size ; k++) {			//grab 'bitView' no of bits
				num += Number(Boolean(mem[i++]));
				ch = ch || Boolean(mem.changed[i-1]);
			}

			switch(bitView) {		//character-ify the data
				case 8:
					num = parseInt(num, 2);
					num = String.fromCharCode(num);
					break;
			}

			if(ch)
				s += "<span class='changed'>" + num + "</span>";
			else
				s += num;

			if(j % 10 == 8) {
				s += "<pre>  </pre>";
				j += 2;
			}
		}

		memdiv.innerHTML = s;
		i--;
	}
}

//writes to the memory
function writeToMem(dat, at, size) {
	if(size > 32) {
		alert("Too large");
		return;
	}

	var bdata = extend((dat >>> 0).toString(2), 32).slice(-size);
	for(var i = at, j = 0 ; j < size ; i++, j++) {
		mem[i] = Number(bdata[j]);
		mem.changed[i] = true;
	}

	instateMemory(mem.currBitView);				//reinstate changed memory
}
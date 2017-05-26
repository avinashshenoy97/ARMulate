var mem = new Object()
mem.size = 16000;		//16 KB default

function setSize(n) {
	window.mem.size = n;
}

function instateMemory() {
	var bitView = 8, perRow = 16;
	var d = document.getElementById("data").children[0];	//d is tbody
	var i = 0;
	var modder = bitView * perRow;
	var make = true, w = 0, wset = false;
	for(i = 0 ; i < mem.size ; i++) {
		//if(i % modder == 0) {
		if(make) {
			var r = document.createElement("tr");
			r.appendChild(document.createElement("td"));
			r.appendChild(document.createElement("td"));
			r.children[0].className = "dcol1";
			r.children[1].className = "dcol2";
			r.children[1].appendChild(document.createElement("div"))
			r.children[1].children[0].className = "memdata";
			
			r.children[0].innerHTML = i;
			r.children[1].id = "b" + i;
			r.children[1].children[0].innerHTML = "";
			//r.children[1].innerHTML = "";
			
			d.appendChild(r);
			make = false;
		}

		var r = d.children[d.children.length - 1].children[1].children[0];
		//var r = d.children[d.children.length - 1].children[1];
		var j = 0;
		if(!wset) {
			for(j = 0 ; j < 8 ; j++) {
				r.innerHTML += Number(Boolean(mem[i])) + "";
				//console.log(r.scrollHeight > r.clientHeight || r.scrollWidth > r.scrollWidth);
				if(r.scrollHeight > r.clientHeight || r.scrollWidth > r.scrollWidth) {
					wset = true;
					while(i % 8 != 0) {
						r.innerHTML = r.innerHTML.slice(0, r.innerHTML.length - 1);
						i--;
						w--;
					}
					r.innerHTML = r.innerHTML.slice(0, r.innerHTML.length - 1);
					w--;
					mem.width = Number(w + 1);
					make = true;
					break;
				}
				i++;
				w++;
			}
			r.innerHTML += " ";
			i--;
		}
		else {
			for(j = 1 ; j <= w+1 ; j++) {
				r.innerHTML += Number(Boolean(mem[i])) + "";
				i++;
				if(i == mem.size)
					break;
				if(j % 8 == 0)
					r.innerHTML += " ";
			}
			i--;
			make = true;
		}
	}
}

instateMemory();


function writeToMem(byteData, atByte) {
	var bdata = extend(tobase(byteData, 2));
	console.log(bdata);
	var r = Math.floor(atByte / mem.width) * mem.width;
	console.log(r);
	var td = document.getElementById("b" + r).children[0];
	console.log(td);
	var pos = atByte - r;
	console.log(pos);
	var s = td.innerHTML;
	console.log(s);

	s = s.slice(0, pos) + bdata + s.slice(pos + bdata.length);

	for(var i = 0 ; i < bdata.length ; i++) {
		mem[atByte + i] = bdata[i];
		//s[i] = bdata[i];
		//console.log("m " + mem[atByte + i]);
		//console.log("s " + s[i]);
	}

	td.innerHTML = s;
	console.log(td.innerHTML);
}
function instateMemory() {
	mem = window.mem;
	var bitView = 8, perRow = 16;
	var d = document.getElementById("data").children[0];	//d is tbody
	var i = 0;
	var modder = bitView * perRow;
	var make = true, w = 0, wset = false;
	for(i = 0 ; i < mem.size ; i++) {
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
			
			d.appendChild(r);
			make = false;
		}

		var r = d.children[d.children.length - 1].children[1].children[0];	//last row, second col, the div
		var j = 0;
		if(!wset) {								//find width of each line
			for(j = 0 ; j < 8 ; j++) {
				r.innerHTML += Number(Boolean(mem[i])) + "";
				if(r.scrollHeight > r.clientHeight || r.scrollWidth > r.scrollWidth) {	//to detect overflow
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
		else {								//after width is found
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

	for(var i = 0 ; i < d.children.length ; i++) {
		var td = d.children[i].children[1].children[0];	//the div in the td
		var s = td.innerHTML;
		s = s.replace(/\s+/g, " ");
		s = s.replace(/\s/g, "</span> <span>");			//add spans around each group of 8
		s = "<span>" + s + "</span>";
		td.innerHTML = s;
	}
}

//writes to the memory
function writeToMem(byteData, atByte) {
	if(byteData > 255) {
		console.log("Too large to fit in byte");
		return;
	}

	mem = window.mem
	var bdata = extend(tobase(byteData, 2));				//convert the data to binary
	var r = Math.floor(atByte / mem.width) * mem.width;		//row number in table
	var td = document.getElementById("b" + r).children[0];	//div inside column

	var pos = atByte - r;			//position in the row
	var marknext = false;			//if the byte spills into the next group of 8
	if(pos % 8 != 0)
		marknext = true;

	pos -= (pos % 8);
	pos = Math.floor(pos / 8);		//group number, i.e, span number in the div

	for(var i = 0 ; i < bdata.length ; i++) {
		mem[atByte + i] = parseInt(bdata[i]);	//change memory
	}
	
	
	var td = document.getElementById("b" + r).children[0];	//the div
	var ch = td.children[pos]; 								//the span to change
	ch.className = "changed";				//mark as changed to highlight
	ch.innerHTML = "";									//clear text in HTML
	for(var i = r+(pos*8), j = 0 ; j < 8 ; i++, j++) {
		ch.innerHTML += Number(Boolean(mem[i]));		//fill text from memory
	}

	if(marknext) {						//if it has spilled into next group
		next = (pos*8) + r + 8;
		if(next >= mem.width) {
			r += mem.width;
			next = 0;
		}

		next = Math.floor(next/8);
		console.log(next);

		var td = document.getElementById("b" + r).children[0];	//the div
		var ch = td.children[next];
		ch.className = "changed";
		ch.innerHTML = "";
		for(var i = r+(next*8), j = 0 ; j < 8 ; i++, j++) {		//fill next group from memory
			ch.innerHTML += Number(Boolean(mem[i]));
		}
	}
}
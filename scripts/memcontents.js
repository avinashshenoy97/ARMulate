var mem = new Object()
mem.size = 16000;		//16 KB default

function setSize(n) {
	window.mem.size = n;
}

function instateMemory() {
	var bitView = 8, perRow = 16;
	var d = document.getElementById("data").children[0];	//d is tbody
	var i;
	var modder = bitView * perRow;
	var make = true;
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
			r.children[1].children[0].innerHTML = "";
			//r.children[1].innerHTML = "";
			
			d.appendChild(r);
			make = false;
		}

		var r = d.children[d.children.length - 1].children[1].children[0];
		//var r = d.children[d.children.length - 1].children[1];
		var j = 0;
		for(j = 0 ; j < 8 ; j++) {
			r.innerHTML += Number(Boolean(mem[i])) + "";
			//console.log(r.scrollHeight > r.clientHeight || r.scrollWidth > r.scrollWidth);
			if(r.scrollHeight > r.clientHeight || r.scrollWidth > r.scrollWidth) {
				while(i % 8 != 0) {
					r.innerHTML = r.innerHTML.slice(0, r.innerHTML.length - 1);
					i--;
				}
				r.innerHTML = r.innerHTML.slice(0, r.innerHTML.length - 1);
				make = true;
				break;
			}
			i++;
		}
		r.innerHTML += " ";
		i--;
	}
}

//instateMemory();
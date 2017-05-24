var w = window.innerWidth - (8 * 6);

var d = document.getElementById('rbank');
var t = (w * 20 / 100);
d.style.width = t + "px";

d = document.getElementById('editor');
d.style.width = (w - t) + "px";

w = window.innerWidth - (8 * 4);
d = document.getElementById("header");
d.style.width = w - 8;

var h = window.innerHeight - (8 * 2);
d = document.getElementById("content");
d.style.height = (h * 60 / 100) + "px";

var tab = document.getElementById("Rs").children[0];
for(i = 0 ; i < 16 ; i++) {
	r = document.createElement("tr");
	r.appendChild(document.createElement("td"));
	r.appendChild(document.createElement("td"));
	r.firstChild.innerHTML = "R" + i;
	r.children[1].id = "r" + i + "val";

	r.children[0].className = "col1";
	r.children[1].className = "col2";

	tab.appendChild(r);
}

/*r = document.createElement("tr");
r.appendChild(document.createElement("td"));
r.appendChild(document.createElement("td"));
r.appendChild(document.createElement("td"));
r.appendChild(document.createElement("td"));
r.children[0].innerHTML = "N";
r.children[1].innerHTML = "C";
r.children[2].innerHTML = "Z";
r.children[3].innerHTML = "V";
for(x = 0 ; x < r.children.length ; x++)
	r.children[x].className = "cpsr";
tab.appendChild(r);

r = document.createElement("tr");
r.appendChild(document.createElement("td"));
r.appendChild(document.createElement("td"));
r.appendChild(document.createElement("td"));
r.appendChild(document.createElement("td"));
for(x = 0 ; x < r.children.length ; x++)
	r.children[x].className = "cpsr";
tab.appendChild(r);*/

t = document.getElementById("Rs").offsetHeight / 18;
var tr = tab.children;
for(x = 0 ; x < tr.length ; x++) {
	tr[x].style.height = t + "px";
}

tr = document.getElementById("cpsr").children[0].children;
for(x = 0 ; x < 2 ; x++) {
	tr[x].style.height = t + "px";
}

document.getElementById("editor").style.height = (document.getElementById("rbank").offsetHeight - (8 * 2)) + "px";

document.getElementById("code").style.width = (parseInt(document.getElementById("editor").style.width) - (8)) + "px";

d = document.getElementById("memory");
h = 8 * 3;
for(x = 0 ; x < document.body.children.length ; x++) {
	h += parseInt(document.body.children[x].offsetHeight);
}
d.style.height = (window.innerHeight - h) + "px";
d.style.width = (window.innerWidth - (8 * 3)) + "px";

function appear(event) {
	n = Array.from(event.target.parentNode.children).indexOf(event.target) + 1;
	var d = document.createElement("div");
	d.style.backgroundColor = "#f9e4b1";
	d.style.zIndex = "3";
	d.style.position = "absolute";
	d.style.top = event.clientY + "px";
	d.style.left = event.clientX + "px";
	d.id = "headerhelper";
	
	switch(n) {
		case 1:
			d.innerHTML = "Decimal";
			break;
		
		case 2:
			d.innerHTML = "Binary";
			break;

		case 3:
			d.innerHTML = "Hexadecimal";
			break;

		case 4:
			d.innerHTML = "Interpret";
			break;

		case 5:
			d.innerHTML = "Compile";
			break;

		case 6:
			d.innerHTML = "Run";
			break;

		case 7:
			d.innerHTML = "Refresh";
			break;
	}

	document.body.appendChild(d);
}

function disappear(event) {
	document.getElementById("headerhelper").remove();
}

d = document.getElementById("header").children;
for(x = 0 ; x < d.length ; x++) {
	d[x].addEventListener("mouseover", appear);
	d[x].addEventListener("mouseout", disappear);
}
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

var tab = document.getElementById("Rs");
for(i = 0 ; i < 16 ; i++) {
	r = document.createElement("tr");
	r.appendChild(document.createElement("td"));
	r.appendChild(document.createElement("td"));
	r.firstChild.innerHTML = "R" + i;

	r.children[0].className = "col1";
	r.children[1].className = "col2";

	tab.appendChild(r);
}

t = document.getElementById("Rs").offsetHeight / 16;
var tr = tab.children;
for(x = 0 ; x < tr.length ; x++) {
	tr[x].style.height = t + "px";
}

document.getElementById("editor").style.height = (document.getElementById("rbank").offsetHeight - (8 * 2)) + "px";

document.getElementById("code").style.width = (parseInt(document.getElementById("editor").style.width) - (8)) + "px";

d = document.getElementById("memory");
h = 8 * 3;
for(x = 0 ; x < document.body.children.length ; x++) {
	console.log(document.body.children[x])
	h += parseInt(document.body.children[x].offsetHeight);
	console.log(h)
}
d.style.height = (window.innerHeight - h) + "px";
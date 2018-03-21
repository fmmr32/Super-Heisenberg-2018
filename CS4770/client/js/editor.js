function Editor(){
	
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");

	
	var bw = canvas.width;
    var bh = canvas.height;
    var p = 0;		//offset
    var cw = 32;	//cell width
    var ch = 36;	//cell height
	
    function drawBoard(){
	//grid square width
    for (var x = 0; x <= bw; x += cw) {
        context.moveTo(0.5 + x + p, p);
        context.lineTo(0.5 + x + p, bh + p);
    }

	//grid square height
    for (var x = 0; x <= bh; x += ch) {
        context.moveTo(p, 0.5 + x + p);
        context.lineTo(bw + p, 0.5 + x + p);
    }

    context.strokeStyle = "black";
    context.stroke();
    }

	setup();
//*****Sidebar********************************************************************

	document.getElementById("selectTiles").onclick = function(){
		elem = "Content";
		console.log("content");
		document.getElementById("creature").style.display = "none";
		document.getElementById("entity").style.display = "none";
		document.getElementById("tiles").style.display = "inline-block";
		
	}

	document.getElementById("selectCreature").onclick = function(){
		elem = "Creature";
		document.getElementById("entity").style.display = "none";
		document.getElementById("tiles").style.display = "none";
		document.getElementById("creature").style.display = "inline-block";

	}

	document.getElementById("selectEntity").onclick = function(){
		elem = "Entities";
		document.getElementById("creature").style.display = "none";
		document.getElementById("tiles").style.display = "none";
		document.getElementById("entity").style.display = "inline-block";
	}

	document.getElementById("character").onchange = function(){
		var chara = document.getElementById("character").text;
		map.character = chara;
	}

	document.getElementById("background").onchange = function(){
		var background = document.getElementById("background");
		var b = background.options[background.selectedIndex].value;
		map.background = b;
		console.log(map);
	}


	document.getElementById("mapW").onchange = function(){
		var w = document.getElementById("mapW").value;
		bw = w;
		canvas.width = w;
		console.log("Changing Width...");
		drawBoard();
	}

	document.getElementById("mapH").onchange = function(){
		var h = document.getElementById("mapH").value;
		bh = h;
		canvas.height = h;
		console.log("Changing Height...");
		drawBoard();
	}

	document.getElementsByName("X").onchange = function(){
		var ycoord = document.getElementById("Y").value;
		map.spawnY = ycoord;
	}
	
	document.getElementsByName("Y").onchange = function(){
		var xcoord = document.getElementById("X").value;
		map.spawnX = xcoord;
		console.log("changing y spawn");
	}
	
	document.getElementsByName("save").onclick = function(){
		
	}
	
	document.getElementsByName("load").onclick = function(){
		
	}


	
//*******Editor*************************************************************************************

var editor = null;
var selection = null;       //Selection var for tile placement.
var mouseClicked = false;   //Var for mouse listeners
var move = null;
var mouseReleased = true;
var mouseLeft = false;
var mouseRight = false; 
var img = new Image();
var elem = "Content";

document.addEventListener("mousemove", onMouseMove, false);
img.src = 'tileset.png';
	

		

function setup()
{
	//tileC.drawImage(img,0,0);
	drawBoard();
	
}		
		
  ////for Kennedy
    //loadJSONFile(function (response) {
    //    loadSprites(response, canvas);
    //}, "../client/resources/tiles.json");

		
function StartEditor()
{
    editor = new Editor(720, 480);
}



function Editor(areaW, areaH) {
    this.areaH = areaH;
    this.areaW = areaW;


};


var map = {
	gravity: 9.81,
	width: 720,
	height: 480,
	spawnX: 150,
	SpawnY: 10,
	
	creatures: [{
	
		moveset: 
		[
			{
	
			}
		]
	}],
	
	entities: [
		{
	
		}
	],
	content: [
		{
		
		}
	]
}

	

this.canvas.addEventListener("mousedown", function (e) {
    if (e.which == 1) {	
       mouseLeft = true
	    placeTile();
		

    }
    else if (e.which == 3) {
        mouseRight = true;
		removeTile();
    }
	
		
		
window.addEventListener("mouseup", function(e) { 
	switch (e.which) {
	case 1: 
		mouseLeft = false; 
		break; 
	case 3:
		mouseRight = false;
		break;
	}
}, false);
		
		
},false);

function onMouseMove()
{
	
    if (mouseLeft) {
	 placeTile();
	 
        if (selection != null) {
            placeTile();
			
        }
    }
    else if (mouseRight)
    {
       removeTile();
    }
};





function removeTile()
{
	var scrollPos = document.getElementById("gameDiv");
	var scrollX = scrollPos.scrollLeft;		
	var scrollY = scrollPos.scrollTop;
    var x = Math.floor((event.clientX + scrollX)/cw)*cw; 
    var y = Math.floor((event.clientY + scrollY)/ch)*ch;
	var k;
	var type = null;

		context.clearRect(x+1,y+1,cw-1,ch-1);
		
		
			for (k = 0; k < map.content.length; k++) {
				if (map.content[k].posX == x && map.content[k].posY == y){type = "content"; break;}
			}
			for(k = 0; k< map.entities.length;k++){
				if(type != null){break;}
					if (map.entities[k].posX == x && map.entities[k].posY == y){type = "entities";}
			}
			for(k = 0; k< map.creatures.length;k++){
				if(type != null){break;}
					if(map.creatures[k].posX == x && map.creatures[k].posY == y){type = "creatures"; break;}
			}
		
		
		
		if(type == "content"){
			
			console.log("Deleting Content...");
			map.content.splice(k,1)
		
		}
		else if(type == "entities"){
			
			console.log("Deleting Entity...");
			map.entities.splice(k,1)
		
		}
		else if(type == "creatures"){
			
			console.log("Deleting Creature...");
			map.creatures.splice(k,1)
		
		}	
		drawBoard();
};

function placeTile()
{
	
	var scrollPos = document.getElementById("gameDiv");
	var scrollX = scrollPos.scrollLeft;
	var scrollY = scrollPos.scrollTop;
    var x = Math.floor((event.clientX + scrollX)/cw)*cw; 
    var y = Math.floor((event.clientY + scrollY)/ch)*ch;
	//var imageSel = new Image();
	//var g = document.getElementById("gameElement");
	//var elem = g.options[g.selectedIndex].text;
	//imageSel = tileC.getImageData(64,64,cw,ch);
	//context.drawImage(img,0,0,32,36,x,y,32,36);
	//context.drawImage(img,32,0,32,36,x,y,32,36);
	context.drawImage(img,64,0,32,36,x,y,32,36);
	//context.drawImage(img,96,0,32,36,x,y,32,36);
	//tileC.drawImage(img, 0, 0);
	//removeTile();
	//context.fillRect(x,y,cw,ch);
	
	if(elem === "Creature"){
	
	placeCreature();
	
	}
	
	if(elem === "Entities"){
	
	placeEntity();
	
	}
	
	if(elem === "Content"){
	
	placeContent();
	
	}
	

	
	
	function placeCreature(){
			
	var taken = false;
	var i;
		var creat = {
			id: selection,
			posX:x,
			posY:y,
			moveset: move
			}			
	    //check to see if tile position is already in existance
    for ( i = 0; i < map.creatures.length; i++) {
	
        if (map.creatures[i].posX == x && map.creatures[i].posY == y){
			
			taken = true;
			break;
			} 
		}
		if(taken){
			console.log("Overwriting position...");
			map.creatures.splice(i,1)
			map.creatures.push(creat);

			
            
        }
		else{
				map.creatures.push(creat);
				console.log("pushing");				
			}
		
	
	}
	
	
	function placeEntity(){
			
	var taken = false;
	var i;
		var ent = {
			id: selection,
			posX:x,
			posY:y
			}			
	    //check to see if tile position is already in existance
    for ( i = 0; i < map.entities.length; i++) {
	
        if (map.entities[i].posX == x && map.entities[i].posY == y){
			taken = true;
			break;
			} 
		}
		if(taken){
			console.log("Overwriting position...");
			map.entities.splice(i,1)
			map.entities.push(ent);

			
            
        }
		else{
				map.entities.push(ent);
				console.log("pushing");
				
			}
		
	
	}
	function placeContent(){
	
	var taken = false;
	var i;
		var cont = {
			id: selection,
			posX:x,
			posY:y
			}			
	    //check to see if tile position is already in existance
    for ( i = 0; i < map.content.length; i++) {
	
        if (map.content[i].posX == x && map.content[i].posY == y){
			
			taken = true;
			break;
			} 
		}
		if(taken){
			console.log("Overwriting position...");
			map.content.splice(i,1)
			map.content.push(cont);

			
            
        }
		else{
				map.content.push(cont);
				console.log("pushing");
				
			}
		
	
	}
	console.log(map);
	
	
    
};

}
	
	

<html>
    <head>

    </head>
    <body style=" background: grey;" >
        <canvas id="canvas" width="720px" height="480px" style="background: #fff;  magrin:20px;" oncontextmenu="return false;" ></canvas>
        <script type="text/javascript" language="javascript">

//*******Grid***************************************************************************************
    var bw = 720;
    var bh = 480;
    var p = 0;
    var cw = 32;
    var ch = 32;

    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");
    function drawBoard(){
	//square width
    for (var x = 0; x <= bw; x += 32) {
                context.moveTo(0.5 + x + p, p);
            context.lineTo(0.5 + x + p, bh + p);
    }

	//square height
    for (var x = 0; x <= bh; x += 32) {
                context.moveTo(p, 0.5 + x + p);
            context.lineTo(bw + p, 0.5 + x + p);
    }

    context.strokeStyle = "black";
    context.stroke();
    }

    drawBoard();



//*******Editor*************************************************************************************

var editor = null;
var selection = null;       //Selection var for tile placement.
var mouseClicked = false;   //Var for mouse listeners
var mouseReleased = true;
var mouseLeft = false;
var mouseRight = false;


function StartEditor()
{
                editor = new Editor(500, 500);
            }


document.addEventListener("mousemove", onMouseMove, false);

function Editor(areaW, areaH) {
                this.areaH = areaH;
            this.areaW = areaW;


};


this.canvas.addEventListener("mousedown", function (e) {
    if (e.which == 1) {
                mouseLeft = true
	    placeTile();
		console.log("LMB");

    if (selection != null)
            editor.placeTile();
    }
    else if (e.which == 3) {
                mouseRight = true;
            console.log("RMB");
		removeTile();
    }



window.addEventListener("mouseup", function(e) { 
	switch (e.which) {
	case 1:
		console.log("LMBup");
		mouseLeft = false;
		break;
	case 3:
		console.log("RMBup");
		mouseRight = false;
		break;
	}
}, false);


},false);

function onMouseMove()
{
    if (mouseLeft) {
                console.log("LMB+MOVE");
            placeTile();

        if (selection != null) {
                placeTile();
			
            }
    }
    else if (mouseRight)
    {
                console.log("RMB+MOVE");
            removeTile();
    }
};





function removeTile(map, block)
{
		var x = Math.floor(event.clientX/cw)*cw;
		var y = Math.floor(event.clientY/ch)*ch;
		context.clearRect(x,y,32,32);
};

function placeTile()
{
    var x = Math.floor(event.clientX/cw)*cw;
    var y = Math.floor(event.clientY/ch)*ch;
	context.fillRect(x,y,32,32);
   // context.drawImage(selection, x, y);
};
    </script>
    </body>
</html>
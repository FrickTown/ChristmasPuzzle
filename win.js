var textScale = 0;
var solution = "725"

function toggleWinBackground(){
    document.getElementById("curtain").style.opacity = 0;
    document.getElementById("zoomsection").style.opacity = 0;
    domCtx.style.border = "10px solid rgba(255,255,255,0)";
    //document.body.style.animation = "animation: 30s linear 0s infinite leftToRight_Win, 30s linear 0s infinite topToBottom_Win;"
    touchStarted = function(){
        console.log("thisInstead");
    }
    touchMoved = function(){
        return false;
    }
    touchEnded = function(){
        return false;

    }
}

var op = 255;

function drawWin(){
    clear();
    background(255, 255, 255, op-=5);
    textSize(32 * (textScale));
    textAlign(CENTER, CENTER);
    fill(255,255,255);
    stroke(0);
    strokeWeight(4);
    text(solution, canvas.width/2, canvas.height/2);
    textScale > 3 ? textScale : textScale += 0.05;
}
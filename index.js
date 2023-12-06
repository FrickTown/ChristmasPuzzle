var Segments = [];
var xBy = 4;
var segmentWidth;
var segmentHeight;
var canvas;
var domCtx;
var puzzleImage
var winImage;
var selected;
var selectedSubset;
var boardScale = 1;
var boardCenter = () => {return {x: domCtx.clientLeft + (domCtx.clientWidth/2), y: domCtx.clientTop + (domCtx.clientHeight/2)}};
var displayWinCondition = false;
var font;

function setup(){
    puzzleImage = loadImage("resources/puzzleImage.png");
    winImage = loadImage("resources/winImage.png");
    canvas = createCanvas(Math.min(displayHeight, displayWidth), Math.min(displayHeight, displayWidth));
    domCtx = canvas.elt;
    font = loadFont('./resources/gasoek.ttf');
    //debug();
    segmentWidth = canvas.width / xBy;
    segmentHeight = canvas.height / xBy;
    for(let y = 0; y < xBy; y++){
        let row = [];
        for(let x = 0; x < xBy; x++){
            row.push(new Segment(x, y));
        }
        Segments.push(row);
    }
    shuffleBoard();
    document.getElementById("zoomer").addEventListener("input", handleZoomer);
}

function debug(){
    var debugs = document.querySelectorAll("h3");
    debugs[0].innerHTML = displayWidth;
    debugs[1].innerHTML = domCtx.clientWidth;
    debugs[2].innerHTML = document.body.clientWidth
    debugs[3].innerHTML = canvas.width;
}

function draw(){
    background(0,0,200, 0);

    ellipse(mouseX, mouseY, 40, 40);

    if(!displayWinCondition){
        updateAndDraw();
    }
    else {
        fill("red");
        ellipse(canvas.width/2, canvas.height/2, 10);
        drawWin();
    }
}

var lastTouch = new MouseEvent("");
var isTouching = false;

function touchStarted(event){
    if(event.target == document.getElementById("zoomer")){
        return true;
    }
    console.log(event);
    if(typeof event.changedTouches[0] == "undefined")
        return false;
    if(event.changedTouches > 1)
        return false;
    if(isTouching)
        return false;
    isTouching = true;
    let touchInfo = event.changedTouches[0];
    let mouseSeg = mouseToSegment(touchInfo.pageX, touchInfo.pageY);
    //console.log(mouseSeg);
    //console.log(Segments[mouseSeg.y][mouseSeg.x]);
    selected = selectRowAndColumn(mouseSeg.x, mouseSeg.y);
    //console.log(selected);
    lastTouch = touchInfo;
    
    return false;
}

var horizontalUnlocked = 1;
var verticalUnlocked = 1;

function touchMoved(event){
    if(event.target == document.getElementById("zoomer")){
        return true;
    }
    if(typeof event.changedTouches == "undefined" || event.changedTouches === null)
        return false;
    if(event.changedTouches.length > 1)
        return false;

    let nowPos = event.changedTouches[0];
    let xChange = nowPos.pageX - lastTouch.pageX;
    let yChange = nowPos.pageY - lastTouch.pageY;
    if(verticalUnlocked && horizontalUnlocked){
        if((Math.abs(xChange) > Math.abs(yChange))){
            verticalUnlocked = 0;
            selectedSubset = selected.row;
        }
        else{
            horizontalUnlocked = 0;
            selectedSubset = selected.column;
        }
    }
    //console.log(xChange + ", " + yChange);
    for(var i = 0; i < selectedSubset.length; i++){
        selectedSubset[i].xPos += xChange * horizontalUnlocked;
        selectedSubset[i].yPos += yChange * verticalUnlocked;
        selectedSubset[i].displayGhost = true;
    }
    lastTouch = nowPos;
    return false;
}

function touchEnded(event){
    if(event.changedTouches.length > 1)
        return false;
    isTouching = false;
    if(typeof selectedSubset == "undefined")
        return;
    snapBack().then(() => {
        selectedSubset.forEach((e) => {
            e.displayGhost = false;
        });
        selected = [];
        selectedSubset = [];
        horizontalUnlocked = 1;
        verticalUnlocked = 1;
    });
}

function Segment(xC, yC){
    this.id = {x : xC , y : yC};
    this.xPos = (xC * segmentWidth); 
    this.yPos = (yC * segmentHeight);
    this.bottom = () => {return this.yPos + segmentHeight;}
    this.right = () => {return this.xPos + segmentWidth;}
    this.sX = xC * (puzzleImage.width / xBy);
    this.sY = yC * (puzzleImage.height / xBy);
    this.displayGhost = false;
    this.update = function(){
        //if(this.xPos < 0 && this.xPos > -segmentWidth){
        //    displayGhost = true;
        //}
        if(this.xPos <= -segmentWidth){
            this.xPos = width + this.xPos;
        }
        if(this.xPos >= width){
            this.xPos = 0 + (this.xPos - width);
        }
        if(this.yPos <= -segmentHeight){
            this.yPos = height + this.yPos;
        }
        if(this.yPos >= height){
            this.yPos = this.yPos - height;
        }
    }
    this.draw = function(){
        image(
            puzzleImage, this.xPos, this.yPos, segmentWidth, segmentHeight, 
            this.id.x * (puzzleImage.width / xBy), this.id.y * (puzzleImage.height / xBy), (puzzleImage.width / xBy), (puzzleImage.height / xBy));
        if(this.displayGhost) {
            if(horizontalUnlocked){
                image(
                    puzzleImage, width + this.xPos, this.yPos, segmentWidth, segmentHeight,
                    this.id.x * (puzzleImage.width / xBy), this.id.y * (puzzleImage.height / xBy), (puzzleImage.width / xBy), (puzzleImage.height / xBy));
                image(
                    puzzleImage, this.xPos - width, this.yPos, segmentWidth, segmentHeight, 
                    this.id.x * (puzzleImage.width / xBy), this.id.y * (puzzleImage.height / xBy), (puzzleImage.width / xBy), (puzzleImage.height / xBy));

            }
            if(verticalUnlocked){
                image(puzzleImage, this.xPos, height + this.yPos, segmentWidth, segmentHeight,
                    this.id.x * (puzzleImage.width / xBy), this.id.y * (puzzleImage.height / xBy), (puzzleImage.width / xBy), (puzzleImage.height / xBy));
                image(puzzleImage, this.xPos, this.yPos - height, segmentWidth, segmentHeight,
                    this.id.x * (puzzleImage.width / xBy), this.id.y * (puzzleImage.height / xBy), (puzzleImage.width / xBy), (puzzleImage.height / xBy));

            }
        }
    }
}

function mouseToCanvas(x, y){
    let localBounds = domCtx.getBoundingClientRect();
    let translatedMouse = {
        tx: x + (((x - boardCenter().x) * 1/boardScale) - (x - boardCenter().x)),
        ty: y +((y - boardCenter().y) * 1/boardScale)
    }
    let localMouse = {
        x: (x >= 0) ? Math.min(x - localBounds.x, localBounds.right) : 0,
        y: (y >= 0) ? Math.min(y - localBounds.y, localBounds.bottom) : 0
    }
    return localMouse;
}

function canvasToSegment(x, y){
    return {x: Math.min(Math.floor((x * 1/boardScale) / segmentWidth), xBy-1), y: Math.min(Math.floor((y * 1/boardScale) / (segmentHeight)), xBy-1)};
}

function mouseToSegment(x, y){
    let localBounds = domCtx.getBoundingClientRect();
    let s1 = mouseToCanvas(x, y);
    console.log(s1);
    //segmentWidth = localBounds.width / xBy;
    //segmentHeight = localBounds.height / xBy;
    let s2 = canvasToSegment(s1.x, s1.y);
    if(s2.x < 0)
        s2.x = 0;
    if(s2.y < 0)
        s2.y = 0;
    console.log(s2);
    console.log(Segments[s2.y][s2.x]);
    return s2;
}

function selectRowAndColumn(x, y){

    let out = {
        row : Segments[y]
    }
    out.column = [];
    for(var i = 0; i < xBy; i++){
        out.column.push(Segments[i][x]);
    }

    return out;
}

async function snapBack(){
    updateAndDraw();
    let onFringe;

    for(let i = 0; i < selectedSubset.length; i++){
        let e = selectedSubset[i];
        if(e.xPos < 0 || e.xPos > (width-segmentWidth) || e.yPos < 0 || e.yPos > (height-segmentHeight)){
            console.log(e);
            onFringe = e;
            break;
        }
    }
    if(typeof onFringe == "undefined")
        return;

    if(horizontalUnlocked && !verticalUnlocked){
        let deltaX = onFringe.xPos % segmentWidth;
        console.log(selectedSubset);
        if(onFringe.xPos < 0){
            if(Math.abs(onFringe.xPos) > segmentWidth/2){
                for (let i = 0; i < selectedSubset.length; i++) {
                    let element = selectedSubset[i];
                    let rest = segmentWidth + deltaX;
                    element.xPos -= rest;
                }
                onFringe.xPos = width - segmentWidth;
            }
            else{
                for (let i = 0; i < selectedSubset.length; i++) {
                    let element = selectedSubset[i];
                    element.xPos -= deltaX;
                }
                onFringe.xPos = 0;
            }
        }
        else{
            if(onFringe.right() > width + (segmentWidth/2)){
                for (let i = 0; i < selectedSubset.length; i++) {
                    let element = selectedSubset[i];
                    let rest = segmentWidth - deltaX;
                    element.xPos += rest;
                }
                onFringe.xPos = 0;
            }
            else {
                for (let i = 0; i < selectedSubset.length; i++) {
                    let element = selectedSubset[i];
                    element.xPos -= deltaX;
                }
                onFringe.xPos = width - segmentWidth;
            }
        }
        console.log(deltaX);
        console.log(selectedSubset);
    }
    if(verticalUnlocked && !horizontalUnlocked){
        let deltaY = onFringe.yPos % segmentHeight;
        console.log(deltaY);
        if(onFringe.yPos < 0){
            if(Math.abs(onFringe.yPos) > segmentHeight/2){
                for (let i = 0; i < selectedSubset.length; i++) {
                    let element = selectedSubset[i];
                    let rest = segmentHeight + deltaY;
                    element.yPos -= rest;
                }
                onFringe.yPos = height - segmentHeight;
            }
            else{
                for (let i = 0; i < selectedSubset.length; i++) {
                    let element = selectedSubset[i];
                    element.yPos -= deltaY;
                }
                onFringe.yPos = 0;
            }
        }
        else{
            if(onFringe.bottom() > height + (segmentHeight/2)){
                for (let i = 0; i < selectedSubset.length; i++) {
                    let element = selectedSubset[i];
                    let rest = segmentHeight - deltaY;
                    element.yPos += rest;
                }
                onFringe.yPos = 0;
            }
            else{
                for (let i = 0; i < selectedSubset.length; i++) {
                    let element = selectedSubset[i];
                    element.yPos -= deltaY;
                }
                onFringe.yPos = height - segmentHeight;
            }
        }
    }

    await cloneAndRealign().then((resolve)=>{
        console.log(Segments);
        console.log(resolve);
        Segments = resolve;
        setTimeout(() => {checkWinCondition();}, 250);
    });
}

function checkWinCondition(){
    for(var i = 0; i < Segments.length; i++){
        for(var j = 0; j < Segments[i].length; j++){
            let thisone = Segments[i][j];
            if(thisone.id.y != i || thisone.id.x != j){
                return;
            }
        }
    }
    toggleWinBackground();
    displayWinCondition = true;
}

async function cloneAndRealign(){
    var out = JSON.parse(JSON.stringify(Segments));
    for(let i = 0; i < Segments.length; i++){
        for(let j = 0; j < Segments[i].length; j++){
            let element = Segments[i][j];
            let deez = canvasToSegment(element.xPos, element.yPos);
            //console.log(deez);
            out[deez.y][deez.x] = element;
        }
    }
    return out;
}

function updateAndDraw(){
    Segments.forEach(emelent => {
        emelent.forEach(element => {
            //fill(element.color);
            //rect(element.xPos, element.yPos, segmentWidth, segmentHeight);
            if(typeof element.update != "function"){
                console.log(element);
            }
            element.update();
            element.draw();
        })
    });
}

function handleZoomer(e){
    console.log(e.target.value);
    boardScale = e.target.value/100;
    domCtx.style.transform = "scale(" + boardScale + ")";
}

function shuffleBoard(){
    //Number of swaps to make
    /*let intensity = 10;
    for(var i = 0; i < intensity; i++){
        let toCloneY = Math.round(Math.random() * Segments.length-1);
        let toCloneX = Math.round(Math.random() * Segments[toCloneY].length-1);
        console.log({toCloneX, toCloneY});
    }
    */
    console.log("Before:")
    console.log(Segments);
    shuffle(Segments, true);
    console.log("After 1st");
    console.log(Segments);
    console.log("After 2nd");
    for(let i = 0; i < xBy; i++){
        let column = [];
        console.log(column);
        for(let j = 0; j < xBy; j++){
            column.push(Segments[j][i]);
        }
        shuffle(column, true);
        /*column.filter((el) => {
            return typeof el != "undefined";
        });*/
        console.log(column);
        for(let col = 0; col < column.length; col++){
            Segments[col][i] = column[col];
        }
    }
    console.log(Segments);
    updatePosByOrder();
}

function updatePosByOrder(){
    for(let i = 0; i < Segments.length; i++){
        for(let j = 0; j < Segments[i].length; j++){
            Segments[i][j].xPos = j * segmentWidth;
            Segments[i][j].yPos = i * segmentHeight;
        }
    }
}
var cols, rows;
var scl = 20;
var w = 2400;
var h = 1200;
var terrain = [];
var framePreset = 0;
let cameraSpeed = 0;
var moonlight = 0;
var cameraPosX, cameraPosY, cameraPosZ;
var flightPosX, flightPosY;
var flyingSpeed = 0;
var timeLimit = 60;
const FRAME_RATE = 60;
let bullet = [];
const SPACEBAR = 32;
let fs= [];
let y = 0;
let mulshoot = 0;
let shootermoving = 0;
let kebababab= [];
let shooter=0;

function setup() {
    createCanvas(600, 600, WEBGL);
    camera = createCamera();
    //song = loadSound('bbt.mp3');
    cols = w / scl;
    rows = h / scl;
    // 2차원 배열 초기화
    for (var x = 0; x < cols; x++) {
        terrain[x] = [];
        for (var y = 0; y < rows; y++) {
            terrain[x][y] = 0; //specify a default value for now
        }
    }
    noStroke();
    // 비행기 위치 초기화
    flightPosX = 300 - width / 2;
    flightPosY = height / 2 - 150;
    cameraPosX = flightPosX;
    cameraPosY = flightPosY/10;
    for(let i=0; i<200;i++){
        bullet[i] = new Bullet();
    }
    shooter = new Shooter();
    for(let i=0; i<10; i++){
      fs[i] = new flightshoot();
    }
}

function draw() {
    framePreset = frameCount / FRAME_RATE;
    moonlight = framePreset / 3;
    if (sin(framePreset) > 0) {
        background(0);
    } else {
        background(80, 188, 223);
    }
    // 산 높이 및 산 이동 속도 설정
    flyingSpeed -= 0.01 + map(cameraSpeed, 0, 50, 0.01, 0.09);
    setMountain(flyingSpeed);
    translate(0, 50);
    rotateX(PI / 3);
    // 카메라 위치 설정 및 각도 설정
    camera.lookAt(flightPosX, flightPosY-90 , 200);
    camera.setPosition(flightPosX + cameraPosX, (flightPosY + cameraPosY) + cameraSpeed-90, 266+cameraSpeed);
    //print(flightPosX, flightPosY);
    translate(-w / 2, -h / 2);
    // 산 생성
    makeMountain();
    push();
    // 해와 달 생성
    makeSun(framePreset);
    makeMoon(framePreset, moonlight);
    pop();
    for(let j=0; j<200; j++){
        bullet[j].delay = j;
        bullet[j].move(map(j,0,100,0,PI));
        bullet[j].display();
    }
    shooter.move(framePreset*6);
    shooter.display();
    translate(w / 2, h / 2);
    /* 비행기 위치 이동 translate */
    translate(flightPosX, flightPosY, 200);
    push();
    flight();
    pop();
    if (keyIsDown(SPACEBAR)){
      mulshoot +=1;
      fs[mulshoot%10].y = -100;
      for(let i=0; i<10; i++){
      fs[i].display();
      }
    }
}
function setMountain(_flyingSpeed) {
    /* 산 높이를 설정하는 함수 */
    var yoff = _flyingSpeed;
    for (var y = 0; y < rows; y++) {
        var xoff = 0;
        for (var x = 0; x < cols; x++) {
            terrain[x][y] = map(noise(xoff, yoff), 0, 1, -100, 100);
            xoff += 0.5;
        }
        yoff += 0.2;
    }
}

function makeMountain() {
    /* 산 만드는 함수 */
    for (var y = 0; y < rows - 1; y++) {
        beginShape(TRIANGLE_STRIP);
        for (var x = 0; x < cols; x++) {
            let v = terrain[x][y];
            v = map(v, -100, 100, 0, 255);
            fill(v - 64, v - 32, v);
            vertex(x * scl, y * scl, terrain[x][y]);
            vertex(x * scl, (y + 1) * scl, terrain[x][y + 1]);
        }
        endShape();
    }
}

function makeSun(_framePreset) {
    /* 태양 만드는 함수 */
    translate(w / 2 - cos(_framePreset) * 800, 0, -sin(_framePreset) * 260);  //sun
    push();
    ambientLight(50);
    pointLight(255, 255, 255, 0, 0, 50);
    specularMaterial(255, 0, 0);
    sphere(50);
    pop();
}

function makeMoon(_framePreset, _moonlight) {
    /* 달 만드는 함수 */
    translate(cos(_framePreset) * 1600, 0, sin(_framePreset) * 520);    //moon
    pointLight(250, 250, 250, 1800 - ((_moonlight * 900) % 3600), -400, 50);
    fill(255, 255, 0);
    sphere(50);
}

function flight() {
    /* 비행기 키보드 이동 및 생성 함수 */
    flightKeyPressed();

    fill(125);
    triangle(-5, 2, 0, -3, 5, 2);
    triangle(-5, 2, -2.5, 2, -3.75, 3.75);
    fill(0);
    triangle(-2.5, 2, 0, 2, -1.25, 2.75);
    triangle(0, 2, 2.5, 2, 1.25, 2.75);
    fill(125);
    triangle(2.5, 2, 5, 2, 3.75, 3.75);
    noFill();
}


function flightKeyPressed() {
    time = 0;
    delay = 0;
    /* 비행기 및 카메라 조절 함수 */
    if (keyIsDown(UP_ARROW)) {
        cameraSpeed += 2;
        flightPosY -= 10;
        cameraPosY -= 10;
    }
    if (keyIsDown(DOWN_ARROW)) {
        cameraSpeed -= 2;
        flightPosY += 10;
        cameraPosY += 10;
    }
    if (keyIsDown(LEFT_ARROW)) {
        rotateY(-PI / 3);
        flightPosX -= 10;
        cameraPosX -= 10;
    }
    if (keyIsDown(RIGHT_ARROW)) {
        rotateY(PI / 3);
        flightPosX += 10;
        cameraPosX += 10;
    }
    cameraRollBack();
    limitFlightField(flightPosX, flightPosY);
    limitCamera(cameraPosX, cameraPosY);
}
class flightshoot{
    constructor() {
        this.y = -100;
        this.speed = 5;
    }
  display(){
    push();
    translate(0,this.y,0);
    this.y -= this.speed;
    if(this.y < -1000){
      this.y=0;
    }
        fill(0,255,0);
        sphere(2);
        pop();
}
}
function limitFlightField(_flightPosX, _flightPosY) {
    /* 비행기가 움직일 수 있는 범위를 제한합니다 */
    limitX = 1080;
    limitY = 330;
    if (_flightPosX > limitX) {
        flightPosX = limitX;
    } else if (_flightPosX < -limitX) {
        flightPosX = -limitX;
    }
    if (_flightPosY > limitY) {
        flightPosY = limitY;
    } else if (_flightPosY < -limitY) {
        flightPosY = -limitY;
    }
}

function limitCamera(_cameraPosX, _cameraPosY) {
    /* 카메라 이동 범위를 제한합니다. */
    var limitX = 25;
    var limitY = 150;
    if (_cameraPosX >= limitX) {
        cameraPosX = limitX;
    } else if (_cameraPosX < -limitX) {
        cameraPosX = -limitX;
    }
    if (_cameraPosY > limitY || _cameraPosY <= limitY) {
        cameraPosY = limitY;
    }

    if (cameraSpeed > 50) {
        cameraSpeed = 50;
    } else if (cameraSpeed < 0) {
        cameraSpeed = 0;
    }
}

function cameraRollBack() {
    /* 카메라를 원래대로 복귀시킵니다 */
    if (cameraPosX > 0) {
        cameraPosX--;
    } else if (cameraPosX < 0) {
        cameraPosX++;
    }

    if (cameraSpeed > 0) {
        cameraSpeed--;
    } else if (cameraSpeed < 0) {
        cameraSpeed++;
    }
}
class Bullet {
    constructor() {
        this.x = w/2;
        this.y = -100;
        this.speed = 10;
        this.time = 0;
        this.delay = 0;
        this.a=1200;
    }

    move(a, d) {
        if(this.time > this.delay){
            this.x += sin(a)*this.speed;
            //this.y += cos(a)*this.speed;
            this.y += 10;
        }
        this.time++;
    }
    display() {
        push();
        translate(this.x, this.y,200);
        //print(this.x, this.y);
        if(abs(this.x-1200-flightPosX)<4 && abs(this.y-600-flightPosY)<4){
            print("you died");
        }
        if(this.time>200+this.delay){
            this.x = w/2;
            this.y = -100;
            this.a = 1200;
            this.time = this.delay;
        }
        fill(255,255,0);
        sphere(4);
        pop();
    }
}
class Shooter{
      constructor(){
      this.a=w/2;
      }
      move(a){
        this.a += sin(a)*2;
      }
      display() {
        push();
        translate(this.a, -100,200);
        fill(255);
        torus(40);
        pop();
    }
    }

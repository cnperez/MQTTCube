var container;
var width, height;
var geometry;
var cube, axisHelper;
var camera, scene, renderer;
var ratio = 0.618;
var orientVector = {x:0.0, y:0.9, z:0};

init();
animate();

function init() {

  container = $('#jumbotron');
  width = container.width();
  height = ratio * width;
  container.height(height);
  
  camera = new THREE.PerspectiveCamera( 70, width / height, 1, 1000 );
  camera.position.y = 150;
  camera.position.z = 500;

  scene = new THREE.Scene();

  // Cube
  
  geometry = new THREE.BoxGeometry( 200, 300, 100 );
  setFaceColors();
  
  var material = new THREE.MeshBasicMaterial( { vertexColors: THREE.FaceColors, overdraw: 0.5 } );

  cube = new THREE.Mesh( geometry, material );
  cube.position.y = 150;
  scene.add( cube );
  
  //axisHelper = new THREE.AxisHelper( 400 );
  //scene.add( axisHelper );
  
  renderer = new THREE.CanvasRenderer();
  renderer.setClearColor( container.css('backgroundColor') );
  //renderer.setClearColor( "#ffffff" );
  renderer.setSize( width, height );
  
  container.append( renderer.domElement );

  window.addEventListener( 'resize', onWindowResize, false );
  tiltCube(orientVector);
}


function onWindowResize() {
  width = container.width();
  height = ratio * width;
  container.height(height);  
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize( width, height );
}

function animate() {
  requestAnimationFrame( animate );
  render();
}

function render() {
  renderer.render( scene, camera );
}

function setFaceColors() {
  for ( var i = 0; i < geometry.faces.length; i += 2 ) {
    var hex = Math.random() * 0xffffff;
    geometry.faces[ i ].color.setHex( hex );
    geometry.faces[ i + 1 ].color.setHex( hex );
  }
  geometry.colorsNeedUpdate = true;
}

function tiltCube(orient) {
    //assuming (0,1,0) when tag is upright
    var x, y, z;
    x = orient.x;
    y = orient.y;
    z = orient.z;
    var roll = Math.atan2(y, x) - Math.PI/2;
    var pitch = Math.atan2(Math.sqrt(x*x + y*y), z)- Math.PI/2;
    cube.rotation.x = pitch;
    cube.rotation.z = roll;
    //axisHelper.rotation.y = yaw;
    //axisHelper.rotation.x = pitch;
    //axisHelper.rotation.z = roll;  
} 

function embiggenCube() {
  var scale = 1.5;
  cube.scale.x = scale;
  cube.scale.y = scale;
  cube.scale.z = scale;
}

function smallifyCube() {
  var scale = 1;
  cube.scale.x = scale;
  cube.scale.y = scale;
  cube.scale.z = scale;
}

function lowpassFilter(currentVal, newVal) {
  var k = 0.75;
  return k * currentVal + (1.0 - k) * newVal;
}

function updateCube(topic, payload) {
  //console.log("topic: " + topic + " payload: " + payload);
  if( topic.indexOf("accelerometer") > -1) {
    axis = topic.split("/").pop();
    accelVal = parseFloat(payload);
    orientVector[axis] = lowpassFilter(orientVector[axis], accelVal);
    tiltCube(orientVector);
  }  else if( topic.indexOf("key/left") > -1 && payload === "1" ) {
    //console.log("keypressed");
    setFaceColors();
  } else if( topic.indexOf("key/right") > -1 && payload === "1" ) {
    embiggenCube();
  } else if( topic.indexOf("key/right") > -1 && payload === "0" ) {
    smallifyCube();
  }
}
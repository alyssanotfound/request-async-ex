var isMobile;
var container;

//not triggered by layer change
var camera, controls, scene, raycaster, renderer;
var lighting, ambient, keyLight, fillLight, backLight;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var cross;
//for rotating bust
var isDragging = false;
var previousMousePosition = {
    x: 0,
    y: 0
};

function initDesktop() {

    container = document.createElement('div');
    document.body.appendChild(container);

    if (!Detector.webgl) {
        Detector.addGetWebGLMessage();
    }
    /* Camera */

    // camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 1, 1000);
    // camera = new THREE.OrthographicCamera( window.innerWidth / - 3400, window.innerWidth / 3400,window.innerHeight / 3400, window.innerHeight / - 3400, 1, 500 );
    camera = new THREE.OrthographicCamera( window.innerWidth / - 2000, window.innerWidth / 2000,window.innerHeight / 2000, window.innerHeight / - 2000, 1, 500 );
    camera.position.set(0,0,1.5);
    // camera.position.x = 0.5;
    // camera.position.y = 0.07;
    // camera.position.z = 3.2;
    // camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    // camera.position.x = 0;
    // camera.position.y = 0;
    // camera.position.z = 1.5;

    /* Scene */

    scene = new THREE.Scene();

    ambient = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambient);

    sunLight = new THREE.SpotLight( 0xffffff, 0.7, 0, Math.PI/2 );
    sunLight.position.set( 1000, 2000, 1000 );
    sunLight.castShadow = true;
    scene.add( sunLight );

    // var pathToLoad = "../archive/mockup-assets/nandi-cross.obj";  
    // var objLoader = new THREE.OBJLoader();                    
    // objLoader.load(pathToLoad, function (obj) {
    //     scene.add(obj);  
    // });

    var objLoader = new THREE.OBJLoader();
    console.log(objLoader);
    // objLoader.setPath('../archive/mockup-assets/');
    
    objLoader.load('object3-III.obj', function (obj) {
        

        // console.log(obj);
        // object.rotation.y = 1;
        obj.traverse( function ( child ) {
            if ( child instanceof THREE.Mesh ) {
                // console.log(child);
                // child.material.ambient.setHex(0xFF0000);
                child.material.transparent = true;
                child.material.color.setHex(0xa98f74);
                child.material.needsUpdate = true;
                }
            } );
        obj.scale.set(0.15,0.15,0.15);
        obj.rotateY(Math.PI/8);
        obj.position.set(0,0.03,0);
        scene.add(obj);
        cross = obj;
        animate();
    });
    


    /* Vectors */
    raycaster = new THREE.Raycaster();

    /* Renderer */
    var canvas = document.getElementById("canvasID");
    
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
    
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(300,300,false);
    renderer.setClearColor(new THREE.Color(0xf7f9fc)); //2a6489
    //console.log(renderer.domElement);
    // container.appendChild(renderer.domElement);

    /* Controls */
  
    // controls = new THREE.OrbitControls(camera, renderer.domElement);
    // controls.enableDamping = true;
    // controls.dampingFactor = 0.25;
    // controls.enableZoom = false;

    document.getElementById("canvasID").onmousedown = function() {mouseDown()};
    document.getElementById("canvasID").onmousemove = function() {mouseMove(event)};
    document.getElementById("canvasID").onclick = function() {mouseDragOff()};

}

function initMobile() {

    console.log("mobile detected");
    // var updateClass = document.getElementById("twoD-scan");
    // if(updateClass) {
    //     updateClass.className += updateClass.className ? 'mobile' : 'mobile';
    // }
    // var updateClass = document.getElementById("mainbody");
    // if(updateClass) {
    //     updateClass.className += updateClass.className ? ' mobile' : ' mobile';
    // }
    // //URL
    // currentURL = window.location.hash;
    // if (currentURL != "") {
    //     // console.log("load specific URL");
    //     openInfoPanel(currentURL.substring(1, 6));
    //     // writeItemDescription(currentURL.substring(1, 6));
    // } else {
    //     // console.log("load first item");
    //     openInfoPanel("AO-01");
    // }

}

window.onload = function() {
    console.log("start onload");
    console.log(window.outerWidth);
    var canvas = document.getElementById("canvasID");
    console.log(canvas.height);

    if (window.outerWidth > 650) {
        isMobile = false;
        console.log("desktop detected");
        initDesktop(); 
        
    } else {
        isMobile = true;
        console.log("mobile detected");
        initMobile();
    }
};

function animate() {
    //console.log('called animate!');
    requestAnimationFrame(animate);
    // controls.update();
    render();
}

function render() {    
    renderer.render(scene, camera);
}

function mouseDown() {
    isDragging = true; 
    autoRotate = false; 
}

function mouseMove(e) {
    //console.log(e);
    var deltaMove = {
        x: e.offsetX-previousMousePosition.x,
        y: e.offsetY-previousMousePosition.y
    };
    if(isDragging) {
        var deltaRotationQuaternion = new THREE.Quaternion()
            .setFromEuler(new THREE.Euler(
                0,
                toRadians(deltaMove.x * 1),
                0,
                'XYZ'
            ));
        
        cross.quaternion.multiplyQuaternions(deltaRotationQuaternion, cross.quaternion);
    }
        
    previousMousePosition = {
        x: e.offsetX,
        y: e.offsetY
    };
} 

function mouseDragOff() {
    if (isDragging == true) {
        isDragging = false;
    } 
}
//Geometry functions
function toRadians(angle) {
    return angle * (Math.PI / 180);
}

function toDegrees(angle) {
    return angle * (180 / Math.PI);
}
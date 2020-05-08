
var isMobile;
var container;

//not triggered by layer change
var camera, controls, raycaster, renderer;
var canvas;

var scene = new THREE.Scene();
window.scene = scene;

var lighting, ambient, keyLight, fillLight, backLight;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var numModels = 13;
var testArray = [];
var incrementBustMatch = [3,2,1,0,12,11,10,9,8,7,6,5,4];
//indicate current layer
var layer = "one";
var LoadingTimeStamp = 0;
//check or change with each render, layer 1
//6.9 loads model centered
var initialtheta = 6.9;
var theta = initialtheta;
var targetTheta;
var pause = false;
var revolveDirection = "left";
var revolveClicked = false;
var openLayerTwoDelay = false;

//check or change when layer changes
var bustOn = undefined;
var allBustsOn = true;
var autoRotate = true;
var rotateAligned = false;
var elem;
var leftelem;
var baseelem;
var centerelem;

var storedTexture = [];

var currentURL;
//for rotating bust
var isDragging = false;
var previousMousePosition = {
    x: 0,
    y: 0
};
revolveLayerTwo = false;

function init() {
    /* Events - Mobile and Desktop */
    window.addEventListener('resize', onWindowResize, false);
    document.getElementById("title").onclick = function() {
        console.log("title clicked");
        goBackToLayerOne();
    };
    //2D | 3D options
    // document.getElementById("twod").onclick = function() {display2DScan();};
    document.getElementById("threed").onclick = function() {display3DScan();};
    document.getElementById("left").onclick = function() {
        console.log("left button pressed");
        display3DScan();
        turnOnAllBusts();
        revolveDirection = "right";
        findTargetTheta();
        revolveClicked = true;       
    };
    document.getElementById("right").onclick = function() {
        console.log("right button pressed");
        display3DScan();
        turnOnAllBusts();
        revolveDirection = "left";
        findTargetTheta();
        revolveClicked = true; 
    };

}

function initDesktop() {

    container = document.createElement('div');
    document.body.appendChild(container);
    var ModelCount = document.getElementById("modelCount");
    var LoadCount = document.getElementById("loadCount");

    if (!Detector.webgl) {
        Detector.addGetWebGLMessage();
    }
    /* Camera */
    camera = new THREE.OrthographicCamera( window.innerWidth / - 3400, window.innerWidth / 3400,window.innerHeight / 3400, window.innerHeight / - 3400, 1, 500 );
    // camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.set(0.5,0.12,3);

    /* Scene */
    lighting = false;

    ambient = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambient);

    topLeftLight = new THREE.DirectionalLight("rgb(184,176,149)", 0.9);
    topLeftLight.position.set(-40, 10, 50);
    topLeftLight.target.position.set(0.5,0,1.5);
    topLeftLight.target.updateMatrixWorld();
    topLeftLight.castShadow=true;
    scene.add(topLeftLight);

    frontSecondLight = new THREE.DirectionalLight("rgb(144,86,170)", 0.3);
    frontSecondLight.position.set(0.5, 0, 100);
    frontSecondLight.target.position.set(0.5,0,1.5);
    frontSecondLight.target.updateMatrixWorld();
    frontSecondLight.castShadow=true;
    scene.add(frontSecondLight);

    sunLight = new THREE.SpotLight( 0xffffff, 0, 0, Math.PI/2 );
    sunLight.position.set( 1000, 2000, 1000 );
    sunLight.castShadow = false;
    scene.add(sunLight);

    // spotlightBack = new THREE.SpotLight( "rgb(144,86,170)", 0.5, 156, 0.01, 0.7, 1.6 );
    // spotlightBack.position.set(0.5,0,40);
    // spotlightBack.target.position.set(0.5,0.05,1.5);
    // spotlightBack.target.updateMatrixWorld();
    // spotlightBack.castShadow = false;
    // scene.add( spotlightBack );

    /* Generate 13 busts */
    var paths = ["01","02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13"]
    // var paths = ["01","02", "03", "04", "05", "06"]

        .map(function(value) {
            return "assets/2018-AO-" + value + "/";
        });
    j = 0;
    function loadNextPath() {
        var pathToLoad = paths.pop();
        // console.time(pathToLoad);
        // var start = window.performance.now();
        // console.log("start: " + start);
        ModelCount.innerHTML = pathToLoad;
        if (!pathToLoad) {
            console.log("OK THERE SHOULD BE NO ANIMATES BEFORE THIS LINE!");
            animate();
            document.getElementById("loadingOverlay").style.display="none";
            if (currentURL != "") {
                //load specific piece
                var URLbust = 13 - currentURL.substring(4, 6);
                // console.log(currentURL.substring(1, 6));
                console.log("the current URL / model num is: " + URLbust);
                //now rotate busts to proper position
                //then change variable so bustOn will be opened
                var evenInterval = (360/numModels);
                targetTheta = theta + (evenInterval*incrementBustMatch[Number(URLbust)]);
                rotateAligned = true;
                // rotate bust 
                revolveClicked = true;
                //open layer 2
                openLayerTwoDelay = true;
                if (isMobile == true) {
                    openInfoPanel(currentURL.substring(1, 6));
                }
            }
        } else {
            var mtlLoader = new THREE.MTLLoader();
            mtlLoader.setBaseUrl(pathToLoad);
            mtlLoader.setPath(pathToLoad);                       
            mtlLoader.load('model_mesh.obj.mtl', function (materials) {

                materials.preload();
                var objLoader = new THREE.OBJLoader();
                objLoader.setMaterials(materials);
                objLoader.setPath(pathToLoad);
                // console.log("loading model");
                objLoader.load('model_mesh.obj', function (obj) {

                    obj.name = pathToLoad.substring(12, 17);
                    var mesh = obj.children[ 0 ]; 
                    mesh.geometry = new THREE.Geometry().fromBufferGeometry( mesh.geometry ); 
                    mesh.geometry.mergeVertices(); 
                    mesh.geometry.computeVertexNormals();
                    testArray.push(obj);
                    storedTexture[j] = obj.children[0].material.map;
                    // console.log(storedTexture[j]);
                    obj.scale.x = 0.9;
                    obj.scale.y = 0.9;
                    obj.scale.z = 0.9;
                    obj.position = -0.5;
                    scene.add(obj); 
                    j++; 
                    loadNextPath(); 
                });
            });
            // console.timeEnd(pathToLoad);
            var end = window.performance.now(); 
            // console.log("end: " + end);
            var time = end - LoadingTimeStamp;
            // console.log(time);
            LoadingTimeStamp = end;
            LoadCount.innerHTML = Math.round(time * 100 / 1000) / 100 + " s";
        }
    
    }
    loadNextPath();

    //URL
    currentURL = window.location.hash;

    /* Vectors */
    raycaster = new THREE.Raycaster();

    /* Renderer */
    canvas = document.getElementById("canvasID");
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(new THREE.Color(0xffffff)); //2a6489
    container.appendChild(renderer.domElement);

    /* Events - Desktop Only */
    //for dragging/rotating bust
    document.getElementById("imgDisplay").onmousedown = function() {mouseDown()};
    document.getElementById("imgDisplay").onmousemove = function() {mouseMove(event)};
    document.getElementById("imgDisplay").onclick = function() {mouseDragOff()};
    document.getElementById("canvasID").onclick = function() {onCanvasClick(event)};
    document.getElementById("leftblock").onclick = function() {goBackToLayerOne();};
    document.getElementById("rightblock").onclick = function() {goBackToLayerOne();};
    document.onkeydown = checkKey;
  
    var infoPanel = document.getElementById('infoPanel');
    infoPanel.addEventListener ('click',  function (e) {
        console.log("clicked info panel");
        e.stopPropagation();
        // msg (elem);
    }, false);

    //info panel
    // document.getElementById("infoButton").onclick = function() {toggleInfoPanel();};
    var itemBox = document.getElementById('itemBox-bottom');
    itemBox.addEventListener ('click',  function (e) {
        e.stopPropagation();
        // msg (elem);
    }, false);

    window.onpopstate=function() {
        // if (currentURL != "") {
            goBackToLayerOne();
        // }
    }
    //stats
    javascript:(function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();document.getElementById("stats").appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='//rawgit.com/mrdoob/stats.js/master/build/stats.min.js';document.head.appendChild(script);})()   
}

function initMobile() {

    console.log("mobile detected");
    // var updateClass = document.getElementById("twoD-scan");
    // if(updateClass) {
    //     updateClass.className += updateClass.className ? 'mobile' : 'mobile';
    // }
    var updateClass = document.getElementById("mainbody");
    if(updateClass) {
        updateClass.className += updateClass.className ? ' mobile' : ' mobile';
    }
    //URL
    currentURL = window.location.hash;
    if (currentURL != "") {
        // console.log("load specific URL");
        openInfoPanel(currentURL.substring(1, 6));
        // writeItemDescription(currentURL.substring(1, 6));
    } else {
        // console.log("load first item");
        openInfoPanel("AO-01");
    }

}

window.onload = function() {
    console.log("start onload");
    console.log("window pixel width: " + window.outerWidth);
    isMobile = false;
    initDesktop();
    init();

    if (window.outerWidth > 650) {
        console.log("desktop detected");
    //     isMobile = false;
    //     console.log("desktop detected");
    //     initDesktop();
    //     init(); 
        
    } else {
        console.log("mobile detected");
    //     document.getElementById("loadingOverlay").style.display="none";
    //     isMobile = true;
    //     console.log("mobile detected");
    //     initMobile();
    //     init();
    }
};

function checkURL() {
    console.log("check if URL changed");
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
        
        testArray[bustOn].quaternion.multiplyQuaternions(deltaRotationQuaternion, testArray[bustOn].quaternion);
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

function checkKey(e) {

    e = e || window.event;

    if (e.keyCode == '37' && revolveClicked == false) {
        if (layer == "two") {
            display3DScan();
            turnOnAllBusts(); 
            
        }
        revolveDirection = "right";
        findTargetTheta();
        revolveClicked = true;
    } else if (e.keyCode == '39' && revolveClicked == false) {
        if (layer == "two") {
            display3DScan();
            turnOnAllBusts(); 
        }
        revolveDirection = "left";
        findTargetTheta();
        revolveClicked = true;
    }
}
 

function onWindowResize() {
    // console.log("resize window");
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    
    // camera.aspect = window.innerWidth / window.innerHeight; 
    // camera.updateProjectionMatrix();
    // renderer.setSize( window.innerWidth, window.innerHeight );
    camera.left = window.innerWidth / - 3400;
    camera.right = window.innerWidth / 3400;
    camera.top = window.innerHeight / 3400;
    camera.bottom = window.innerHeight / - 3400;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );

}

function turnOnLights() {
    ambient.intensity = 0.76;
    scene.add(keyLight);
    scene.add(fillLight);
    scene.add(backLight);
}

function turnOffLights() {
    ambient.intensity = 1.0;
    scene.remove(keyLight);
    scene.remove(fillLight);
    scene.remove(backLight);
}

function onCanvasClick( event ) {
    //console.log("canvas clicked");
    
    var xClick = event.clientX;

    if (layer == "one" && (xClick > (0.33*window.innerWidth)) && (xClick < ((0.66*window.innerWidth))) && rotateAligned == true ){
        //console.log("go to layer 2");
        // if (rotateAligned == false) {
        //     //click is in center more to the left
        //     if (xClick < windowHalfX) {
        //         revolveDirection = "left";
        //     } else if (xClick > windowHalfX) {
        //         revolveDirection = "right";
        //     }
        //     console.log("rotate bust to the center");
        //     findTargetTheta();
        //     rotateOneBustInterval(); 
        // }
        layer = "two";
        // firstOpen = true; //so that this first click doesnt trigger layer 3

    } 
    if (layer == "one" && (xClick > (0.33*window.innerWidth)) && (xClick < ((0.66*window.innerWidth))) && rotateAligned == false ){
        //open layer two after bust is aligned
        openLayerTwoDelay = true;
    } 

    if (layer == "one" && (xClick < windowHalfX) && revolveClicked == false) {
        //switch bc we assume if someone clicks on the model 
        //on the left it should move towards them
        revolveDirection = "right";
        findTargetTheta();
        revolveClicked = true;
    } 

    if (layer == "one" && (xClick >= windowHalfX) && revolveClicked == false) {
        //rotate right
        revolveDirection = "left";
        findTargetTheta();
        revolveClicked = true;
    }
}

function goBackToLayerOne() { 
    // console.log(testArray[bustOn].rotation.y);
              
    if (baseelem) {
        baseelem.style.display = "none";   
    }
    if (elem) {
        elem.style.display = "none";   
    }
    if (leftelem) {
        leftelem.style.display = "none";   
    }
    if (centerelem) {
        centerelem.style.display = "none";   
    }
    display3DScan();
    
    turnOnAllBusts();
    autoRotate = true;
    // revolveDirection = "left";
    layer = "one";
    pause = false;
    rotateAligned = false;
    sunLight.intensity = 0.0;
    // spotlight.intensity = 0.6;
    history.pushState("", "", "index.html");
    currentURL = "";
    bustOn = undefined;
    // testArray[bustOn].rotation.y = -Math.PI/4; 
}

/* Core Animate Render Functions */

function animate() {
    //console.log('called animate!');
    requestAnimationFrame(animate);
    render();
}

//fix so that if only one bust is open the others arent being rendered
function render() {
    //console.log(theta);
    if (pause == false && layer == "one") {
        updateRevolution();   
    } 

    if (revolveClicked == true && layer == "one") {
        rotateOneBustInterval();
    } 
    //called when press L/R buttons on layer 2
    if (revolveClicked == true && layer == "two") {
        // allBustsOn = true;
        rotateOneBustInterval();
        bustOn = undefined;
    } else if (layer == "two") {
        // firstOpen = false;
        layerTwoUI();   
    }
    
    renderer.render(scene, camera);
}

/* Update Frame Functions */
function layerTwoUI() {
    // console.log("layer two UI called");
    if (allBustsOn == true) {
        //check if main page is loaded
        updateURL();
        isolateOneBust();
        openInfoPanel(testArray[bustOn].name);

        // m.attach({
        //     thumb: '#thumb',
        //     large: 'assets/2d-scan.png',
        //     largeWrapper: 'preview',
        //     mode: 'outside'
        // });

    } else {
        // console.log(testArray[bustOn].rotation.y);
        if (autoRotate == true) {
            testArray[bustOn].rotation.y -= 0.003;   
        }                
    }
}

// function display2DScan() {
//     console.log("display2DScan");
//     if (isMobile == false) {
//         testArray[bustOn].visible = false;   
//     } else if (isMobile == true) {
//         document.getElementById("threeD-gif").style.display = "none";  
//     }
//     document.getElementById("twoD-scan").style.display = "block";
//     document.getElementById("twod").style.fontFamily = "Avenir-Heavy";
//     document.getElementById("threed").style.fontFamily = "Avenir-Book";
// }

function display3DScan() {
    console.log("display3DScan");
    if (isMobile == false) {
        testArray[bustOn].visible = true;
        document.getElementById("threeD-gif").style.display = "none";    
    } else if (isMobile == true) {
        document.getElementById("threeD-gif").style.display = "block";  
    }
    document.getElementById("twoD-scan").style.display = "none";
    document.getElementById("threed").style.fontFamily = "Avenir-Heavy";
    document.getElementById("twod").style.fontFamily = "Avenir-Book";
}

function updateURL() {
    if (bustOn == undefined) {
        bustOn = findClosestBust();   
    }
    // console.log(testArray[bustOn].name);
    history.pushState("", "", "#" + testArray[bustOn].name);
    currentURL = window.location.hash;
}

function isolateOneBust() {
    //define bustOn to be the center one based on max z position value
    pause = true;
    
    testArray[bustOn].position.x = 0.5;
    //testArray[bustOn].position.x = 0.5;
    turnOffOtherBusts(bustOn); 
    // testArray[bustOn].visible = true;
    // console.log(storedTexture[bustOn]);
    // testArray[bustOn].children[0].material.map = storedTexture[bustOn];
    // testArray[bustOn].children[0].material.needsUpdate = true;
    sunLight.intensity = 0.3;
    ambient.intensity = 0.3;
    // spotlight.intensity = 1.0;
    // spotlightBack.intensity = 1.0;
}

function findClosestBust() {
    var closestBust;
    var closestZ = 0;
    for (var i = testArray.length - 1; i >= 0; i--) {
        //console.log(testArray[i].position.z);   
        if (testArray[i].position.z > closestZ) {
            closestZ = testArray[i].position.z;
            closestBust = i;
        }
    }
    return closestBust;
}

function openInfoPanel(item) {

    console.log(item);
    writeItemDescription(item);
    elem = document.getElementById('rightblock');
    baseelem = document.getElementById('layer2block');
    leftelem = document.getElementById('leftblock');
    centerelem = document.getElementById('centerblock');
    elem.style.display = 'block';
    baseelem.style.display = 'block';
    leftelem.style.display = 'block';
    centerelem.style.display = 'block';
}

function writeItemDescription(item) {
    var result = AllItems.filter(function( obj ) {
        return obj.name === item;
    });
    //assign associated shopify button
    // document.getElementById("buyButtonWrapper").firstChild.id = result[0].buttonID;
    // console.log(result[0].chain);
    document.getElementById('itemBox-top').style.display = "none";
    document.getElementById('itemBox-bottom').style.display = "block";
    document.getElementById('itemName-bottom').innerHTML = result[0].Artistname;
    document.getElementById('itemMaterial').innerHTML = result[0].material;
    document.getElementById('itemDimensions').innerHTML = "Dimensions " + result[0].dimensions;
    document.getElementById('itemPrice').innerHTML = result[0].price;
    // document.getElementById('itemCast').innerHTML = "Casted by: " + result[0].casted;
    // if (result[0].chain != undefined) {
    //     document.getElementById('itemChain').innerHTML = "Chain made by: " + result[0].chain;
    // } else if (result[0].chain == undefined) {
    //     document.getElementById('itemChain').innerHTML = "";
    // }
    document.getElementById('itemEdition').innerHTML = "Edition of " + result[0].edition;
    document.getElementById('twoD-scan').src = "/public/bust/assets/2D-scans/" + result[0].name + ".jpg";
    if (isMobile == true) {
        document.getElementById('itemBox-top').style.display = "block";
        document.getElementById('itemBox-bottom').style.display = "none";
        document.getElementById('itemName-top').innerHTML = result[0].name;
        document.getElementById('itemPrice').innerHTML = result[0].price;
        document.getElementById('threeD-gif').src = "/public/bust/assets/3D-gifs/" + result[0].name + "/threed.gif";
    } 
    // ShopifyBuyInit(item);
}


function turnOffOtherBusts(keepOn) {  
    console.log("turn off other busts"); 
    for (var i = testArray.length - 1; i >= 0; i--) {
        if (i != keepOn) {
            testArray[i].children[0].material.transparent = true;
            testArray[i].children[0].material.color.setHex( 0xD3D3D3 );
            testArray[i].children[0].material.map = null;
            testArray[i].children[0].material.needsUpdate = true;
        }     
    }
    allBustsOn = false;
}

function turnOnAllBusts() {
    console.log("turn on all busts called");
    for (var i = testArray.length - 1; i >= 0; i--) {
        if (i != bustOn) {
            testArray[i].visible = true;
            testArray[i].children[0].material.map = storedTexture[i];
            testArray[i].children[0].material.needsUpdate = true;
        }          
    }
    allBustsOn = true;
}


function updateRevolution() {
    var increment = 0.05; //changes speed
    var pathEllipse = 1.0;
    //theta is degrees
    if (revolveDirection == "left") {
        theta += increment;
    } else if (revolveDirection =="right"){
        theta -= increment;
    } else {
        console.log("error: undefined direction");
    }
    
    var radians = toRadians(theta);
    var radianPosition = 2*Math.PI/numModels;
    if (bustOn != undefined) {
        // console.log("see when pos changes after closing: " + radians);
    }

    for (var i = testArray.length - 1; i >= 0; i--) {
        testArray[i].position.x = Math.cos(radians + i*radianPosition)+0.5;
        testArray[i].position.z = pathEllipse * Math.sin(radians + i*radianPosition)+0.5; 
        testArray[i].rotation.y = -1*(radians-(Math.PI/2)+ i*radianPosition);
        // console.log(testArray[i].rotation.y);
    }
}

function findTargetTheta() {
    console.log("find target theta");
    var evenInterval = (360/numModels);
    if (rotateAligned == false) {
        // console.log("align rotation once");
        var incrementTheta = (((Math.abs((theta-initialtheta)/evenInterval)) % 1)*evenInterval);

        if (theta > 0 && revolveDirection == "left") {
            targetTheta = theta + evenInterval - incrementTheta;
        } else if (theta > 0 && revolveDirection == "right") {
            targetTheta = theta - incrementTheta;
        } else if (theta < 0 && revolveDirection == "left") {
            targetTheta = theta + incrementTheta;
        } else if (theta < 0 && revolveDirection == "right") {
            targetTheta = theta - (evenInterval - incrementTheta);
        } 
        rotateAligned = true;
    } else {
        console.log("find next");
        console.log("theta: " + theta);
        if (theta > 0 && revolveDirection == "left") {
            targetTheta = theta + evenInterval;
        } else if (theta > 0 && revolveDirection == "right") {
            targetTheta = theta - evenInterval;
        } else if (theta < 0 && revolveDirection == "left") {
            targetTheta = theta + evenInterval;
        } else if (theta < 0 && revolveDirection == "right") {
            targetTheta = theta - evenInterval;
        }
    }
}

function rotateOneBustInterval() {

    var increment = .6;
    var pathEllipse = 1;
    
    if (revolveDirection == "left") {
        theta += increment;
    } else if (revolveDirection =="right"){
        theta -= increment;
    } else {
        console.log("error: undefined direction");
    }
    

    var radians = toRadians(theta);
    var radianPosition = 2*Math.PI/numModels;

    for (var i = testArray.length - 1; i >= 0; i--) {
        testArray[i].position.x = Math.cos(radians + i*radianPosition)+0.5;
        testArray[i].position.z = pathEllipse * Math.sin(radians + i*radianPosition)+0.5; 
        testArray[i].rotation.y = -1*(radians-(Math.PI/2)+ i*radianPosition);
    }

    if (revolveDirection == "left" && (theta > targetTheta)) {
        // console.log("target reached, increasing theta");
        theta = targetTheta;
        pause = true;
        revolveClicked = false;
        if (openLayerTwoDelay == true) {
            layer = "two";
            // firstOpen = true;
            openLayerTwoDelay = false;
        }
        
    } else if (revolveDirection == "right" && (theta < targetTheta)) {
        // console.log("target reached, decreasing theta");
        theta = targetTheta;
        pause = true;
        revolveClicked = false;
        if (openLayerTwoDelay == true) {
           layer = "two";
            // firstOpen = true; 
            openLayerTwoDelay = false;
        }

    }
    // revolveLayerTwo = false;
}

//Geometry functions
function toRadians(angle) {
    return angle * (Math.PI / 180);
}

function toDegrees(angle) {
    return angle * (180 / Math.PI);
}





var container;

var currentURL;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;


function initDesktop() {

    

    window.addEventListener('resize', onWindowResize, false);

    
    // document.getElementById("leftblock").onclick = function() {goBackToLayerOne();};
    // document.getElementById("rightblock").onclick = function() {goBackToLayerOne();};
    // document.onkeydown = checkKey;

    //2D | 3D options
    document.getElementById("twod").onclick = function() {display2DScan();};
    document.getElementById("threed").onclick = function() {display3DScan();};

    // var infoPanel = document.getElementById('infoPanel');
    // infoPanel.addEventListener ('click',  function (e) {
    //     console.log("clicked info panel");
    //     e.stopPropagation();
    //     // msg (elem);
    // }, false);

    
    currentURL = window.location.hash;
    updateURL();
    openInfoPanel();
    //SHOPIFY BUTTONS
    //make a function so that the id is generated based on the item number
    // document.getElementById("buyButtonWrapper").firstChild.id = "product-component-21fa7a5ac51";

    //stats
    // javascript:(function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();document.getElementById("stats").appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='//rawgit.com/mrdoob/stats.js/master/build/stats.min.js';document.head.appendChild(script);})()   
}


window.onload = function() {
    console.log("start onload");
    console.log(window.outerWidth);
    if (window.outerWidth > 700) {
        console.log("desktop detected");
    } else {
        console.log("mobile detected");
        initDesktop(); 
    }
};

function checkURL() {
    console.log("check if URL changed");
}


function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    // camera.aspect = window.innerWidth / window.innerHeight;
    // camera.updateProjectionMatrix();            
    // renderer.setSize(window.innerWidth, window.innerHeight); 
    // var previewWidth = document.getElementById("preview").clientWidth;
    // document.getElementById("preview").style.height = previewWidth*1.3775 + "px";
    // if (window.innerHeight < 700) {
    //     console.log("height is less than 700");
    // } else {
        
    // }
    

}




function display2DScan() {
    testArray[bustOn].visible = false;
    document.getElementById("twoD-scan").style.display = "block";
    document.getElementById("threeD-gif").style.display = "none";
    document.getElementById("twod").style.fontFamily = "Avenir-Heavy";
    document.getElementById("threed").style.fontFamily = "Avenir-Book";
}

function display3DScan() {
    testArray[bustOn].visible = true;
    document.getElementById("twoD-scan").style.display = "none";
    document.getElementById("threeD-gif").style.display = "block";
    document.getElementById("threed").style.fontFamily = "Avenir-Heavy";
    document.getElementById("twod").style.fontFamily = "Avenir-Book";
}

function updateURL() {
    // if (bustOn == undefined) {
    //     bustOn = findClosestBust();   
    // }
    // console.log(testArray[bustOn].name);
    history.pushState("", "", "#" + "AO-01");
    currentURL = window.location.hash;
}



function openInfoPanel() {
    writeItemDescription("AO-01");
    elem = document.getElementById('rightblock');
    baseelem = document.getElementById('layer2block');
    leftelem = document.getElementById('leftblock');
    centerelem = document.getElementById('centerblock');
    elem.style.display = 'block';
    baseelem.style.display = 'block';
    leftelem.style.display = 'block';
    centerelem.style.display = 'block';

    // var previewWidth = document.getElementById("preview").clientWidth;
    // document.getElementById("preview").style.height = previewWidth*1.3775 + "px";
    // console.log(document.getElementById("preview").style.width);
    //inner zoom
    //new ImageZoom("img", {/*options*/});
    
    //make so it only applies to product img
    // new ImageZoom("img", {  
    //     maxZoom: 5, 
    // });

}

function writeItemDescription(item) {

    // console.log("item opened: " + item);

    var result = AllItems.filter(function( obj ) {
        // console.log(obj.name);
        return obj.name === item;
    });
    //assign associated shopify button
    document.getElementById("buyButtonWrapper").firstChild.id = result[0].buttonID;
    // console.log(result[0].chain);
    document.getElementById('itemName').innerHTML = result[0].name;
    document.getElementById('itemPrice').innerHTML = result[0].price;
    document.getElementById('itemMaterial').innerHTML = "Material: " + result[0].material;
    document.getElementById('itemDimensions').innerHTML = "Dimensions: " + result[0].dimensions;
    document.getElementById('itemCast').innerHTML = "Casted by: " + result[0].casted;
    if (result[0].chain != undefined) {
        document.getElementById('itemChain').innerHTML = "Chain made by: " + result[0].chain;
    } else if (result[0].chain == undefined) {
        document.getElementById('itemChain').innerHTML = "";
    }
    document.getElementById('itemEdition').innerHTML = "Edition of " + result[0].edition;
    document.getElementById('twoD-scan').src = "/public/bust/assets/2D-scans/" + result[0].name + ".jpg";
    document.getElementById('threeD-gif').src = "/public/bust/assets/3D-gifs/" + result[0].name + "/01.png";
    ShopifyBuyInit(item);
}


















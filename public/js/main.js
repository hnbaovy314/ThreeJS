import {getElementInfo, clearDiv, getElementImg} from './element-tools.js';
import {onElementImg, onCrystalStructure, onCategories} from './eventListener.js'
import {getAllElements, getElementGroup} from './dataRetriever.js'

var demoData = [
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

var demoTable = [
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 6, 7, 8, 9, 10],
    [11, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 13, 14, 15, 16, 17, 18],
    [19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36],
    [37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54],
    [55, 56, 0, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86],
    [87, 88, 0, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 0],
    [0, 0, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 0]
];

var container, stats, raycaster, meshArr = []; // Array to hold all meshes that needs disposing
var currentCamera, defaultCamera, currentScene, currentRenderer, currentControls, defaultControls, currentRaycastTarget;
var tableScene, tableRenderer;
var mouse = new THREE.Vector2(), previewMouse = new THREE.Vector2(),
    INTERSECTED;
// var data = require('./data')

// Variable
var periodicTable = [];
var elementBoxSize = 3;
var gridSeparation = 4;
var elementTextGridSize = 0.8;
var fontUrl = "fonts/helvetiker_bold.typeface.json";
var firstSize = 0.8, secondSize = 0.3, thirdSize = 0.25, fourthSize = 0.15;

// Build preview panel for element data preview
var previewPanelSize = 200;
var previewPanel = document.createElement('div');
previewPanel.setAttribute('id', 'preview-panel');
previewPanel.style.width = previewPanelSize + 'px';
previewPanel.style.height = previewPanelSize + 'px';
previewPanel.style.opacity = 0;

const eleOrbit = [['1s'],
                ['2s', '2p'],
                ['3s', '3p', '3d'],
                ['4s', '4p', '4d', '4f'],
                ['5s', '5p', '5d', '5f'],
                ['6s', '6p', '6d'],
                ['7s', '7p']]

const orbit = ['1s', '2s', '2p', '3s', '3p', '3d', '4s', '4p', '4d', '4f', '5s', '5p',
                '5d', '5f', '6s', '6p', '6d', '7s', '7p'];
const orbitNum = [2, 2, 6, 2, 6, 10, 2, 6, 10, 2, 6,
                  14, 10, 2, 6, 2, 14, 10, 6, 2];
// Build data screen
var elementCamera, elementScene, elementRenderer, elementControls; // Camera, scene, renderer & controls for element model
var dataScreen = document.createElement('div');
dataScreen.setAttribute('id', 'data-screen');
// IMPORTANT!
// Thông tin nguyên tử thì thêm vào phần left/right column
// Cứ dùng document.createElement để tạo 1 cái div/p mới rồi append child vào
// Tham khảo cách t build ở trên (cái previewPanel ấy)
// Có gì thì hỏi
// T về ngủ

var elements = getAllElements();
var phaseFilter = getElementGroup('phase');
var catFilter = getElementGroup('category');


var phaseHolder, catHolder = null;
var filterHolder = [];
var filterOn = '';

init();
animate();

function init() {
    container = document.createElement('div');
    container.setAttribute('id', 'main-container');
    document.body.appendChild(container);
    //filter controller
    createFilterController();
    addColAndCloseBtn();

    //Element Model
    calcEPerShell();
    for (var i=0; i < elements.length; i++){
        elements[i].eConf = make1DArray(elements[i].eConf);
    }

    // Init for default camera, used throughout the app
    defaultCamera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        1,
        100
    );
    defaultCamera.position.set(0, 0, 0);
    currentCamera = defaultCamera;

    // Init for periodic table scene as the default scene
    tableScene = new THREE.Scene();
    tableScene.background = new THREE.Color(0xecf0f1);
    currentScene = tableScene;

    tableRenderer = new THREE.WebGLRenderer();
    tableRenderer.setPixelRatio(window.devicePixelRatio);
    tableRenderer.setSize(window.innerWidth, window.innerHeight);
    tableRenderer.setClearColor(0xecf0f1, 1);
    currentRenderer = tableRenderer;

    container.appendChild(currentRenderer.domElement);
    container.appendChild(previewPanel);
    container.appendChild(dataScreen);

    currentScene.add(getElementGrid(demoTable));

    raycaster = new THREE.Raycaster();
    currentRaycastTarget = periodicTable;

    // Init controls for periodic table scene (also the default controls)
    defaultControls = new THREE.OrbitControls(defaultCamera, tableRenderer.domElement);
    defaultControls.enableDamping = true;
    defaultControls.dampingFactor = 0.1;
    defaultControls.rotateSpeed = 0.25;
    defaultControls.zoomSpeed = 5;
    defaultControls.minDistance = 10;
    defaultControls.maxDistance = 60;
    defaultControls.maxPolarAngle = Math.PI * 5 / 6;
    defaultControls.minPolarAngle = Math.PI / 6;
    defaultControls.maxAzimuthAngle = Math.PI / 4;
    defaultControls.minAzimuthAngle = -Math.PI / 4;
    defaultControls.enablePan = false;
    defaultControls.target.set(0, 0, -50);
    currentControls = defaultControls;

    // Init for element detail data screen
    // with different camera, scene, renderer and controls
    elementCamera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        1,
        1000
    );
    elementCamera.position.z = 50;
    elementCamera.lookAt(new THREE.Vector3(0, 0, 0));

    elementScene = new THREE.Scene();

    elementRenderer = new THREE.WebGLRenderer();
    elementRenderer.setSize(window.innerWidth, window.innerHeight);
    elementRenderer.setPixelRatio(window.devicePixelRatio);
    elementRenderer.setClearColor(0xecf0f1, 1);
    var erContainer = document.createElement('div'); // Element Renderer Container
    erContainer.setAttribute('id', 'ds-er-container');
    erContainer.appendChild(elementRenderer.domElement);
    dataScreen.appendChild(erContainer);

    elementControls = new THREE.TrackballControls(elementCamera, elementRenderer.domElement);
    elementControls.enableDamping = true;
    elementControls.dampingFactor = 0.2; //give a sense of weight to the control
    elementControls.rotateSpeed = 2;
    elementControls.zoomSpeed = 5;
    elementControls.minDistance = 20;
    elementControls.maxDistance = 80;
    elementControls.noPan = true;

    var spotLightGroup = new THREE.Group();

    var spotLight1 = new THREE.SpotLight(0xF2F2F2);
    spotLight1.position.set(0, 0, 10);
    spotLight1.penumbra = 1;
    spotLight1.lookAt = new THREE.Vector3(0, 0, 0);
    spotLight1.castShadow = true;
    spotLight1.intensity = 1;
    spotLight1.name = 'spotLight1';

    var spotLight2 = new THREE.SpotLight(0xF2F2F2);
    spotLight2.position.set(0, 0, -10);
    spotLight2.penumbra = 1;
    spotLight2.lookAt = new THREE.Vector3(0, 0, 0);
    spotLight2.castShadow = true;
    spotLight2.intensity = 1;
    spotLight2.name = 'spotLight2';

    elementScene.add(spotLight1);
    elementScene.add(spotLight2);

    // Performance Stats
    // stats = new Stats();
    // container.appendChild(stats.dom);

    //BGM - .mp3 only
    // loadBGM('sound.mp3');

    // Add listeners
    document.addEventListener('click', onTableBoxClick, false);

    document.addEventListener('mousemove', onDocumentMouseMove, false);
    window.addEventListener('resize', onWindowResize, false);

    document.getElementById('ds-close-button').addEventListener('click', onElementModelCloseButtonClick, false);

    var phaseBtn = document.getElementsByClassName('phase-button');
    for (var i = 0; i < phaseBtn.length; i++){
        phaseBtn[i].addEventListener('mouseenter', onPhaseHover, false);
        phaseBtn[i].addEventListener('mouseleave', onPhaseLeave, false);
        phaseBtn[i].addEventListener('click', onPhaseClick, false);
    }

    var catBtn = document.getElementsByClassName('cat-button');
    for (var i = 0; i < catBtn.length; i++){
        catBtn[i].addEventListener('mouseenter', onCatHover, false);
        catBtn[i].addEventListener('mouseleave', onCatLeave, false);
    }
}

function addColAndCloseBtn() {
    // Add left and right column
    var newElement = document.createElement('div');
    var subInfo = document.createElement('div');
    var infoText = document.createElement('div');
    var subBtn = document.createElement('div');
    var iconArr = [
            '<i class="far fa-image fa-2x"></i>',
            '<i class="fas fa-cubes fa-2x"></i>',
            '<i class="fas fa-list fa-2x"></i>',
            '<i class="fab fa-wikipedia-w fa-2x"></i>'
    ];
    newElement.setAttribute('id', 'ds-left-column');
    subInfo.setAttribute('id', 'left-main-info');
    infoText.setAttribute('id', 'left-info-text');
    subInfo.appendChild(infoText);
    newElement.appendChild(subInfo);
    subInfo = document.createElement('div');
    subInfo.setAttribute('id', 'left-sub-info');
    subBtn.setAttribute('id', 'left-info-btn');
    for (var i=0; i < 4; i++) {
        var btn = document.createElement('span');
        btn.setAttribute('class', 'info-button');
        btn.setAttribute('id', `infoBtn${i}`);
        btn.innerHTML = iconArr[i];
        subBtn.appendChild(btn);
    }

    newElement.appendChild(subBtn);
    newElement.appendChild(subInfo);
    dataScreen.appendChild(newElement);
    // newElement = document.createElement('div');
    // newElement.setAttribute('id', 'ds-right-column');
    // dataScreen.appendChild(newElement);
    // Add close button
    var newElement = document.createElement('div');
    newElement.setAttribute('id', 'ds-close-button');
    newElement.appendChild(document.createElement('b'));
    newElement.appendChild(document.createElement('b'));
    newElement.appendChild(document.createElement('b'));
    newElement.appendChild(document.createElement('b'));
    dataScreen.appendChild(newElement);
}

function calcEPerShell(){
    for (var i=0; i < elements.length; i++) {
        var ePerShell = [];
        for (var j=0; j < elements[i].eConf.length; j++){
            ePerShell.push(elements[i].eConf[j].reduce((a, b) => a+b));
        }
        elements[i]['ePerShell'] = ePerShell;
    }
}

function make1DArray(arr){
    var result = [];
    for (var i=0; i < arr.length; i++){
        for (var j=0; j < arr[i].length; j++){
            result.push(arr[i][j]);
        }
    }
    return result;
}

function createFilterController() {
    //for the filter controller
    var filter = document.createElement('div');
    var temp;
    filter.setAttribute('id', 'filter-controller');

    var phase = document.createElement('div');
    phase.setAttribute('class', 'filter-block');
    phase.setAttribute('id', 'phase-filter');
    for (var i=0; i < phaseFilter.length; i++){
        temp = document.createElement('button');
        temp.setAttribute('id', `phase${i}`);
        temp.setAttribute('class', 'phase-button');
        temp.innerText = phaseFilter[i];
        phase.appendChild(temp);
    }
    filter.appendChild(phase);

    var cat = document.createElement('div');
    phase.setAttribute('class', 'filter-block');
    phase.setAttribute('id', 'category-filter');
    for (var i=0; i < catFilter.length; i++){
        temp = document.createElement('button');
        temp.setAttribute('id', `cat${i}`);
        temp.setAttribute('class', 'cat-button');
        temp.innerText = catFilter[i];
        phase.appendChild(temp);
    }
    filter.appendChild(cat);

    container.appendChild(filter);
}

function onCatHover(event) {
    var catID = event.target.id.slice(3);
    var cat = catFilter[catID];
    for (var i = 0; i < elements.length; i++) {
        if (elements[i].cat === cat) {
            var tmpEleBox = tableScene.getObjectByName(`box${elements[i].z}`);
            var tmpElePlane = tableScene.getObjectByName(`plane${elements[i].z}`);
            tmpElePlane.opacity = 0;
            // var z1 = tmpElePlane.position.z + 3;
            // var z2 = tmpEleBox.position.z + 3;
            // var tween1 = new TWEEN.Tween(tmpElePlane.position)
            //     .to({ z: z1 }, 100)
            //     .easing(TWEEN.Easing.Quadratic.Out).
            //     start();
            // var tween2 = new TWEEN.Tween(tmpEleBox.position)
            //     .to({ z: z2 }, 100)
            //     .easing(TWEEN.Easing.Quadratic.Out).
            //     start();
            tmpElePlane.position.z += 3;
            tmpEleBox.position.z += 3;
            filterHolder.push(elements[i]);
        }
    }
    filterOn = event.target.id;
}

function onCatLeave(event) {
    if (filterOn != event.target.id) {
        return;
    }
    var catID = event.target.id.slice(3);
    var cat = catFilter[catID];
    for (var i = 0; i < filterHolder.length; i++) {
        var tmpEleBox = tableScene.getObjectByName(`box${filterHolder[i].z}`);
        var tmpElePlane = tableScene.getObjectByName(`plane${filterHolder[i].z}`);
        tmpEleBox.opacity = 1;
        // var z1 = tmpElePlane.position.z - 3;
        // var z2 = tmpEleBox.position.z - 3;
        // var tween1 = new TWEEN.Tween(tmpElePlane.position)
        //     .to({ z: z1 }, 100)
        //     .easing(TWEEN.Easing.Quadratic.In).
        //     start();
        // var tween2 = new TWEEN.Tween(tmpEleBox.position)
        //     .to({ z: z2 }, 100)
        //     .easing(TWEEN.Easing.Quadratic.In).
        //     start();
        tmpElePlane.position.z -= 3;
        tmpEleBox.position.z -= 3;
    }
    filterHolder.length = 0;
    filterOn = '';
}

function onPhaseHover(event) {
    if(filterOn != '') {
        return;
    }
    var phaseID = event.target.id.slice(5);
    var phase = phaseFilter[phaseID];
    for (var i = 0; i < elements.length; i++) {
        if (elements[i].phase === phase) {
            var tmpEleBox = tableScene.getObjectByName(`box${elements[i].z}`);
            var tmpElePlane = tableScene.getObjectByName(`plane${elements[i].z}`);
            tmpElePlane.position.z += 3;
            tmpEleBox.position.z += 3;
            filterHolder.push(elements[i]);
        }
    }
    filterOn = event.target.id;
}

function onPhaseLeave(event) {
    if (filterOn != event.target.id) {
        return;
    }
    var phaseID = event.target.id.slice(5);
    var phase = phaseFilter[phaseID];
    for (var i = 0; i < filterHolder.length; i++) {
        var tmpEleBox = tableScene.getObjectByName(`box${filterHolder[i].z}`);
        var tmpElePlane = tableScene.getObjectByName(`plane${filterHolder[i].z}`);
        // var z1 = tmpElePlane.position.z - 3;
        // var z2 = tmpEleBox.position.z - 3;
        // var tween1 = new TWEEN.Tween(tmpElePlane.position)
        //     .to({ z: z1 }, 200)
        //     .easing(TWEEN.Easing.Quadratic.In).
        //     start();
        // var tween2 = new TWEEN.Tween(tmpEleBox.position)
        //     .to({ z: z2 }, 200)
        //     .easing(TWEEN.Easing.Quadratic.In).
        //     start();
        tmpElePlane.position.z -= 3;
        tmpEleBox.position.z -= 3;
    }
    filterHolder.length = 0;
    filterOn = '';
}

function onPhaseClick(event) {
    var phaseID = event.target.id.slice(5);
    if (phaseHolder === phaseID) {
        for(i = 0; i < filterHoler.length; i++){
            var tmpEleBox = tableScene.getObjectByName(`box${elements[filterHoler[i]].z}`);
            var tmpElePlane = tableScene.getObjectByName(`plane${elements[filterHolder[i]].z}`);
            tmpEleBox.opacity = 1;
            tmpEleBox.position.z -= 3;
            tmpElePlane.position.z -= 3;
        }
    }
    else {
        for(i = 0; i < filterHoler.length; i++){
            var tmpEleBox = tableScene.getObjectByName(`box${elements[filterHoler[i]].z}`);
            var tmpElePlane = tableScene.getObjectByName(`plane${elements[filterHolder[i]].z}`);
            tmpEleBox.opacity = 1;
            tmpEleBox.position.z -= 3;
            tmpElePlane.position.z -= 3;
        }
    }
}

function onWindowResize() {
    currentCamera.aspect = window.innerWidth / window.innerHeight;
    currentCamera.updateProjectionMatrix();
    currentRenderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(event) {
    event.preventDefault();

    var filterCtrlHeight = $('#filter-controller').outerHeight(true);

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -((event.clientY - filterCtrlHeight) / window.innerHeight) * 2 + 1;

    previewMouse.x = event.clientX;
    previewMouse.y = event.clientY - filterCtrlHeight;
}

// Listening for click event, combining with the INTERSECTED
// If click event happens when INTERSECTED is not null (meaning the user is clicking on an object),
// get the data screen of the element
function onTableBoxClick(event) {
    event.preventDefault();

    if (INTERSECTED) {
        currentControls.reset();
        currentControls.update();

        // Return the raycast, INTERSECTED and preview panel to clean state
        currentRaycastTarget = null;
        INTERSECTED.children[0].material.opacity = 0.25;
        var atomicNumber = INTERSECTED.name.slice(3);
        var element = elements[atomicNumber-1];
        INTERSECTED = null;
        hidePreviewPanel();
        document.body.style.cursor = "auto";

        dataScreen.style.transform = 'translateY(-100vh)';
        dataScreen.style.opacity = 1;

        getElementModel(atomicNumber);

        var infoPanelWidth = ($('#ds-left-column').outerWidth(true)/window.innerHeight)*2+1;
        // Switch to element model camera, scene & ...
        currentCamera = elementCamera;
        currentScene = elementScene;
        currentRenderer = elementRenderer;

        currentScene.position.x += infoPanelWidth;
        currentCamera.position.x += infoPanelWidth;

        currentControls = elementControls;
        currentCamera.position.z = 60;
        var element = elements[atomicNumber-1];
        var eConfig = calcElectronConf(atomicNumber, element.eConf);
        getElementInfo(element, 'left-info-text', eConfig);
        getElementImg('left-sub-info', atomicNumber);
        $('#infoBtn0').addClass('infoBtn-focus');
        $('#infoBtn0').on('click', function() {
            $('.infoBtn-focus').removeClass('infoBtn-focus');
            $('#infoBtn0').addClass('infoBtn-focus');
            onElementImg(atomicNumber, 'left-sub-info');
        });
        $('#infoBtn1').on('click', function() {
            $('.infoBtn-focus').removeClass('infoBtn-focus');
            $('#infoBtn1').addClass('infoBtn-focus');
            onCrystalStructure(element.crystalStructure, 'left-sub-info');
        });
        $('#infoBtn2').on('click', function() {
            $('.infoBtn-focus').removeClass('infoBtn-focus');
            $('#infoBtn2').addClass('infoBtn-focus');
            onCategories(element.cat, 'left-sub-info');
        })
        $('#infoBtn3').on('click', function() {
            var wnd = window.open(`https://en.wikipedia.org/wiki/${element.name}`);
        });
    }
}

// Listening for click event on the element model panel close button
function onElementModelCloseButtonClick(event) {
    event.preventDefault();

    currentControls.reset();
    currentControls.update();

    dataScreen.style.transform = 'translateY(100vh)';
    dataScreen.style.opacity = 0;
    clearDiv('left-info-text');
    clearDiv('left-sub-info');

    // Switch to table camera, scene & ...
    currentCamera = defaultCamera;
    currentScene = tableScene;
    currentRenderer = tableRenderer;
    currentControls = defaultControls;
    currentRaycastTarget = periodicTable;

    // Remove element model from elementScene
    destroyElementModel();

    currentControls.reset();
    currentControls.target.set(0, 0, -50);
    currentCamera.position.x = 0;
    currentCamera.position.y = 0;
    currentCamera.position.z = 0;
    currentCamera.updateProjectionMatrix();
}

// Get individual element
function getElement(size, element) {
    var group = new THREE.Group();


    // Create canvas and write text on it
    var canvas = document.createElement('canvas');
    var canvasSize = 256;
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    var ctx = canvas.getContext('2d');

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#2c3e50";
    // Atomic Number
    ctx.font = "bold 32pt helvetica";
    ctx.fillText(element.z, canvasSize / 2, canvasSize / 7);
    // Symbol
    ctx.font = "bold 70pt helvetica";
    ctx.fillText(element.symbol, canvasSize / 2, canvasSize / 2);
    // Name
    ctx.font = "bold 28pt helvetica";
    ctx.fillText(element.name, canvasSize / 2, canvasSize / 1.25);
    // Atomic Weight
    ctx.font = "bold 16pt helvetica";
    ctx.fillText(element.atomicWeight, canvasSize / 2, canvasSize / 1.0875);

    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    var planeGeometry = new THREE.PlaneBufferGeometry(size, size, size);
    var planeMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
        transparent: true
    });

    var boxGeometry = new THREE.BoxBufferGeometry(size, size, size / 2);
    var boxMaterial = new THREE.MeshBasicMaterial({
        opacity: 0,
        transparent: true,
    });
    var edges = new THREE.EdgesGeometry(boxGeometry);
    var line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({color: 0x1A1A1A}));
    line.material.depthTest = false;
    line.material.opacity = 0.25;
    line.material.transparent = true;

    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    var box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.name = `box${element.z}`;
    plane.name = `plane${element.z}`;
    box.add(line);

    group.add(plane);
    group.add(box);

    periodicTable.push(box);

    return group;
}

function loadBGM(link){
    document.write('<audio loop autoplay="autoplay">');
    document.write('<source src="'+link+'" type="audio/mpeg">');
    document.write('<!--[if lt IE 9]>');
    document.write('<bgsound src="'+link+'" loop="100">');
    document.write('<![endif]-->');
    document.write('</audio>');
}

function getTableHeader(width, positionY) {
    // Create canvas and write text on it
    var canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 256;
    var ctx = canvas.getContext('2d');

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#A49A87";
    ctx.font = "bold 64pt helvetica";
    ctx.fillText("PERIODIC TABLE OF ELEMENTS", canvas.width / 2, canvas.height / 2);
    ctx.font = "bold 28pt helvetica";
    ctx.fillText("By Mashiron (and some insignificant one)", canvas.width / 2, canvas.height / 1.25);

    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    var geometry = new THREE.PlaneBufferGeometry(width, width / 8, 1);
    var material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
        transparent: true
    });

    var mesh = new THREE.Mesh(geometry, material);

    mesh.position.x = 0;
    mesh.position.y = positionY / 1.75;
    mesh.position.z += 1;

    return mesh;
}

// Get periodic table grid
function getElementGrid(table) {
    var group = new THREE.Group();
    var k = 0;

    for (var i = 0; i < table.length; i++) {
        for (var j = 0; j < table[0].length; j++) {
            if (table[i][j]) {
                var mesh = getElement(elementBoxSize, elements[table[i][j]-1]);
                mesh.position.x = j * gridSeparation - (gridSeparation * (table[0].length - 1)) / 2;
                mesh.position.y = -(i * gridSeparation + elementBoxSize / 2) + (gridSeparation * (table.length - 1)) / 2;
                group.add(mesh);
                k += 1;
            }
        }
    }

    group.add(getTableHeader(table[0].length * gridSeparation, gridSeparation * table.length));

    group.position.z = -50;

    tableScene.add(group);

    return group;
}

// function calcEperOrbit(z) {
//   var eConfig = [];
//   var tmp = z;
//   for (i = 0; i < orbit.length; i++) {
//
//   }
// }

function calcElectronConf(z, eConf) {
  var eConfig = '';
  for (var i=0; i < eConf.length; i++){
      eConfig = eConfig.concat(orbit[i], eConf[i].toString(), ' ');
  }
  if (z > 10 & z <= 18){
    eConfig = eConfig.replace('1s2 2s2 2p6 ', '[Ne]');
  }
  else if (z > 18 & z <= 36){
    eConfig = eConfig.replace('1s2 2s2 2p6 3s2 3p6 ', '[Ar]');
  }
  else if (z > 36 & z <= 54){
    eConfig = eConfig.replace('1s2 2s2 2p6 3s2 3p6 3d10 4s2 4p6 ', '[Kr]');
  }
  else if (z > 54 & z <= 86){
    var f4 = eConfig.match(/4f[1-9]+/);
    eConfig = eConfig.replace(/1s2 2s2 2p6 3s2 3p6 3d10 4s2 4p6 4d10[a-z 1-9]+5s2 5p6/, '[Xe] ');
    eConfig = eConfig.slice(0, 5) + f4 + eConfig.slice(5);
  }
  else {
    var f5 = eConfig.match(/5f[1-9]+/)
    eConfig = eConfig.replace(/1s2 2s2 2p6 3s2 3p6 3d10 4s2 4p6 4d10 4f14 5s2 5p6 5d10[a-z 1-9]+6s2 6p6/, '[Rn] ');
    eConfig = eConfig.slice(0, 5) + f5 + eConfig.slice(5);
  }

  return eConfig;
}

// Get element preview data panel
function getPreviewPanel(z) {
    var width = window.innerWidth;
    var height = window.innerHeight;
    var size = previewPanelSize;
    var offset = size / 4;
    var element = elements[z-1];
    var eConfig = calcElectronConf(z, element.eConf);

    var newPos = {x: 0, y: 0};
    newPos.x = previewMouse.x + offset;
    newPos.y = previewMouse.y + offset;

    // Check for overflow
    if (newPos.x + size >= width ) {
        newPos.x = width - size - 10;
    }
    if (newPos.y + size >= height) {
        newPos.y = height - size - 10;
    }

    previewPanel.innerHTML = `
        <h2>${element.z} - ${element.name}</h2>
        <ul>
        <li>Atomic Weight: <b>${element.atomicWeight}</b></li>
        <li>E.Config: <b>${eConfig}</b></li>
        </ul>
        <h1 class="symbol">${element.symbol}</h1>`;
    previewPanel.style.transform = 'translate(' + newPos.x + 'px, ' + newPos.y + 'px)';
    previewPanel.style.opacity = 1;
}

// Hide element preview data panel
function hidePreviewPanel() {
    previewPanel.style.opacity = 0;
}

// Create orbit layer of eletrons
function getElementModelOrbitLayer(electronNumber, radius, tilt, z) {
    var orbitContainer = new THREE.Object3D();
    orbitContainer.rotation.x = tilt;

    var orbit = new THREE.Object3D();
    var mergedGeometry = new THREE.Geometry();

    var orbitGeometry = new THREE.CircleGeometry(radius, 100);
    orbitGeometry.vertices.shift();
    var line = new THREE.LineSegments(orbitGeometry, new THREE.LineBasicMaterial({color: 0x1A1A1A}));
    line.material.depthTest = false;
    line.material.transparent = true;

    var electronGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    var electronMaterial = new THREE.MeshBasicMaterial({
        color: 0x1A1A1A,
    });

    var angle = 2 * Math.PI / electronNumber;
    var count = 0;
    for (var i = 0; i < electronNumber; i++) {
        var x = Math.cos(angle * count) * radius;
        var y = Math.sin(angle * count) * radius;
        count++;

        electronGeometry.translate(x, y, 0);
        mergedGeometry.merge(electronGeometry);
        electronGeometry.translate(-x, -y, 0);
    }

    var electronMesh = new THREE.Mesh(mergedGeometry, electronMaterial);

    orbit.add(line);
    orbit.add(electronMesh);

    var tween = new TWEEN.Tween(orbit.rotation)
        .to({z: '+' + Math.PI * 8 / radius}, 10000)
        .repeat(Infinity)
        .start();

    orbit.name = 'electron-orbit';
    orbitContainer.add(orbit);

    meshArr.push(line);
    meshArr.push(electronMesh);

    return orbitContainer;
}

// Get element atomic model
function getElementModel(z) {
    var atomicNumber = z; // = Number of protons = Number of electrons
    var atomicWeight = elements[z-1].atomicWeight;
    var ePerOrbit = elements[z-1].ePerShell;
    var neutronNumber = Math.round(atomicWeight) - atomicNumber;
    var tmp = z;

    var group = new THREE.Group();
    var mergedProtonGeometry = new THREE.Geometry(), mergedNeutronGeometry = new THREE.Geometry();
    var geometry = new THREE.SphereGeometry(1, 32, 32);
    var protonMaterial = new THREE.MeshPhongMaterial({
        color: 0x4169E1
    })
    var neutronMaterial = new THREE.MeshPhongMaterial({
        color: 0xDC143C
    })

    var radius = Math.pow(1.125, Math.floor(atomicNumber / 8));

    // Create protons
    for (var i = 0; i < atomicNumber; i++) {
        var u = Math.random();
        var v = Math.random();
        var theta = 2 * Math.PI * u;
        var phi = Math.acos(2 * v - 1);
        var x = radius * Math.sin(phi) * Math.cos(theta);
        var y = radius * Math.sin(phi) * Math.sin(theta);
        var z = radius * Math.cos(phi);

        geometry.translate(x, y, z);
        mergedProtonGeometry.merge(geometry);
        geometry.translate(-x, -y, -z);
    }

    // Create neutrons
    for (var i = 0; i < neutronNumber; i++) {
        var u = Math.random();
        var v = Math.random();
        var theta = 2 * Math.PI * u;
        var phi = Math.acos(2 * v - 1);
        var x = radius * Math.sin(phi) * Math.cos(theta);
        var y = radius * Math.sin(phi) * Math.sin(theta);
        var z = radius * Math.cos(phi);

        geometry.translate(x, y, z);
        mergedNeutronGeometry.merge(geometry);
        geometry.translate(-x, -y, -z);
    }

    var outerGeometry = new THREE.SphereBufferGeometry(radius + 2.5, 32, 32);
    var outerMaterial = new THREE.MeshBasicMaterial({
        color: 0x1A1A1A,
        opacity: 0.3,
        transparent: true
    })

    var mergedProtonMesh = new THREE.Mesh(mergedProtonGeometry, protonMaterial)
    var mergedNeutronMesh = new THREE.Mesh(mergedNeutronGeometry, neutronMaterial)
    var outerMesh = new THREE.Mesh(outerGeometry, outerMaterial);

    group.add(mergedProtonMesh);
    group.add(mergedNeutronMesh);
    group.add(outerMesh);

    var eGroup = new THREE.Group();
    eGroup.name = 'Electron group';
    for (var i = 0; i < ePerOrbit.length; i++){
        // var elementOrbit = getElementModelOrbitLayer(ePerOrbit[i], radius + 5 * (i + 1), 0, z);
        // var tween = new TWEEN.Tween(elementOrbit.children[0].rotation)
        //     .to({z: '+' +  Math.PI * 8 / i}, 10000)
        //     .repeat(Infinity)
        //     .start();
        eGroup.add(getElementModelOrbitLayer(ePerOrbit[i], radius + 5 * (i + 1), 0, z));
    }


    group.add(eGroup);

    meshArr.push(mergedProtonMesh);
    meshArr.push(mergedNeutronMesh);
    meshArr.push(outerMesh);

    group.name = "Element Model";
    elementScene.add(group);

    // var eGroup = elementScene.getObjectByName('Electron group');


    console.log('Done creating');
}

function destroyElementModel() {
    var elementModel = elementScene.getObjectByName('Element Model');
    var eGroup = elementScene.getObjectByName('Electron group');

    for (var i=0; i < eGroup.children.length; i++) {
        elementScene.remove(eGroup.children[i]);
    }

    for (var i=0; i < elementModel.children.length; i++) {
        elementScene.remove(elementModel.children[i]);
    }
    elementScene.remove(elementModel);

    for (var i = 0; i < meshArr.length; i++) {
        meshArr[i].geometry.dispose();
        meshArr[i].material.dispose();
    }

    meshArr = [];
}


function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    // find intersections
    if (currentRaycastTarget) {
        raycaster.setFromCamera(mouse, currentCamera);
        var intersects = raycaster.intersectObjects(currentRaycastTarget);
        if (intersects.length > 0) {
            if (INTERSECTED != intersects[0].object) {
                if (INTERSECTED) {
                    INTERSECTED.children[0].material.opacity = 0.25;
                    document.body.style.cursor = "auto";
                    hidePreviewPanel();
                }

                INTERSECTED = intersects[0].object;
                INTERSECTED.children[0].material.opacity = 1;
                document.body.style.cursor = "pointer";
                getPreviewPanel(INTERSECTED.name.slice(3));
            }
        } else {
            if (INTERSECTED) {
                INTERSECTED.children[0].material.opacity = 0.25;
                document.body.style.cursor = "auto";
                hidePreviewPanel();
            }

            INTERSECTED = null;
        }
    }

    // stats.update();
    currentControls.update();
    TWEEN.update();
    currentRenderer.render(currentScene, currentCamera);
}

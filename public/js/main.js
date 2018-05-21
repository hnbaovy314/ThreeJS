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

var container, stats, raycaster;
var currentCamera, defaultCamera, currentScene, currentRenderer, currentControls;
var tableScene, tableRenderer, tableControls;
var mouse = new THREE.Vector2(), previewMouse = new THREE.Vector2(),
    INTERSECTED;
// var data = require('./data')

// Variable
var periodicTable = [];
var elementBoxSize = 3;
var gridSeparation = 3.5;
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

const orbit = ['1s', '2s', '2p', '3s', '3p', '3d', '4s', '4p', '4d', '5s', '5p',
                '4f', '5d', '6s', '6p', '7s', '5f', '6d', '7p', '8s'];
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
// Add left and right column
newElement = document.createElement('div');
newElement.setAttribute('id', 'ds-left-column');
dataScreen.appendChild(newElement);
newElement = document.createElement('div');
newElement.setAttribute('id', 'ds-right-column');
dataScreen.appendChild(newElement);
// Add close button
var newElement = document.createElement('div');
newElement.setAttribute('id', 'ds-close-button');
newElement.appendChild(document.createElement('b'));
newElement.appendChild(document.createElement('b'));
newElement.appendChild(document.createElement('b'));
newElement.appendChild(document.createElement('b'));
dataScreen.appendChild(newElement);

function getAllElements() {
  var result = [];
  $.ajax({
    url: '/getE',
    type: 'GET',
    async: false,
    success: function(data) {
      console.log("Data received");
      result = data;
    }
  });
  return result;
}

var elements = getAllElements();

init();
animate();

function init() {
    container = document.createElement('div');
    document.body.appendChild(container);

    // Init for default camera, used throughout the app
    defaultCamera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        1,
        1000
    );
    defaultCamera.position.z = 35;
    defaultCamera.lookAt(new THREE.Vector3(0, 0, 0));
    currentCamera = defaultCamera;

    // Init for periodic table scene as the default scene
    tableScene = new THREE.Scene();
    tableScene.background = new THREE.Color(0xf2f2f2);
    currentScene = tableScene;

    tableRenderer = new THREE.WebGLRenderer();
    tableRenderer.setPixelRatio(window.devicePixelRatio);
    tableRenderer.setSize(window.innerWidth, window.innerHeight);
    tableRenderer.setClearColor(0xF2F2F2, 1);
    currentRenderer = tableRenderer;

    container.appendChild(currentRenderer.domElement);
    container.appendChild(previewPanel);
    container.appendChild(dataScreen);

    currentScene.add(getElementGrid(demoTable));

    raycaster = new THREE.Raycaster();
    currentRaycastTarget = periodicTable;

    // Init controls for periodic table scene
    tableControls = new THREE.OrbitControls(defaultCamera, tableRenderer.domElement);
    tableControls.enableDamping = true;
    tableControls.dampingFactor = 0.1;
    tableControls.rotateSpeed = 0.25;
    tableControls.zoomSpeed = 5;
    tableControls.minDistance = 10;
    tableControls.maxDistance = 40;
    tableControls.maxPolarAngle = Math.PI * 5 / 6;
    tableControls.minPolarAngle = Math.PI / 6;
    tableControls.maxAzimuthAngle = Math.PI / 4;
    tableControls.minAzimuthAngle = -Math.PI / 4;
    tableControls.enablePan = false;
    currentControls = tableControls;

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
    elementRenderer.setClearColor(0xF2F2F2, 1);
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

    // Performance Stats
    stats = new Stats();
    container.appendChild(stats.dom);

    // Add listeners
    document.addEventListener('click', onTableBoxClick, false);
    document.getElementById('ds-close-button').addEventListener('click', onElementModelCloseButtonClick, false);

    document.addEventListener('mousemove', onDocumentMouseMove, false);
    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    currentCamera.aspect = window.innerWidth / window.innerHeight;
    currentCamera.updateProjectionMatrix();
    currentRenderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(event) {
    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    previewMouse.x = event.clientX;
    previewMouse.y = event.clientY;
}

// Listening for click event, combining with the INTERSECTED
// If click event happens when INTERSECTED is not null (meaning the user is clicking on an object),
// get the data screen of the element
function onTableBoxClick(event) {
    event.preventDefault();

    if (INTERSECTED) {
        // Return the raycast, INTERSECTED and preview panel to clean state
        currentRaycastTarget = null;
        INTERSECTED.children[0].material.opacity = 0.25;
        INTERSECTED = null;
        hidePreviewPanel();
        document.body.style.cursor = "auto";

        dataScreen.style.transform = 'translateY(-100vh)';
        dataScreen.style.opacity = 1;

        getElementModel();

        // Switch to element model camera, scene & ...
        elementCamera.position.z = 60;
        currentCamera = elementCamera;
        currentScene = elementScene;
        currentRenderer = elementRenderer;
        currentControls = elementControls;
    }
}

// Listening for click event on the element model panel close button
function onElementModelCloseButtonClick(event) {
    event.preventDefault();

    dataScreen.style.transform = 'translateY(100vh)';
    dataScreen.style.opacity = 0;

    // Remove element model from elementScene
    elementScene.remove(elementScene.getObjectByName('Element Model'));

    // Switch to table camera, scene & ...
    currentCamera = defaultCamera;
    currentScene = tableScene;
    currentRenderer = tableRenderer;
    currentControls = tableControls;
    currentRaycastTarget = periodicTable;

    currentCamera.lookAt(new THREE.Vector3(0, 0, 0));
    currentCamera.position.x = 0;
    currentCamera.position.y = 0;
    currentCamera.position.z = 20;
    new TWEEN.Tween(currentCamera.position)
        .to({z: 35}, 1000)
        .easing(TWEEN.Easing.Exponential.Out)
        .start();
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
    ctx.fillStyle = "#A49A87";
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
        name: element.z
    });
    var edges = new THREE.EdgesGeometry(boxGeometry);
    var line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({color: 0x1A1A1A}));
    line.material.depthTest = false;
    line.material.opacity = 0.25;
    line.material.transparent = true;

    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    var box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.add(line);

    group.add(plane);
    group.add(box);

    periodicTable.push(box);

    return group;
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

function getTableBorder(width, height) {
    var geometry = new THREE.PlaneBufferGeometry(width * 1.25, height * 1.5, 1);
    var material = new THREE.MeshBasicMaterial({
        opacity: 0,
        transparent: true
    });
    var edges = new THREE.EdgesGeometry(geometry);
    var line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({color: 0xA49A87}));
    line.material.depthTest = false;
    line.material.opacity = 0.25;
    line.material.transparent = true;

    var mesh = new THREE.Mesh(geometry, material);
    mesh.add(line);

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

    group.position.z += 1;

    tableScene.add(getTableHeader(table[0].length * gridSeparation, gridSeparation * table.length));
    tableScene.add(getTableBorder(table[0].length * gridSeparation, gridSeparation * table.length));

    return group;
}

function calcElectronConf(z) {
  var eConfig = '';
  var num = z;
  for (i=0; i < orbit.length; i++) {
    num -= orbitNum[i];
    if (num <= 0){
      var tmp = num + orbitNum[i];
      eConfig = eConfig.concat(orbit[i], tmp.toString());
      break;
    }
    else {
      eConfig = eConfig.concat(orbit[i], orbitNum[i].toString(), ' ');
    }
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
    eConfig = eConfig.replace('1s2 2s2 2p6 3s2 3p6 3d10 4s2 4p6 4d10 5s2 5p6 ', '[Xe]');
  }
  else {
    eConfig = eConfig.replace('1s2 2s2 2p6 3s2 3p6 3d10 4s2 4p6 4d10 5s2 5p6 4f14 5d10 6s2 6p6 ', '[Rn]');
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
    var eConfig = calcElectronConf(z);

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
function getElementModelOrbitLayer(electronNumber, radius, tilt) {
    var orbitContainer = new THREE.Object3D();
    orbitContainer.rotation.x = tilt;

    var orbit = new THREE.Object3D();
    var mergedGeometry = new THREE.Geometry();

    var geometry = new THREE.CircleGeometry(radius, 100);
    geometry.vertices.shift();
    var line = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({color: 0x1A1A1A}));
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

    orbit.add(line);
    orbit.add(new THREE.Mesh(mergedGeometry, electronMaterial));

    var tween = new TWEEN.Tween(orbit.rotation)
        .to({z: '+' + Math.PI * 2}, 10000)
        .repeat(Infinity)
        .start();

    orbitContainer.add(orbit);

    return orbitContainer;
}

// Get element atomic model
function getElementModel() {
    var atomicNumber = 8; // = Number of protons = Number of electrons
    var atomicWeight = 15.9994;
    var neutronNumber = Math.round(atomicWeight) - atomicNumber;

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

    group.add(new THREE.Mesh(mergedProtonGeometry, protonMaterial));
    group.add(new THREE.Mesh(mergedNeutronGeometry, neutronMaterial));
    group.add(new THREE.Mesh(outerGeometry, outerMaterial));
    group.add(
        // Get electron layer
        // Cứ cho chạy loop, tính số electron ở từng lớp rồi gọi hàm
        getElementModelOrbitLayer(8, radius + 7, 0)
    );

    group.name = "Element Model";
    elementScene.add(group);

    var spotLight1 = new THREE.SpotLight(0xF2F2F2);
    spotLight1.position.set(0, 0, (radius + 5));
    spotLight1.penumbra = 1;
    spotLight1.lookAt = group;
    spotLight1.castShadow = true;
    spotLight1.intensity = 1;

    var spotLight2 = new THREE.SpotLight(0xF2F2F2);
    spotLight2.position.set(0, 0, -(radius + 5));
    spotLight2.penumbra = 1;
    spotLight2.lookAt = group;
    spotLight2.castShadow = true;
    spotLight2.intensity = 1;

    elementScene.add(spotLight1);
    elementScene.add(spotLight2);
}

function animate() {
    requestAnimationFrame(animate);
    render();
    stats.update();
    currentControls.update();
    TWEEN.update();
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
                getPreviewPanel(INTERSECTED.material.name);
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

    currentRenderer.render(currentScene, currentCamera);
}

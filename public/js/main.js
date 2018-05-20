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
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [3, 4, 0, 0, 0, 0, 0, 0, 0, 5, 6, 7, 8, 9, 10],
    [11, 12, 0, 0, 0, 0, 0, 0, 0, 13, 14, 15, 16, 17, 18],
    [19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36]
];

var container, stats, raycaster, meshArr = []; // Array to hold all meshes that needs disposing
var currentCamera, defaultCamera, currentScene, currentRenderer, currentControls, defaultControls;
var tableScene, tableRenderer;
var mouse = new THREE.Vector2(), previewMouse = new THREE.Vector2(),
    INTERSECTED;

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
previewPanel.innerHTML = '' +
    '<h2>8 - Oxygen</h2>' +
    '<ul>' +
    '<li>Atomic Weight: <b>15.9994</b></li>' +
    '<li>E.Config: <b>1s2 2s2 2p4</b></li>' +
    '</ul>' +
    '<h1 class="symbol">O</h1>';

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
        100
    );
    defaultCamera.position.z = 0;
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

    currentScene.add(getElementGrid(demoData));

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

    var spotLight1 = new THREE.SpotLight(0xF2F2F2);
    spotLight1.position.set(0, 0, 10);
    spotLight1.penumbra = 1;
    spotLight1.lookAt = new THREE.Vector3(0, 0, 0);
    spotLight1.castShadow = true;
    spotLight1.intensity = 1;

    var spotLight2 = new THREE.SpotLight(0xF2F2F2);
    spotLight2.position.set(0, 0, -10);
    spotLight2.penumbra = 1;
    spotLight2.lookAt = new THREE.Vector3(0, 0, 0);
    spotLight2.castShadow = true;
    spotLight2.intensity = 1;

    elementScene.add(spotLight1);
    elementScene.add(spotLight2);

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
        currentControls.reset();
        currentControls.update();

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
        currentCamera = elementCamera;
        currentScene = elementScene;
        currentRenderer = elementRenderer;

        currentControls = elementControls;
        currentCamera.position.z = 60;
    }
}

// Listening for click event on the element model panel close button
function onElementModelCloseButtonClick(event) {
    event.preventDefault();

    currentControls.reset();
    currentControls.update();

    dataScreen.style.transform = 'translateY(100vh)';
    dataScreen.style.opacity = 0;

    // Switch to table camera, scene & ...
    currentCamera = defaultCamera;
    currentScene = tableScene;
    currentRenderer = tableRenderer;
    currentControls = defaultControls;
    currentRaycastTarget = periodicTable;

    currentControls.target.set(0, 0, -50);
    currentCamera.position.z = -15;
    new TWEEN.Tween(currentCamera.position)
        .to({z: 0}, 1000)
        .easing(TWEEN.Easing.Exponential.Out)
        .start();

    // Remove element model from elementScene
    destroyElementModel();
}

// Get individual element
function getElement(size) {
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
    ctx.fillText("69", canvasSize / 2, canvasSize / 7);
    // Symbol
    ctx.font = "bold 70pt helvetica";
    ctx.fillText("Ah", canvasSize / 2, canvasSize / 2);
    // Name
    ctx.font = "bold 28pt helvetica";
    ctx.fillText("Ahihihium", canvasSize / 2, canvasSize / 1.25);
    // Atomic Weight
    ctx.font = "bold 16pt helvetica";
    ctx.fillText("69.696969", canvasSize / 2, canvasSize / 1.0875);

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
        transparent: true
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

// Get periodic table grid
function getElementGrid(table) {
    var group = new THREE.Group();

    for (var i = 0; i < table.length; i++) {
        for (var j = 0; j < table[0].length; j++) {
            if (table[i][j]) {
                var mesh = getElement(elementBoxSize);
                mesh.position.x = j * gridSeparation - (gridSeparation * (table[0].length - 1)) / 2;
                mesh.position.y = -(i * gridSeparation + elementBoxSize / 2) + (gridSeparation * (table.length - 1)) / 2;
                group.add(mesh);
            }
        }
    }

    group.add(getTableHeader(table[0].length * gridSeparation, gridSeparation * table.length));

    group.position.z = -50;

    tableScene.add(group);

    return group;
}

// Get element preview data panel
function getPreviewPanel() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    var size = previewPanelSize;
    var offset = size / 4;

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
        .to({z: '+' + Math.PI * 2}, 10000)
        .repeat(Infinity)
        .start();

    orbitContainer.add(orbit);

    meshArr.push(line);
    meshArr.push(electronMesh);

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

    var mergedProtonMesh = new THREE.Mesh(mergedProtonGeometry, protonMaterial)
    var mergedNeutronMesh = new THREE.Mesh(mergedNeutronGeometry, neutronMaterial)
    var outerMesh = new THREE.Mesh(outerGeometry, outerMaterial);

    group.add(mergedProtonMesh);
    group.add(mergedNeutronMesh);
    group.add(outerMesh);
    group.add(
        // Get electron layer
        // Cứ cho chạy loop, tính số electron ở từng lớp rồi gọi hàm
        getElementModelOrbitLayer(8, radius + 7, 0)
    );

    meshArr.push(mergedProtonMesh);
    meshArr.push(mergedNeutronMesh);
    meshArr.push(outerMesh);

    group.name = "Element Model";
    elementScene.add(group);
}

function destroyElementModel() {
    elementScene.remove(elementScene.getObjectByName('Element Model'));

    for (var i = 0; i < meshArr.length; i++) {
        meshArr[i].geometry.dispose();
        meshArr[i].material.dispose();
    }
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
                getPreviewPanel();
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

    stats.update();
    currentControls.update();
    TWEEN.update();
    currentRenderer.render(currentScene, currentCamera);
}

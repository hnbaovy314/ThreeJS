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

var container, stats;
var camera, scene, raycaster, renderer, controls;
var mouse = new THREE.Vector2(), previewMouse = new THREE.Vector2(),
    INTERSECTED;

// Variable
var periodicTable;
var elementBoxSize = 3;
var gridSeparation = 3.5;
var elementTextGridSize = 0.8;
var fontUrl = "fonts/helvetiker_bold.typeface.json";
var firstSize = 0.8, secondSize = 0.3, thirdSize = 0.25, fourthSize = 0.15;

// Build preview panel for element data preview
var previewPanelSize = 200;
var previewPanel = document.createElement('div');
previewPanel.setAttribute("id", "preview-panel");
previewPanel.style.width = previewPanelSize + "px";
previewPanel.style.height = previewPanelSize + "px";
previewPanel.style.opacity = 0;
previewPanel.innerHTML = '' +
    '<h2>8 - Oxygen</h2>' +
    '<ul>' +
    '<li>Atomic Weight: <b>15.9994</b></li>' +
    '<li>E.Config: <b>1s2 2s2 2p4</b></li>' +
    '</ul>' +
    '<h1 class="symbol">O</h1>';

init();
animate();

function init() {
    container = document.createElement('div');
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        1,
        1000
    );
    camera.position.z = 30;
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x644d52);

    raycaster = new THREE.Raycaster();

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x644d52, 1);
    container.appendChild(renderer.domElement);

    stats = new Stats();
    container.appendChild(stats.dom);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1; //give a sense of weight to the controls
    controls.rotateSpeed = 0.25;
    controls.zoomSpeed = 5;
    controls.minDistance = 10;
    controls.maxDistance = 40;
    //orbit vertically
    controls.maxPolarAngle = Math.PI * 2 / 3;
    controls.minPolarAngle = Math.PI / 3;
    //orbit horizontally
    controls.maxAzimuthAngle = Math.PI / 4;
    controls.minAzimuthAngle = -Math.PI / 4;
    controls.enablePan = false;

    container.appendChild(previewPanel);

    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('click', onDocumentMouseClick, false);
    window.addEventListener('resize', onWindowResize, false);

    periodicTable = getElementGrid(demoData);
    scene.add(periodicTable);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(event) {
    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    previewMouse.x = event.clientX;
    previewMouse.y = event.clientY;
}

// Listening for click event, combining with the INTERSECTED
function onDocumentMouseClick(event) {
    event.preventDefault();

    if (INTERSECTED) {
        console.log("Ahihi");
    }
}

// Get individual element
function getElement(size) {
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

    var geometry = new THREE.PlaneGeometry(size, size, size);
    var material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
        transparent: true
    });
    var edges = new THREE.EdgesGeometry(geometry);
    var line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({color: 0x1A1A1A}));
    line.material.depthTest = false;
    line.material.opacity = 0.25;
    line.material.transparent = true;

    var mesh = new THREE.Mesh(geometry, material);
    mesh.add(line);

    return mesh;
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

    var geometry = new THREE.PlaneGeometry(width, width / 8, 1);
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
    var geometry = new THREE.PlaneGeometry(width * 1.25, height * 1.5, 1);
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

    for (var i = 0; i < table.length; i++) {
        for (var j = 0; j < table[0].length; j++) {
            if (table[i][j]) {
                var mesh = getElement(elementBoxSize);
                mesh.position.x = j * gridSeparation - (gridSeparation * (table[0].length - 1)) / 2;
                mesh.position.y = -(i * gridSeparation + mesh.geometry.parameters.height / 2) + (gridSeparation * (table.length - 1)) / 2;
                group.add(mesh);
            }
        }
    }

    group.position.z += 1;

    scene.add(getTableHeader(table[0].length * gridSeparation, gridSeparation * table.length));
    scene.add(getTableBorder(table[0].length * gridSeparation, gridSeparation * table.length));

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

function animate() {
    requestAnimationFrame(animate);
    render();
    stats.update();
    controls.update();
}

function render() {
    // find intersections
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(periodicTable.children);
    if (intersects.length > 0) {
        if (INTERSECTED != intersects[0].object) {
            if (INTERSECTED) {
                INTERSECTED.children[0].material.opacity = 0.25;
                hidePreviewPanel();
            }

            INTERSECTED = intersects[0].object;
            INTERSECTED.children[0].material.opacity = 1;
            getPreviewPanel();
        }
    } else {
        if (INTERSECTED) {
            INTERSECTED.children[0].material.opacity = 0.25;
            hidePreviewPanel();
        }

        INTERSECTED = null;
    }

    renderer.render(scene, camera);
}

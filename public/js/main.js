var container, stats, raycaster;
var camera, scene, renderer, controls, currentRaycastTarget = null;
var currentStage;
var mouse = new THREE.Vector2(), previewMouse = new THREE.Vector2(),
    INTERSECTED;

// Build preview panel
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

init();
animate();

function init() {
    container = document.createElement('div');
    document.body.appendChild(container);

    // Init for default camera, used throughout the app
    camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        1,
        1000
    );
    camera.position.y = 30
    camera.position.z = 0;

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1);
    // renderer.shadowMapEnabled = true;
    container.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera);
    controls.target.set(50, 30, 0);

    // -----------------------------------------------------------------

    currentStage = new ChemicalDesk();
    scene = currentStage.init(camera, renderer, controls);

    var floor = new THREE.Mesh(
        new THREE.PlaneGeometry(300, 300, 100),
        new THREE.MeshPhongMaterial({
            color: 0xF2F2F2,
            side: THREE.DoubleSide
        })
    )

    var wall = new THREE.Mesh(
        new THREE.PlaneGeometry(300, 100, 100),
        new THREE.MeshPhongMaterial({
            color: 0xF2F2F2,
            side: THREE.DoubleSide
        })
    )

    floor.rotation.x = Math.PI / 2;
    floor.receiveShadow = true;

    wall.position.x = 50 + 0.75 * 25;
    wall.position.y = 50;
    wall.rotation.y = Math.PI / 2;
    wall.receiveShadow = true;

    scene.add(floor);
    scene.add(wall);

    // -----------------------------------------------------------------
    // Performance Stats
    stats = new Stats();
    container.appendChild(stats.dom);

    // Add listeners
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    window.addEventListener('resize', onWindowResize, false);
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
}

function render() {
    // // find intersections
    // if (currentRaycastTarget) {
    //     raycaster.setFromCamera(mouse, currentCamera);
    //     var intersects = raycaster.intersectObjects(currentRaycastTarget);
    //     if (intersects.length > 0) {
    //         if (INTERSECTED != intersects[0].object) {
    //             if (INTERSECTED) {
    //                 INTERSECTED.children[0].material.opacity = 0.25;
    //                 document.body.style.cursor = "auto";
    //                 hidePreviewPanel();
    //             }

    //             INTERSECTED = intersects[0].object;
    //             INTERSECTED.children[0].material.opacity = 1;
    //             document.body.style.cursor = "pointer";
    //             getPreviewPanel();
    //         }
    //     } else {
    //         if (INTERSECTED) {
    //             INTERSECTED.children[0].material.opacity = 0.25;
    //             document.body.style.cursor = "auto";
    //             hidePreviewPanel();
    //         }

    //         INTERSECTED = null;
    //     }
    // }

    currentStage.update(camera, scene, renderer, controls, stats);
}

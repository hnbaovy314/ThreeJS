var container, stats, raycaster;
var currentCamera, currentScene, currentRenderer, currentControls, currentRaycastTarget = null;
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
    defaultCamera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        1,
        1000
    );
    defaultCamera.position.z = 10;
    currentCamera = defaultCamera;

    // Init for default camera, used throughout the app
    testCamera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        1,
        1000
    );
    testCamera.position.z = 5;

    currentScene = new THREE.Scene();
    currentScene.background = new THREE.Color(0xF2F2F2);

    currentRenderer = new THREE.WebGLRenderer();
    currentRenderer.setPixelRatio(window.devicePixelRatio);
    currentRenderer.setSize(window.innerWidth, window.innerHeight);
    currentRenderer.setClearColor(0xF2F2F2, 1);
    container.appendChild(currentRenderer.domElement);

    currentControls = new THREE.OrbitControls(currentCamera);
    currentControls.target = new THREE.Vector3(0, 0, 0);

    var mesh = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshBasicMaterial({
            color: 0xFF00FF
        })
    );

    currentScene.add(mesh);

    mesh = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshBasicMaterial({
            color: 0xFF00FF
        })
    );
    mesh.position.x = 10;
    mesh.position.y = 0;
    mesh.position.z = 10;

    currentScene.add(mesh);

    console.log(currentControls);
    test();

    // Performance Stats
    stats = new Stats();
    container.appendChild(stats.dom);

    // Add listeners
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

function test() {
    setTimeout(function() {
        currentCamera = testCamera;
        currentControls.object = testCamera;
    }, 3000);
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

    currentCamera.rotation.y += 0.5;

    stats.update();
    currentControls.update();
    TWEEN.update();
    currentRenderer.render(currentScene, currentCamera);
}

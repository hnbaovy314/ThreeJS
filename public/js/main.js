var container, stats, raycaster, meshArr = []; // Array to hold all meshes that needs disposing
var camera, scene, renderer, controls;
var mouse = new THREE.Vector2(), previewMouse = new THREE.Vector2(),
    INTERSECTED;

init();
animate();

function init() {
    const gui = new dat.GUI();

    container = document.createElement('div');
    document.body.appendChild(container);

    // Init for default camera, used throughout the app
    camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        0.01,
        1000
    );
    camera.position.y = 30;
    camera.position.z = 0;

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xFFF6E6, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    // controls.enableZoom = false;
    // controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.2;
    controls.rotateSpeed = 0.2;
    controls.zoomSpeed = 5;
    controls.maxPolarAngle = Math.PI - Math.PI / 8;
    controls.minPolarAngle = Math.PI / 8;
    controls.target.set(0, 30, -17.5);
    // ----------------------------------------------------
    // Build the room
    var roomGeometry = new THREE.Geometry();
    var roomFloorGeometry = new THREE.PlaneGeometry(100, 100, 1);
    var roomWallGeometry = new THREE.PlaneGeometry(100, 60, 10);
    // Ground
    roomFloorGeometry.rotateX(Math.PI / 2);
    roomGeometry.merge(roomFloorGeometry);
    // Ceiling
    roomFloorGeometry.translate(0, 60, 0);
    roomGeometry.merge(roomFloorGeometry);
    roomFloorGeometry.translate(0, -60, 0);
    // Walls
    // Rear
    roomWallGeometry.translate(0, 30, -50);
    var rearWallGeometry = roomWallGeometry.clone();
    rearWallGeometry.vertices[8].x = 45;
    rearWallGeometry.vertices[9].x = 45;
    rearWallGeometry.vertices[16].x = 30;
    rearWallGeometry.vertices[17].x = 30;
    rearWallGeometry.vertices[17].y = 44;
    rearWallGeometry.vertices[18].x = 45;
    rearWallGeometry.vertices[18].y = 44;
    rearWallGeometry.vertices[19].x = 45;
    rearWallGeometry.vertices[20].x = 45;
    roomGeometry.merge(rearWallGeometry);
    // Front
    roomWallGeometry.translate(0, 0, 100);
    // roomGeometry.merge(roomWallGeometry);
    roomWallGeometry.translate(0, 0, -50);
    // Left
    roomWallGeometry.rotateY(Math.PI / 2);
    roomWallGeometry.translate(-50, 0, 0);
    roomGeometry.merge(roomWallGeometry);
    // // Right
    roomWallGeometry.translate(100, 0, 0);
    roomGeometry.merge(roomWallGeometry);

    var room = new THREE.Mesh(
        roomGeometry,
        new THREE.MeshPhongMaterial({
            color: 0xFFFFFF,
            side: THREE.DoubleSide,
            // wireframe: true
        })
    );
    room.receiveShadow = true;
    scene.add(room);

    // Load the door
    new THREE.MTLLoader()
    .setPath('/models/')
    .load('glass-door-2.mtl', function(materials) {
        materials.preload();
        new THREE.OBJLoader()
            .setMaterials(materials)
            .setPath('models/')
            .load('glass-door-2.obj', function(object) {
                object.scale.set(0.5375, 0.5375, 0.5375);
                object.position.set(37.5, 0, -50);
                object.rotation.y = Math.PI;
                scene.add(object);
            });
    });

    // Load the window
    new THREE.MTLLoader()
    .setPath('/models/')
    .load('window.mtl', function(materials) {
        materials.preload();
        new THREE.OBJLoader()
            .setMaterials(materials)
            .setPath('models/')
            .load('window.obj', function(object) {
                object.scale.set(1.4, 2.8, 2.5)
                object.position.z = 50;

                scene.add(object);
            });
    });
    // ----------------------------------------------------
    // Load light
    var light = new THREE.AmbientLight(0xFFFFFF, 0.3);
    scene.add(light);

    var pointLight = new THREE.PointLight(0xFFFFFF, 1, 300, 2);
    pointLight.castShadow = true;
    pointLight.shadow.mapSize.width = 2048;
    pointLight.shadow.mapSize.height = 2048;
    pointLight.position.set(0, 50, 70);
    scene.add(pointLight);

    // ----------------------------------------------------
    // Helper
    var axesHelper = new THREE.AxesHelper(100);
    scene.add(axesHelper);
    var gridHelper1 = new THREE.GridHelper(100, 20);
    scene.add(gridHelper1);
    var gridHelper2 = new THREE.GridHelper(100, 20);
    gridHelper2.position.y = 60;
    scene.add(gridHelper2);
    // ----------------------------------------------------
    // Load scene
    // Load the room
    new THREE.MTLLoader()
    .setPath('/models/')
    .load('room-2.mtl', function(materials) {
        materials.preload();
        new THREE.OBJLoader()
            .setMaterials(materials)
            .setPath('models/')
            .load('room-2.obj', function(object) {
                for (var i = object.children.length - 1; i >= 0; i--) {
                    object.children[i].castShadow = true;
                    object.children[i].receiveShadow = true;
                }
                // Somehow the position of some meshes are incorrect
                // So correct them
                for (var i = 67; i <= 68; i++) {
                    object.children[i].position.z += 3.5;
                    object.children[i].position.x += 0.5;
                }

                for (var i = 72; i <= 74; i++) {
                    object.children[i].position.z += 3.6;
                    object.children[i].position.x += 0.1;
                }

                object.children[65].position.z += 3.5;
                object.children[65].position.x -= 0.2;
                object.children[66].position.z += 3.6;
                object.children[66].position.x += 0.1;

                // Flip the cabinet
                object.children[64].rotation.y = -Math.PI;
                object.children[64].position.x = 26.125;
                object.children[64].position.z = 11;

                // Move the microscope to the right of the table
                object.children[70].position.x += 3;
                object.children[70].position.z -= 5.5;
                object.children[70].rotation.y = -0.5;

                // Adjust the whole group
                object.scale.set(3, 3, 3);
                object.position.set(-32.5, 0, -25);
                object.rotation.y = 0.785;

                scene.add(object);
            });
    });

    // Load the fridge
    new THREE.MTLLoader()
    .setPath('/models/')
    .load('fridge.mtl', function(materials) {
        materials.preload();
        new THREE.OBJLoader()
            .setMaterials(materials)
            .setPath('models/')
            .load('fridge.obj', function(object) {
                object.scale.set(0.5, 0.5, 0.5);
                object.castShadow = true;

                object.position.set(-37.5, 0, 35);
                object.rotation.y = Math.PI / 2;

                object.children[10].material[0].color.setHex(0x4C4C4C);
                object.children[35].material[0].color.setHex(0x4C4C4C);

                object.children[10].castShadow = true;
                object.children[35].castShadow = true;

                scene.add(object);
            });
    });

    // Load the working desk
    new THREE.OBJLoader()
    .load("/models/table.obj", function(object) {
        object.scale.set(0.3, 0.3, 0.3);
        object.position.set(12.5, 0, 42.5);
        object.rotation.y += 0.3;

        for (var i = 0; i < object.children.length; i++) {
            object.children[i].castShadow = true;
        }

        object.children[2].material.transparent = true;
        object.children[2].material.opacity = 0.5;
        object.children[2].material.side = THREE.DoubleSide;

        scene.add(object);
    });

    new THREE.OBJLoader()
    .load("/models/chair.obj", function(object) {
        object.scale.set(0.25, 0.25, 0.25);
        object.rotateY(Math.PI + 0.2);
        object.position.set(52, 0, -33);

        for (var i = 0; i < object.children.length; i++) {
            object.children[i].castShadow = true;
        }

        scene.add(object);
    });

    // Load the hand
    new THREE.OBJLoader()
    .load("/models/hand.obj", function(object) {
        object.scale.set(5, 5, 5);
        object.position.set(1, -1, -0.75);
        object.rotation.set(-1, -0.45, 0.1);

        object.children[0].material.color.setHex(0xFFCD94);

        camera.add(object);
        scene.add(camera);
    });

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
    //             getPreviewPanel(INTERSECTED.material.name);
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

    controls.update();
    TWEEN.update();
    renderer.render(scene, camera);
}
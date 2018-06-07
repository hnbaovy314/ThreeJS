var initGuideTexts = [
    "Use mouse to look around by clicking & dragging",
    "You can view some equipment's info by hovering over them"
]

var equipmentsInfo = {
    "guide-tab": {
        name: "Guide Tab",
        desc: "A glorious Ipad that will assists you with your learning. Click to bring it up."
    },
    "window": {
        name: "Lab's Window",
        desc: "Click if you want to take a closer look at the city."
    },
    "lab-desk": {
        name: "Lab's Experiment Desk",
        desc: "All experiments will be conducted here. Click to move to the desk."
    },
    "test-tube": {
        name: "Test Tube",
        desc: "All experiments will be conducted here. Click to move to the desk."
    },
    "flask": {
        name: "Conical Flask",
        desc: "All experiments will be conducted here. Click to move to the desk."
    },
    "retort": {
        name: "Retort",
        desc: "All experiments will be conducted here. Click to move to the desk."
    },
    "beaker": {
        name: "Beaker",
        desc: "All experiments will be conducted here. Click to move to the desk."
    }
}

var container, stats, raycaster; // Array to hold all meshes that needs disposing
var camera, scene, renderer, controls;

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
        10000
    );
    camera.position.set(35, 30, -30);

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
    controls.target.set(34.995, 30, -29.99);
    // ----------------------------------------------------
    
    var labScene = new LabScene(gui, camera, scene);
    labScene.init();
    var labGuide = new LabGuide(camera, scene);
    labGuide.init(labScene.raycastTarget);
    labGuide.createGuideText(initGuideTexts);

    raycaster = new Raycaster(gui, camera, scene, controls, labScene.raycastTarget, equipmentsInfo);
    raycaster.init();

    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    raycaster.update();
    controls.update();
    TWEEN.update();
    renderer.render(scene, camera);
}
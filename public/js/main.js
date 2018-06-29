var container, stats;
var camera, scene, renderer, controls;
var labScene, labGuide;

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

    labScene = new LabScene(gui, camera, scene, renderer, controls);
    labScene.init();
    labGuide = new LabGuide(gui, labScene);
    labGuide.init();

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
    // labScene.update();
    labGuide.update();
    TWEEN.update();
}

// Constructor function for Chemical Desk scene

ChemicalDesk = function() { 
    // this.camera = new THREE.PerspectiveCamera(
    //     70,
    //     window.innerWidth / window.innerHeight,
    //     1,
    //     100
    // );

    this.scene = new THREE.Scene();

    // this.renderer = new THREE.WebGLRenderer();
    // this.renderer.setPixelRatio(window.devicePixelRatio);
    // this.renderer.setSize(window.innerWidth, window.innerHeight);
    // this.renderer.setClearColor(0xF2F2F2, 1);

    // this.controls = new THREE.OrbitControls();
    // this.controls.enableDamping = true;
    // this.controls.dampingFactor = 0.1;
    // this.controls.rotateSpeed = 0.25;
    // this.controls.zoomSpeed = 5;
    // this.controls.minDistance = 10;
    // this.controls.maxDistance = 60;
    // this.controls.maxPolarAngle = Math.PI * 5 / 6;
    // this.controls.minPolarAngle = Math.PI / 6;
    // this.controls.maxAzimuthAngle = Math.PI / 4;
    // this.controls.minAzimuthAngle = -Math.PI / 4;
    // this.controls.enablePan = false;
    // this.controls.target.set(this.offsetPosition.x, this.offsetPosition.y, this.offsetPosition.z);

    this.update = function(camera, scene, renderer, controls, stats) {
        stats.update();
        TWEEN.update();
        controls.update();
        equipment.update();
        renderer.render(scene, camera);
    }

    this.init = function(camera, renderer, controls) {
        domEvents = new THREEx.DomEvents(camera, renderer.domElement);
        equipment.init(camera, renderer.domElement, controls);


        this.scene.add(getSceneSetup());

        var spotLight = new THREE.SpotLight(0xF2F2F2, 0.8);
        spotLight.penumbra = 0.3;
        spotLight.angle = 0.5;
        spotLight.position.set(0, 100, 0);
        spotLight.castShadow = true;

        var targetObject = new THREE.Object3D();
        targetObject.position.set(40 + 0.75 * 25, 30, 0);
        this.scene.add(targetObject);

        spotLight.target = targetObject;
        this.scene.add(spotLight);

        return this.scene;
    }

    this.dispose = function() {

    }

    // ----------------------------------------------------------------------------------------
    // Internals
    var scope = this;
    var equipment = new ChemicalEquipment();
    var domEvents;

    var offsetPos = {
        x: 50,
        y: 0,
        z: 0
    };
    var offsetAngle = Math.PI / 2;

    var origin = {
        x: 0,
        y: 0,
        z: 0
    }

    var deskWidth, deskHeight, deskDepth;

    function calculateOrigin() {
        // Calculate the origin point, set on the table surface
        // Due to the rotation, deskWidth now corresponds with Z axis
        // deskDepth with the X axis
        origin.x = offsetPos.x + deskDepth / 2;
        origin.y = offsetPos.y + deskHeight + 0.5;
        origin.z = offsetPos.z;
    }

    function getSceneSetup() {
        var group = new THREE.Group();
        var loader = new THREE.ObjectLoader();

        // Load the chemical desk
        loader.load(
            '/models/table.json',
            function(object) {
                // Scale up the desk by 25 times
                object.scale.set(25, 25, 25);

                var boundingBox = new THREE.Box3();
                boundingBox.setFromObject(object);
                
                deskWidth = boundingBox.max.x - boundingBox.min.x;
                deskHeight = boundingBox.max.y - boundingBox.min.y;
                deskDepth = boundingBox.max.z - boundingBox.min.z;
                // Calculate the origin point on the desk surface
                calculateOrigin();

                object.rotation.y = offsetAngle;

                object.position.x = offsetPos.x;
                object.position.y = offsetPos.y + deskHeight / 2; // Scale 25
                object.position.z = offsetPos.z - deskWidth / 3.75; // Due to the rotation, deskWidth now corresponds with Z axis

                object.castShadow = true;
                object.receiveShadow = true;

                group.add(object);
                group.add(equipment.getFlask(origin, domEvents));
            }
        )

        return group;
    }
}
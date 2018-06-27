PeriodicTable = function(labGuide, DataRetriever, ElementTools, PtEventListener) {
    const demoTable = [
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

    const eleOrbit = [['1s'],
                ['2s', '2p'],
                ['3s', '3p', '3d'],
                ['4s', '4p', '4d', '4f'],
                ['5s', '5p', '5d', '5f'],
                ['6s', '6p', '6d'],
                ['7s', '7p']]
    const orbitNum = [2, 2, 6, 2, 6, 10, 2, 6, 10, 2, 6,
                      14, 10, 2, 6, 2, 14, 10, 6, 2];


    this.labGuide = LabGuide;
    this.dataRetriever = DataRetriever;
    this.elementTools = ElementTools;
    this.ptEventListener = PtEventListener;
    var scope = this;

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

      // Build data screen
    var elementCamera, elementScene, elementRenderer, elementControls; // Camera, scene, renderer & controls for element model
    var dataScreen = document.createElement('div');
    dataScreen.setAttribute('id', 'data-screen');

    var elements = DataRetriever.getAllElements();

    this.init() = function() {
        container = document.createElement('div');
        container.setAttribute('id', 'main-container');
        document.body.appendChild(container);
        //filter controller
        elementTools.addColAndCloseBtn();

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

        currentScene.add(elementTools.getElementGrid(demoTable));

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
}

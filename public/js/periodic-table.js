PeriodicTable = function(labScene) {
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

    this.labScene = labScene;

    const dataRetriever = new DataRetriever();
    const elementTools = new ElementTools();
    const eventListener = new PtEventListener();
    const previewPanelSize = 200;
    const elementCanvasWidth = 1020 * 0.7;
    const elementCanvasHeight = 720 * 0.9;
    var scope = this;

    //Enable Element view
    this.ptEnabled = false;
    this.secondSetEnabled = false;
    this.eScreenOn = false;
    this.intersectElement = 0;
    var elementScene, elementRenderer, elementCamera, elementControl;

    var elementTable, previewPanel;
    var container, stats, raycaster, meshArr = []; // Array to hold all meshes that needs disposing
    var currentCamera, defaultCamera, currentScene, currentRenderer, currentControls, defaultControls, enableRaycast = true;
    var tableScene, tableRenderer;
    var currentMouse,
    INTERSECTED;
    // var data = require('./data')

    // Variable
    var periodicTable = [];
    const elementBoxSize = 3;
    const gridSeparation = 4;
    const elementTextGridSize = 0.8;
    var fontUrl = "fonts/helvetiker_bold.typeface.json";
    var firstSize = 0.8, secondSize = 0.3, thirdSize = 0.25, fourthSize = 0.15;

    var elements = dataRetriever.getAllElements();

    this.init = function(labGuide) {
        // container = document.createElement('div');
        // container.setAttribute('id', 'periodic-container');
        // document.body.appendChild(container);
        // //filter controller
        // addColAndCloseBtn();

        //Element Model
        calcEPerShell();
        scope.labGuide = labGuide;
        for (var i=0; i < elements.length; i++){
            elements[i].eConf = make1DArray(elements[i].eConf);
        }
        raycaster = new THREE.Raycaster();

        //for labScene
        var geoBox = new THREE.BoxGeometry(5, 50, 75);
        var matBox = new THREE.MeshBasicMaterial({
            opacity: 0,
            transparent: true,
        });
        var boxTable = new THREE.Mesh(geoBox, matBox);
            //a plane
        var geoPlane = new THREE.PlaneGeometry(40, 25);
        var matPlane = new THREE.MeshBasicMaterial({
            color: 0xb5b5b7
        })
        var planeTable = new THREE.Mesh(geoPlane, matPlane);
        boxTable.name = 'element-surround-table';
        planeTable.name = 'plane-below-table';
        elementTable = getElementGrid(demoTable);
        elementTable.add(boxTable);
        scope.labScene.add(planeTable)
        scope.labScene.add(elementTable);

        boxTable.position.set(0, 0, 10);
        boxTable.rotation.y = -Math.PI / 2;
        planeTable.position.set(49, 31, -25);
        planeTable.rotation.y = -Math.PI / 2;
        elementTable.scale.set(0.5, 0.5, 0.4);
        elementTable.position.set(49, 31, -25)
        elementTable.rotation.y = -Math.PI / 2;
        elementTable.name = 'element-table';
        scope.labScene.previewInfo['element-table'] = {
            name: "Periodic Board",
            desc: "A periodic board with info about 118 elements. Super helpful!"
        };

        var boundingBox = new THREE.Box3().setFromObject(elementTable);
        var helper = new THREE.Box3Helper(boundingBox, 0x1A1A1A);
        helper.material.transparent = true;
        helper.material.opacity = 0;
        helper.name = "element-table-helper";
        scope.labScene.add(helper);

        scope.labScene.raycastTarget.push(boxTable);
        //get the default setting
        currentCamera = scope.labScene.camera;
        currentScene = scope.labScene.scene;
        currentRenderer = scope.labScene.renderer;
        currentControl = scope.labScene.controls;

        //First initializing for preview panel
        previewPanel = document.getElementById('preview-panel');
        previewPanel.style.width = previewPanelSize + 'px';
        previewPanel.style.height = previewPanelSize + 'px';
        previewPanel.style.opacity = 0;

        // //BGM - .mp3 only
        // // loadBGM('sound.mp3');

        //Element Scene
        elementScene = new THREE.Scene();
        elementRenderer = new THREE.WebGLRenderer();
        elementCamera = new THREE.PerspectiveCamera(
            70,
            elementCanvasWidth / elementCanvasHeight,
            1,
            1000
        );
        elementCamera.position.z = 50;
        elementCamera.lookAt(new THREE.Vector3(0, 0, 0));

        elementRenderer.setPixelRatio(window.devicePixelRatio);
        elementRenderer.setClearColor(0xecf0f1, 1);

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

        elementControl = new THREE.TrackballControls(elementCamera, elementRenderer.domElement);
        elementControl.enableDamping = true;
        elementControl.dampingFactor = 0.2; //give a sense of weight to the control
        elementControl.rotateSpeed = 2;
        elementControl.zoomSpeed = 5;
        elementControl.minDistance = 20;
        elementControl.maxDistance = 80;
        elementControl.noPan = true;

        // Add listeners
        document.addEventListener('click', onTableBoxClick, false);
        window.addEventListener('resize', onWindowResize, false);

    }

    this.resetRaycastTarget = function() {
        enableRaycast = true;
        console.log("Reset");
        scope.update();
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

    function addColumn(divId) {
        // Add left and right column
        var mainDiv = document.getElementById(divId);
        var newElement = document.createElement('div');
        var subInfo = document.createElement('div');
        var infoText = document.createElement('div');
        var subBtn = document.createElement('div');
        var iconArr = [
                '<i class="far fa-image fa-2x"></i>',
                '<i class="fas fa-cubes fa-2x"></i>',
                '<i class="fas fa-list fa-2x"></i>',
                '<i class="fab fa-wikipedia-w fa-2x"></i>'
        ];
        newElement.setAttribute('id', 'ds-left-column');
        subInfo.setAttribute('id', 'left-main-info');
        infoText.setAttribute('id', 'left-info-text');
        subInfo.appendChild(infoText);
        newElement.appendChild(subInfo);
        subInfo = document.createElement('div');
        subInfo.setAttribute('id', 'left-sub-info');
        subBtn.setAttribute('id', 'left-info-btn');
        for (var i=0; i < 4; i++) {
            var btn = document.createElement('span');
            btn.setAttribute('class', 'info-button');
            btn.setAttribute('id', `infoBtn${i}`);
            btn.innerHTML = iconArr[i];
            subBtn.appendChild(btn);
        }

        newElement.appendChild(subBtn);
        newElement.appendChild(subInfo);
        mainDiv.appendChild(newElement);
    }

    function foo() {
        return new Promise (function(resolve, reject){
            scope.labGuide.bringUpGuideTab();
            return resolve(true);
        })
    }

    this.switch2Default = function() {
        scope.labScene.camera = currentCamera;
        scope.labScene.scene = currentScene;
        scope.labScene.controls = currentControl;
        scope.labScene.renderer = currentRenderer;
        destroyElementModel();
    }

    this.switch2Local = function() {
        currentCamera = scope.labScene.camera;
        currentScene = scope.labScene.scene;
        currentControl = scope.labScene.controls;
        currentRenderer = scope.labScene.renderer;
        scope.labScene.camera = elementCamera;
        scope.labScene.scene = elementScene;
        scope.labScene.controls = elementControl;
        scope.labScene.renderer = elementRenderer;

        console.log(elementControl);
    }

    this.add2LocalCamera = function(object) {
        elementCamera.add(object);
    }

    // Listening for click event, combining with the INTERSECTED
    // If click event happens when INTERSECTED is not null (meaning the user is clicking on an object),
    // get the data screen of the element
    function onTableBoxClick(event) {
        event.preventDefault();

        if (INTERSECTED ) {
            INTERSECTED.children[0].material.opacity = 0.25;
            // currentControls.reset();
            // currentControls.update();
            scope.secondSetEnabled = true;
            scope.labGuide.prevPos = scope.labGuide.currentPos;
            scope.ptEnabled = false;
            scope.labGuide.currentPos = 'guide-tab';
            scope.labGuide.bringUpGuideTab();
        }
    }

    this.loadElementInfo = function() {
        var infoTabContent = document.getElementById('gtab-content');
        infoTabContent.innerHTML = '';
        addColumn('gtab-content');
        var erContainer = document.createElement('div'); // Element Renderer Container
        erContainer.setAttribute('id', 'ds-er-container');
        erContainer.appendChild(elementRenderer.domElement);
        infoTabContent.appendChild(erContainer);
        elementRenderer.setSize(elementCanvasWidth, elementCanvasHeight);

        enableRaycast = false;
        // INTERSECTED.children[0].material.opacity = 0.25;
        var atomicNumber = INTERSECTED.name.slice(3);
        var element = elements[atomicNumber-1];
        INTERSECTED = null;
        hidePreviewPanel();
        document.body.style.cursor = "auto";

        var eModel = getElementModel(atomicNumber);
        elementScene.add(eModel);
        eModel.position.set(0, 0, 0);

        var element = elements[atomicNumber-1];
        var eConfig = elementTools.calcElectronConf(atomicNumber, element.eConf);
        var cat = dataRetriever.getCat(element.cat);
        getElementInfo(element, 'left-info-text', eConfig, cat);
        elementTools.getElementImg('left-sub-info', atomicNumber);
        $('#infoBtn0').addClass('infoBtn-focus');
        $('#infoBtn0').on('click', function() {
            eventListener.infoTabClick('infoBtn0')
            eventListener.onElementImg(atomicNumber, 'left-sub-info');
        });
        $('#infoBtn1').on('click', function() {
            eventListener.infoTabClick('infoBtn1');
            eventListener.onCrystalStructure(element.crystalStructure, 'left-sub-info');
        });
        $('#infoBtn2').on('click', function() {
            eventListener.infoTabClick('infoBtn2');
            eventListener.onCategories(cat, 'left-sub-info');
        })
        $('#infoBtn3').on('click', function() {
            var wnd = window.open(`https://en.wikipedia.org/wiki/${element.name}`);
        });
    }

    // Get element preview data panel
    function getPreviewPanel(z) {
        var width = window.innerWidth;
        var height = window.innerHeight;
        var size = previewPanelSize;
        var offset = size / 4;
        var element = elements[z-1];
        var eConfig = elementTools.calcElectronConf(z, element.eConf);

        var newPos = {x: 0, y: 0};
        newPos.x = (currentMouse.x + 1) / 2 * width;
        newPos.y = -(currentMouse.y - 1) / 2 * height;


        //need extra steps to convert p2D to window's coordinates
        // p2D.x = (p2D.x + 1)/2 * width;
        // p2D.y = - (p2D.y - 1)/2 * height;

        // console.log(currentMouse.x, currentMouse.y);

        // Check for overflow
        // if (newPos.x + size >= width ) {
        //     newPos.x = width - size - 10;
        // }
        // if (newPos.y + size >= height) {
        //     newPos.y = height - size - 10;
        // }

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
        return group;

        // var eGroup = elementScene.getObjectByName('Electron group');
    }

    // Create orbit layer of eletrons
    function getElementModelOrbitLayer(electronNumber, radius, tilt, z) {
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

        orbit.rotation.x = Math.random() * Math.PI * 2;
        orbit.rotation.y = Math.random() * Math.PI * 2;

        var tween = new TWEEN.Tween(orbit.rotation)
            .to({z: '+' + Math.PI * 8 / radius}, 10000)
            .repeat(Infinity)
            .start();

        orbit.name = 'electron-orbit';
        orbitContainer.add(orbit);

        meshArr.push(line);
        meshArr.push(electronMesh);

        return orbitContainer;
    }

    function getElementInfo(element, divId, eConf, category) {
        var infoText = document.getElementById(divId);
        var eCT = '';
        var author = '';

        if (element.crystalStructure === Array) {
            eCT = '<ul>';
            for (var i=0; i<element.crystalStructure.length; i++) {
                var eCTValue = dataRetriever.getECTName(element.crystalStructure[i]).name;
                eCT = eCT.concat(`<li>${eCTValue}</li>`);
            }
            eCT = eCT.concat('</ul>');
        }
        else {
            eCT = dataRetriever.getECTName(element.crystalStructure).name;
        }

        for (var i=0; i < element.discovery.by.length; i++){
            if (i > 0) {
                author = author.concat(' và ');
            }
            author = author.concat(element.discovery.by[i]);
        }

        infoText.innerHTML = '';
        infoText.innerHTML =
        `<h2>${element.z} - ${element.name}</h2>
        <ul>
        <li>Khối lượng nguyên tử: <b>${element.atomicWeight}</b></li>
        <li>Cấu hình electron: <b>${eConf}</b></li>
        <li>Phân loại: <a href="" id="cat-link">${category.name}</a></li>
        <li>Trạng thái: ${element.phase}</li>
        <li>Cấu trúc tinh thể: <a href="" id="structure-link">${eCT}</a></li>
        <li>Phát hiện bởi ${author}, ${element.discovery.year}</li>
        </ul>`;

        $('#cat-link').on('click', function() {
            eventListener.infoTabClick('infoBtn2');
            eventListener.onCategories(category, 'left-sub-info');
        })
        $('#structure-link').on('click', function() {
            eventListener.infoTabClick('infoBtn1');
            eventListener.onCrystalStructure(element.crystalStructure, 'left-sub-info');
        })
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
        ctx.fillStyle = "#2c3e50";
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
            color: 0x2c3e50,
            opacity: 0,
            transparent: true,
        });
        var edges = new THREE.EdgesGeometry(boxGeometry);
        var line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({color: 0x1A1A1A}));
        line.material.depthTest = false;
        line.material.opacity = 0.25;
        line.material.transparent = true;

        var plane = new THREE.Mesh(planeGeometry, planeMaterial);
        var box = new THREE.Mesh(boxGeometry, boxMaterial);
        box.name = `box${element.z}`;
        plane.name = `plane${element.z}`;
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
    function getElementGrid (table) {
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

        group.add(getTableHeader(table[0].length * gridSeparation, gridSeparation * table.length));

        // group.position.z = -50;

        // tableScene.add(group);

        return group;
    }

    this.setMouse = function (mouseFromRaycast) {
        currentMouse = mouseFromRaycast;
    }

    this.update = function() {
        //find intersections
        if (enableRaycast) {
            raycaster.setFromCamera(currentMouse, currentCamera);
            var intersects = raycaster.intersectObjects(periodicTable);
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

                    scope.intersectElement = INTERSECTED.name.slice(3);
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
    }

}

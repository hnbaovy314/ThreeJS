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

    this.camera = labScene.camera;
    this.scene = labScene.scene;
    this.renderer = labScene.renderer;
    this.labScene = labScene;

    const dataRetriever = new DataRetriever();
    const elementTools = new ElementTools();
    const eventListener = new PtEventListener();
    const previewPanelSize = 200;
    var scope = this;

    //Enable Element view
    this.ptEnabled = false;

    var elementTable, previewPanel;
    var container, stats, raycaster, meshArr = []; // Array to hold all meshes that needs disposing
    var currentCamera, defaultCamera, currentScene, currentRenderer, currentControls, defaultControls, currentRaycastTarget;
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

      // Build data screen
    var elementCamera, elementScene, elementRenderer, elementControls; // Camera, scene, renderer & controls for element model
    var dataScreen = document.createElement('div');
    dataScreen.setAttribute('id', 'data-screen');

    var elements = dataRetriever.getAllElements();

    this.init = function() {
        // container = document.createElement('div');
        // container.setAttribute('id', 'periodic-container');
        // document.body.appendChild(container);
        // //filter controller
        // addColAndCloseBtn();

        //Element Model
        calcEPerShell();
        for (var i=0; i < elements.length; i++){
            elements[i].eConf = make1DArray(elements[i].eConf);
        }
        raycaster = new THREE.Raycaster();

        //for labScene
        var geo = new THREE.BoxGeometry(5, 50, 75);
        var mat = new THREE.MeshBasicMaterial({
            opacity: 0,
            transparent: true,
        });
        var boxTable = new THREE.Mesh(geo, mat);
        boxTable.name = 'periodic-table';
        elementTable = getElementGrid(demoTable);
        elementTable.add(boxTable);
        scope.labScene.add(elementTable);
        boxTable.position.set(0, 0, 10);
        boxTable.rotation.y = -Math.PI / 2;
        elementTable.scale.set(0.5, 0.5, 0.4);
        elementTable.position.set(49, 30, -25)
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
        currentRaycastTarget = periodicTable;
        currentCamera = scope.camera;
        currentScene = scope.scene;
        currentRenderer = scope.renderer;

        //First initializing for preview panel
        previewPanel = document.getElementById('preview-panel');
        previewPanel.style.width = previewPanelSize + 'px';
        previewPanel.style.height = previewPanelSize + 'px';
        previewPanel.style.opacity = 0;

        // //BGM - .mp3 only
        // // loadBGM('sound.mp3');

        // Add listeners
        document.addEventListener('click', onTableBoxClick, false);
        window.addEventListener('resize', onWindowResize, false);

        // document.getElementById('ds-close-button').addEventListener('click', onElementModelCloseButtonClick, false);
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

    function addColAndCloseBtn() {
        // Add left and right column
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
        dataScreen.appendChild(newElement);
        // Add close button
        var newElement = document.createElement('div');
        newElement.setAttribute('id', 'ds-close-button');
        newElement.appendChild(document.createElement('b'));
        newElement.appendChild(document.createElement('b'));
        newElement.appendChild(document.createElement('b'));
        newElement.appendChild(document.createElement('b'));
        dataScreen.appendChild(newElement);
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
    }

    // Listening for click event on the element model panel close button
    function onElementModelCloseButtonClick(event) {
        event.preventDefault();

        currentControls.reset();
        currentControls.update();

        dataScreen.style.transform = 'translateY(100vh)';
        dataScreen.style.opacity = 0;
        elementTools.clearDiv('left-info-text');
        elementTools.clearDiv('left-sub-info');

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
            eGroup.add(elementTools.getElementModelOrbitLayer(ePerOrbit[i], radius + 5 * (i + 1), 0, z));
        }


        group.add(eGroup);

        meshArr.push(mergedProtonMesh);
        meshArr.push(mergedNeutronMesh);
        meshArr.push(outerMesh);

        group.name = "Element Model";
        elementScene.add(group);

        // var eGroup = elementScene.getObjectByName('Electron group');
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

    this.switchOnOff = function() {
        ptEnabled == true ? false : true;
    }

    this.update = function() {
        //find intersections
            if (currentRaycastTarget) {
                raycaster.setFromCamera(currentMouse, currentCamera);
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
            // currentRenderer.render(currentScene, currentCamera);
    }

}

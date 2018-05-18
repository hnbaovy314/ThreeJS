var demoData = [
[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
[1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
[1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
];

var camera, scene, renderer, controls;
var scaleVector = new THREE.Vector3();

// Loader
var fontLoader = new THREE.FontLoader();

var elementGrid;
var domEvents;

// Variable
var elementBoxSize = 3;
var gridSeparation = 3.5;
var elementTextGridSize = 0.8;
var fontUrl = "fonts/helvetiker_bold.typeface.json";
var firstSize = 0.8, secondSize = 0.3, thirdSize = 0.25, fourthSize = 0.15;

// Mouse
var mouseX = 0, mouseY = 0;

// Build preview panel for element data preview
var previewPanelSize = 200;
var previewPanel = document.createElement('div');
previewPanel.setAttribute("id", "preview-panel");
previewPanel.style.width = previewPanelSize + "px";
previewPanel.style.height = previewPanelSize + "px";
previewPanel.innerHTML = '' +
    '<h2>8 - Oxygen</h2>' +
    '<ul>' +
    '<li>Atomic Weight: <b>15.9994</b></li>' +
    '<li>E.Config: <b>1s2 2s2 2p4</b></li>' +
    '</ul>' +
    '<h1 class="symbol">O</h1>';

function init() {
    scene = new THREE.Scene();

    var width = window.innerWidth;
    var height = window.innerHeight;
    
    // Perspective Camera
	camera = new THREE.PerspectiveCamera(
		45, // field of view
		width / height, // aspect ratio
		1, // near clipping plane
		1000 // far clipping plane
	);
    camera.position.z = 50;
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    
    // renderer
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio(2);
	renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.setClearColor(0xF2F2F2, 1);
    renderer.autoClear = false; // To allow render overlay on top of sprited sphere
	document.getElementById('webgl').appendChild(renderer.domElement);
	
    controls = new THREE.TrackballControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.2;
    controls.rotateSpeed = 2;
    controls.zoomSpeed = 2;
    controls.maxDistance = 150;

    domEvents = new THREEx.DomEvents(camera, renderer.domElement)

    // Add preview panel to scene
    document.getElementById('webgl').appendChild(previewPanel);

    // Build periodic table
    elementGrid = getElementGrid(demoData);
    scene.add(elementGrid);
    getElementTextGrid(demoData);

    update();
}

// Auto Resize
window.addEventListener("resize", function() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    
    renderer.setSize(width, height);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}, false);

// Adjust coord for camera on mousemove
document.addEventListener('mousemove', function(event) {
    mouseX = event.clientX - window.innerWidth / 2;
	mouseY = event.clientY - window.innerHeight / 2;
}, false);

// Get Plane
function getPlane(size, opacity, color) {
    var geometry = new THREE.PlaneGeometry(size, size, size);
    var material = new THREE.MeshBasicMaterial({
        color: color,
        opacity: opacity,
        transparent: true
    });

    return new THREE.Mesh(geometry, material);
}

// Get Plane
function getBox(size, opacity, color) {
    var geometry = new THREE.BoxGeometry(size, size, size);
    var material = new THREE.MeshBasicMaterial({
        color: color,
        opacity: opacity,
        transparent: true
    });

    return new THREE.Mesh(geometry, material);
}

// Get individual element
function getElement(size) {
    var mesh = getPlane(size, 0, '#FFFFFF');
    var geometry = new THREE.PlaneGeometry(size, size, size);
    var edges = new THREE.EdgesGeometry(geometry);
    var line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({color: 0x000000}));
    line.material.depthTest = false;
    line.material.opacity = 0.25;
    line.material.transparent = true;
    mesh.add(line);

    // Fade on mouse in/out
    domEvents.addEventListener(mesh, "mouseover", function(e) {
        fadeIn(mesh.children[0].material).start();
        getPreviewPanel(e.origDomEvent);
    })
    domEvents.addEventListener(mesh, "mouseout", function(e) {
        fadeOut(mesh.children[0].material).start();
        hidePreviewPanel();
    })

    return mesh;
}

// Get periodic table grid
function getElementGrid(table) {
    var group = new THREE.Group();

    for (var i = 0; i < table.length; i++) {
        for (var j = 0; j < table[0].length; j++) {
            if (table[i][j]) {
                var obj = getElement(elementBoxSize);
                obj.position.x = j * gridSeparation - (gridSeparation * (table[0].length - 1)) / 2;
                obj.position.y = -(i * gridSeparation + obj.geometry.parameters.height / 2) + (gridSeparation * (table.length - 1)) / 2;
                group.add(obj);
            }
        }
    }

    return group;
}

// Get element preview data panel (sprite)
function getPreviewPanel(event) {
    var width = window.innerWidth;
    var height = window.innerHeight;
    var size = previewPanelSize;
    var offset = size / 4;

    var newPos = {x: 0, y: 0};
    newPos.x = event.clientX + offset;
    newPos.y = event.clientY + offset;

    // Check for overflow
    if (newPos.x + size >= width ) {
        newPos.x = width - size - 10;
    }
    if (newPos.y + size <= -height) {
        newPos.y = -(height - size - 10);
    }
    
    previewPanel.style.transform = 'translate(' + newPos.x + 'px, ' + newPos.y + 'px)';
    previewPanel.style.opacity = 1;
}

// Hide element preview data panel (sprite)
function hidePreviewPanel() {
    previewPanel.style.opacity = 0;
}

/* Fade on mouseover */
function fadeIn(material) {
    return new TWEEN.Tween(material)
                .to({opacity: 1}, 200)
                .easing(TWEEN.Easing.Quadratic.InOut);
}

function fadeOut(material) {
    return new TWEEN.Tween(material)
                .to({opacity: 0.25}, 200)
                .easing(TWEEN.Easing.Quadratic.InOut);
}

// Load font and get text grid for the periodic table
function getElementTextGrid(table) {
    fontLoader.load(fontUrl, function(response) {
        var group = new THREE.Group();

        var obj, geometry;
        var material = new THREE.MeshBasicMaterial({color: '#333333'});

        for (var i = 0; i < table.length; i++) {
            for (var j = 0; j < table[0].length; j++) {
                if (table[i][j]) {
                    // Create Symbol Text 
                    geometry = new THREE.TextGeometry("AH", {
                        font: response,
                        size: firstSize,
                        height: 0
                    });
                               
                    obj = new THREE.Mesh(geometry, material);
                    geometry.computeBoundingBox();
                    obj.position.x = (j * gridSeparation - obj.geometry.boundingBox.max.x / 2) - (gridSeparation * (table[0].length - 1)) / 2;
                    obj.position.y = -(i * gridSeparation + elementBoxSize / 2 + obj.geometry.boundingBox.max.y / 2) + (gridSeparation * (table.length - 1)) / 2;
                    
                    group.add(obj);

                    // Create Atomic Number Text
                    geometry = new THREE.TextGeometry("69", {
                        font: response,
                        size: secondSize,
                        height: 0
                    });
                               
                    obj = new THREE.Mesh(geometry, material);
                    geometry.computeBoundingBox();
                    obj.position.x = (j * gridSeparation - obj.geometry.boundingBox.max.x / 2) - (gridSeparation * (table[0].length - 1)) / 2;
                    obj.position.y = -(i * gridSeparation + elementBoxSize / 5) + (gridSeparation * (table.length - 1)) / 2;

                    group.add(obj);

                    // Create Name Text
                    geometry = new THREE.TextGeometry("Ahihihihium", {
                        font: response,
                        size: thirdSize,
                        height: 0
                    });
                               
                    obj = new THREE.Mesh(geometry, material);
                    geometry.computeBoundingBox();
                    obj.position.x = (j * gridSeparation - obj.geometry.boundingBox.max.x / 2) - (gridSeparation * (table[0].length - 1)) / 2;
                    obj.position.y = -(i * gridSeparation + elementBoxSize / 1.3 + thirdSize) + (gridSeparation * (table.length - 1)) / 2;

                    group.add(obj);

                    // Create Name Text
                    geometry = new THREE.TextGeometry("69.696969", {
                        font: response,
                        size: fourthSize,
                        height: 0
                    });
                               
                    obj = new THREE.Mesh(geometry, material);
                    geometry.computeBoundingBox();
                    obj.position.x = (j * gridSeparation - obj.geometry.boundingBox.max.x / 2) - (gridSeparation * (table[0].length - 1)) / 2;
                    obj.position.y = -(i * gridSeparation + elementBoxSize / 1.1875 + thirdSize) + (gridSeparation * (table.length - 1)) / 2;

                    group.add(obj);
                }
            }
        }

        scene.add(group);
    });
}

function update(misc) {
    controls.update();
    TWEEN.update();

    renderer.clear();
    renderer.render(scene, camera);
    
    requestAnimationFrame(function() {
		update(misc);
    });
}

init();
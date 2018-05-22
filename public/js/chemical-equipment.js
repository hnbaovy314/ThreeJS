// Supply every chemical equipment

ChemicalEquipment = function() {

    this.getFlask = function(position, domEvents) {
        var group = new THREE.Group();

        loader = new THREE.OBJLoader();
        loader.load(
            '/models/flask.obj',
            function(object) {
                group.position.x = position.x;
                group.position.y = position.y;
                group.position.z = position.z;

                // Scale up the desk by 25 times
                object.scale.set(1.5, 1.5, 1.5);

                var boundingBox = new THREE.Box3();
                boundingBox.setFromObject(object);

                object.rotation.y = offsetAngle;
                object.children[0].material.transparent = true;
                object.children[0].material.opacity = 0.5;

                var sizes = {
                    w: boundingBox.max.x - boundingBox.min.x,
                    h: boundingBox.max.y - boundingBox.min.y,
                    d: boundingBox.max.z - boundingBox.min.z
                }
                
                var container = new THREE.Mesh(
                    new THREE.BoxBufferGeometry(sizes.w, sizes.h, sizes.d),
                    new THREE.MeshBasicMaterial({
                        transparent: true,
                        opacity: 0
                    })
                )
                // container.position.y += 0.2;
                
                group.add(object);
                group.add(rotation(sizes, domEvents));
                group.add(container);

                draggables.push(container);
            }
        )

        return group;
    }

    this.init = function(camera, domElement, controls) {
        _camera = camera;
        _domElement = domElement;
        _controls = controls;
        dragControls = new THREE.DragControls(draggables, _camera, _domElement);
        dragControls.addEventListener('dragstart', function (event) {_controls.enabled = false;});
		dragControls.addEventListener('dragend', function (event) {_controls.enabled = true;});

        var loader = new THREE.TextureLoader();
        loader.load("/img/rotate.png", function(texture) {
           rotateTexture = texture;
        })

        _domElement.addEventListener("mousemove", onDocumentMouseMove, false);
        _domElement.addEventListener("mouseup", onDocumentMouseUp, false);
        _domElement.addEventListener("mousedown", onDocumentMouseDown, false);
    }

    this.update = function() {
        // find intersections with control buttons
        _raycaster.setFromCamera(mouse, _camera);
        var intersects = _raycaster.intersectObjects(buttons);
        if (intersects.length > 0) {
            if (INTERSECTED != intersects[0].object) {
                if (INTERSECTED) {
                    _domElement.style.cursor = "auto";
                }

                INTERSECTED = intersects[0].object;
                _domElement.style.cursor = "ew-resize";
            }
        } else {
            if (INTERSECTED) {
                
                _domElement.style.cursor = "auto";
            }

            INTERSECTED = null;
        }

        if (meshToUpdate) {
            if (rotating) {
                meshToUpdate.rotation.x += rotateAngle;
                
                if (meshToUpdate.rotation.x > Math.PI * 2 / 3) {
                    meshToUpdate.rotation.x = Math.PI * 2 / 3;
                } else if (meshToUpdate.rotation.x < -Math.PI * 2 / 3) {
                    meshToUpdate.rotation.x = -Math.PI * 2 / 3;
                }
           }
        }
    }

    this.dispose = function() {

    }

    // ------------------------------------------------------------------------------------
    // Internals
    var _camera, _domElement, _controls;
    var meshCollector = []; // For disposal
    var textureCollector = []; // For disposal
    var timer;
    var offsetPos = {
        x: 50,
        y: 0,
        z: 0
    };

    var offsetAngle = Math.PI / 2;

    // Raycasting
    var _raycaster = new THREE.Raycaster(), INTERSECTED;

    // Texture to reuse
    var rotateTexture;

    // Variable to hold the equipment that needs updating
    var meshToUpdate;

    var mouse = {
        x: 0,
        y: 0
    }
    var prevMouse = {
        x: 0,
        y: 0
    }

    // Drag controls
    var draggables = [];
    var dragControls;

    // Buttons for rotation, etc
    var buttons = [];

    var rotating = false, rotateAngle = 0;

    // Button for rotation
    function rotation(sizes, domEvents) {
        var rotationButton = new THREE.Mesh(
            new THREE.CircleBufferGeometry(1, 32, 32),
            new THREE.MeshBasicMaterial({
                map: rotateTexture,
                side: THREE.DoubleSide,
                transparent: true
            })
        );

        rotationButton.rotation.y = offsetAngle;
        rotationButton.position.set(0, sizes.h, sizes.d / 1.25);
        rotationButton.name = "rotation";

        buttons.push(rotationButton);
        meshCollector.push(rotationButton);

        return rotationButton;
    }

    // --------------------------------------------------------
    
    function onDocumentMouseMove(event) {
        event.preventDefault(0);

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        if (rotating) {
            if (mouse.x - prevMouse.x < 0) {
                rotateAngle = -Math.abs(mouse.x - prevMouse.x) * 10;
            } else if (mouse.x - prevMouse.x > 0) {
                rotateAngle = Math.abs(mouse.x - prevMouse.x) * 10;
            }

            clearTimeout(timer);
            timer = setTimeout(function() {
                rotateAngle = 0;
            }, 100);
        }

        prevMouse.x = mouse.x;
        prevMouse.y = mouse.y
    }

    // Release every ongoing action
    function onDocumentMouseUp(event) {
        event.preventDefault();

        _domElement.style.cursor = "auto";
        controls.enabled = true;
        rotating = false;
    }

    function onDocumentMouseDown(event) {
        event.preventDefault();

        controls.enabled = false;
        
        if (INTERSECTED) {
            if (INTERSECTED.name == "rotation") {
                meshToUpdate = INTERSECTED.parent.children[0];
                rotating = true;
            }
        }
    }
}
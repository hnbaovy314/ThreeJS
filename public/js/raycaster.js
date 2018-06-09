Raycaster = function(gui, camera, scene, controls, raycastTarget, equipmentsInfo) {

    this.equipmentsInfo = equipmentsInfo;

    this.camera = camera;

    this.scene = scene;

    this.controls = controls;

    this.raycaster = new THREE.Raycaster();

    this.raycastTarget = raycastTarget;

    this.gui = gui;
    
    this.init = function() {
        document.addEventListener('mousemove', onDocumentMouseMove, false);
        document.addEventListener('mousedown', onDocumentMouseDown, false);

        // --- (Didn't know where to put this)
        document.getElementById("gtab-back-to-scene").addEventListener("click", scope.turnOffGuideTab, false);
    }

    this.update = function() {
        if (!guideLock) {
            scope.raycaster.setFromCamera(mouse, scope.camera);
            var intersects = scope.raycaster.intersectObjects(raycastTarget, true);
            if (intersects.length > 0) {
                if (INTERSECTED != intersects[0].object.parent) {
                    if (INTERSECTED) {
                        INTERSECTED.traverse(function(child) {
                            if (scope.scene.getObjectByName(INTERSECTED.name + "-helper")) {
                                scope.scene.getObjectByName(INTERSECTED.name + "-helper").material.opacity = 0;
                            } else if (child instanceof THREE.Mesh) {
                                child.material.opacity += 0.3;
                            }
                            hideInfoPanel();
                        })
                    }

                    INTERSECTED = intersects[0].object.parent;
                    INTERSECTED.traverse(function(child) {
                        if (scope.scene.getObjectByName(INTERSECTED.name + "-helper")) {
                            if (INTERSECTED.name != currentPos) {
                                scope.scene.getObjectByName(INTERSECTED.name + "-helper").material.opacity = 1;
                                getInfoPanel();
                            }
                        } else if (child instanceof THREE.Mesh) {
                            child.material.transparent = true;
                            child.material.opacity -= 0.3;
                            if (INTERSECTED.name != currentPos) {
                                getInfoPanel();
                            }
                        }
                    })
                }
            } else {
                if (INTERSECTED) {
                    INTERSECTED.traverse(function(child) {
                        if (scope.scene.getObjectByName(INTERSECTED.name + "-helper")) {
                            scope.scene.getObjectByName(INTERSECTED.name + "-helper").material.opacity = 0;
                        } else if (child instanceof THREE.Mesh) {
                            child.material.opacity += 0.3;
                        }
                        hideInfoPanel();
                    })
                }

                INTERSECTED = null;
            }
        }
    }

     // Move to experiment desk position
     this.moveToDesk = function() {
        new TWEEN.Tween(scope.controls.target)
        .to({x: -25.01, y: 30, z: -26}, 500)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();

        new TWEEN.Tween(scope.camera.position)
        .to({x: -25, y: 30, z: -26}, 500)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();
    }

    // Bring up the guide tab
    this.bringUpGuideTab = function() {
        new TWEEN.Tween(INTERSECTED.rotation)
        .to({x: 0, y: 0, z: 0}, 300)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();

        new TWEEN.Tween(INTERSECTED.position)
        .to({x: -3.29, y: 0.5, z: -1.75}, 300)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onComplete(function() {
            document.getElementById("guide-tab").style.visibility = "visible";
            document.getElementById("guide-tab").style.opacity = 1;
        })
        .start();

        INTERSECTED.traverse(function(child) {
            if (child instanceof THREE.Mesh) {
                child.material.opacity += 0.3;
            }
        });
        INTERSECTED.parent.children[0].visible = false;

        guideLock = true;
    }

    // Turn off the guide tab
    this.turnOffGuideTab = function(event) {
        event.preventDefault();

        document.getElementById("guide-tab").style.visibility = "hidden";
        document.getElementById("guide-tab").style.opacity = 0;

        new TWEEN.Tween(INTERSECTED.rotation)
        .to({x: -0.5, y: 0, z: 0.05}, 300)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();

        new TWEEN.Tween(INTERSECTED.position)
        .to({x: -4.5, y: -2.2, z: -3}, 300)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();

        INTERSECTED.traverse(function(child) {
            if (child instanceof THREE.Mesh) {
                child.material.opacity -= 0.3;
            }
        });
        INTERSECTED.parent.children[0].visible = true;

        guideLock = false;
        currentPos = prevPos;
    }

    this.setPos = function(pos) {
        currentPos = pos;
    }

    this.setPrevPos = function(pos) {
        prevPos = pos;
    }

    // Internals
    var scope = this;

    var mouse = new THREE.Vector2(), infoMouse = new THREE.Vector2(), INTERSECTED;

    var infoPanel = document.getElementById("info-panel");

    var currentPos = '', prevPos = '';

    var guideLock = false;

    function onDocumentMouseMove(event) {
        event.preventDefault();
    
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
        infoMouse.x = event.clientX;
        infoMouse.y = event.clientY;
    }

    function onDocumentMouseDown(event) {
        event.preventDefault();

        if (INTERSECTED && INTERSECTED.name != currentPos) {
            switch(INTERSECTED.name) {
                case "guide-tab": {
                    prevPos = currentPos;
                    currentPos = "guide-tab";
                    hideInfoPanel();
                    scope.bringUpGuideTab();
                    break;
                }
                case "window": {
                    currentPos = "window";
                    hideInfoPanel();
                    moveToWindow();
                    break;
                }
                case "lab-desk": {
                    currentPos = "lab-desk";
                    hideInfoPanel();
                    scope.moveToDesk();
                    break;
                }
                default: break;
            }
        }
    }

    function getInfoPanel() {
        var width = window.innerWidth;
        var height = window.innerHeight;
        var panelWidth = 300;
        var panelHeight = 100;
        var offsetX =  panelWidth / 4;
        var offsetY =  panelHeight / 4;
    
        var newPos = {x: 0, y: 0};
        newPos.x = infoMouse.x + offsetX;
        newPos.y = infoMouse.y + offsetY;
    
        // Check for overflow
        if (newPos.x + panelWidth >= width ) {
            newPos.x = width - panelWidth - 10;
        }
        if (newPos.y + panelHeight >= height) {
            newPos.y = height - panelHeight - 10;
        }
    
        infoPanel.innerHTML = `
            <h3>${scope.equipmentsInfo[INTERSECTED.name].name}</h3>
            <p>${scope.equipmentsInfo[INTERSECTED.name].desc}</p>`;
        infoPanel.style.transform = 'translate(' + newPos.x + 'px, ' + newPos.y + 'px)';
        infoPanel.style.opacity = 1;
    }

    // Hide element preview data panel
    function hideInfoPanel() {
        infoPanel.style.opacity = 0;
    }

    // Move to window position
    function moveToWindow() {
        new TWEEN.Tween(scope.controls.target)
        .to({x: 0, y: 30, z: 42.51}, 500)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();

        new TWEEN.Tween(scope.camera.position)
        .to({x: 0, y: 30, z: 42.5}, 500)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();
    }
}
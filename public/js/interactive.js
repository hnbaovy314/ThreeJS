Raycaster = function(gui, controls, labScene, labGuide) {

    this.raycaster = new THREE.Raycaster();

    this.labScene = labScene;

    this.labGuide = labGuide;

    this.gui = gui;

    this.INTERSECTED = null;

    this.currentPos = ''
    this.prevPos = '';
    
    this.init = function() {
        document.addEventListener('mousemove', onDocumentMouseMove, false);
        document.addEventListener('mousedown', onDocumentMouseDown, false);
    }

    this.update = function() {
        if (!guideLock) {
            scope.raycaster.setFromCamera(mouse, scope.labScene.camera);
            var intersects = scope.raycaster.intersectObjects(scope.labScene.raycastTarget, true);
            if (intersects.length > 0) {
                if (scope.INTERSECTED != intersects[0].object.parent) {
                    if (scope.INTERSECTED) {
                        scope.INTERSECTED.traverse(function(child) {
                            if (labScene.scene.getObjectByName(scope.INTERSECTED.name + "-helper")) {
                                labScene.scene.getObjectByName(scope.INTERSECTED.name + "-helper").material.opacity = 0;
                            }

                            hideInfoPanel();
                        })
                    }

                    scope.INTERSECTED = intersects[0].object.parent;

                    if (scope.INTERSECTED.name == "bypass") {
                        scope.INTERSECTED = scope.INTERSECTED.parent;
                    }

                    scope.INTERSECTED.traverse(function(child) {
                        if (labScene.scene.getObjectByName(scope.INTERSECTED.name + "-helper")) {
                            if (scope.INTERSECTED.name != scope.currentPos) {
                                labScene.scene.getObjectByName(scope.INTERSECTED.name + "-helper").material.opacity = 1;
                                getInfoPanel();
                            }
                        } else if (child instanceof THREE.Mesh) {
                            if (scope.INTERSECTED.name != scope.currentPos) {
                                getInfoPanel();
                            }
                        }
                    })
                }
            } else {
                if (scope.INTERSECTED) {
                    scope.INTERSECTED.traverse(function(child) {
                        if (labScene.scene.getObjectByName(scope.INTERSECTED.name + "-helper")) {
                            labScene.scene.getObjectByName(scope.INTERSECTED.name + "-helper").material.opacity = 0;
                        } 

                        hideInfoPanel();
                    })
                }

                scope.INTERSECTED = null;
            }
        }
    }

    this.enableInteractingWithLabware = function(content) {
        enableInteractingWithLabware = true;
        interactive = {
            labwares: content.labware,
            steps: content.steps
        }

        scope.labGuide.createGuideText(interactive.steps[0].guideText);
    }

    this.resetInteractiveSettings = function() {
        interactive = null;
        interactiveStep = 0;
        enableInteractingWithLabware = false;
        scope.labScene.labwares.reset();
    }

    // Internals
    var scope = this;

    var mouse = new THREE.Vector2(), infoMouse = new THREE.Vector2();

    var infoPanel = document.getElementById("info-panel");

    var guideLock = false, mouseClickLock = false;
    var enableInteractingWithLabware = false, interactive = null, interactiveStep = 0, delay = 0;

    function onDocumentMouseMove(event) {
        event.preventDefault();
    
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
        infoMouse.x = event.clientX;
        infoMouse.y = event.clientY;
    }

    function onDocumentMouseDown(event) {
        event.preventDefault();
        
        if (scope.INTERSECTED && scope.INTERSECTED.name != scope.currentPos) {
            switch(scope.INTERSECTED.name) {
                case "guide-tab": {
                    scope.prevPos = scope.currentPos;
                    scope.currentPos = "guide-tab";
                    hideInfoPanel();
                    scope.labGuide.bringUpGuideTab();
                    break;
                }
                case "window": {
                    scope.currentPos = "window";
                    hideInfoPanel();
                    scope.labGuide.moveToWindow();
                    break;
                }
                case "lab-desk": {
                    scope.currentPos = "lab-desk";
                    hideInfoPanel();
                    scope.labGuide.moveToDesk();
                    break;
                }
                default: break;
            }
        }

        if (enableInteractingWithLabware && !mouseClickLock) {
            var labware = interactive.labwares[interactive.steps[interactiveStep].target - 1]; 
            if (scope.INTERSECTED && scope.INTERSECTED.contentId == labware.id) {
                switch (interactive.steps[interactiveStep].action) {
                    case 'pick-up': {
                        mouseClickLock = true;                      
                        var object = scope.INTERSECTED;
                        var hand = scope.labScene.camera.children[1];

                        var oldPos = {
                            x: hand.position.x,
                            y: hand.position.y,
                            z: hand.position.z
                        };
                        var oldRotation = {
                            x: hand.rotation.x,
                            y: hand.rotation.y,
                            z: hand.rotation.z
                        }

                        THREE.SceneUtils.detach(hand, scope.labScene.camera, scope.labScene.scene);
                        hand.rotation.x = -2.1;
                        hand.rotation.y = -0.35;

                        var pickUpPos = {
                            x: scope.INTERSECTED.position.x,
                            y: scope.INTERSECTED.position.y,
                            z: scope.INTERSECTED.position.z
                        }
                        new TWEEN.Tween(hand.position)
                        .to({x: pickUpPos.x, y: pickUpPos.y, z: pickUpPos.z}, 400)
                        .easing(TWEEN.Easing.Quadratic.InOut)
                        .onComplete(function() {
                            THREE.SceneUtils.attach(object, scope.labScene.scene, hand);
                            THREE.SceneUtils.attach(hand, scope.labScene.scene, scope.labScene.camera);

                            switch (labware.name) {
                                case "test-tube": {
                                    object.position.x -= 0.05;
                                    object.position.y += 0.05;
                                    
                                    break;
                                }
                                case "beaker": {
                                    object.position.x -= 0.05;
                                    object.position.y += 0.05;
                                    
                                    break;
                                }
                                default: break;
                            }

                            new TWEEN.Tween(hand.position)
                            .to({x: oldPos.x, y: oldPos.y, z: oldPos.z}, 400)
                            .easing(TWEEN.Easing.Quadratic.InOut)
                            .start();

                            new TWEEN.Tween(hand.rotation)
                            .to({x: -1.7, y: 0.7, z: oldRotation.z}, 400)
                            .easing(TWEEN.Easing.Quadratic.InOut)
                            .onComplete(function() {
                                mouseClickLock = false;
                            })
                            .start();

                            nextInteractiveStep();
                        })
                        .start();

                        break;
                    }
                    case 'pour': {
                        mouseClickLock = true;
                        var object = scope.INTERSECTED;
                        var hand = scope.labScene.camera.children[1];

                        var oldPos = {
                            x: hand.position.x,
                            y: hand.position.y,
                            z: hand.position.z
                        };
                        var oldRotation = {
                            x: hand.rotation.x,
                            y: hand.rotation.y,
                            z: hand.rotation.z
                        }
                        var pourPos = {
                            x: scope.INTERSECTED.position.x,
                            y: scope.INTERSECTED.position.y + (object.boundingBox.max.y - object.boundingBox.min.y) * object.scaleMultiplier / 2 + 2,
                            z: scope.INTERSECTED.position.z - (hand.children[1].boundingBox.max.y - hand.children[1].boundingBox.min.y) / 2 - 0.5
                        }

                        THREE.SceneUtils.detach(hand, scope.labScene.camera, scope.labScene.scene);

                        new TWEEN.Tween(hand.position)
                        .to({x: pourPos.x, y: pourPos.y, z: pourPos.z}, 400)
                        .easing(TWEEN.Easing.Quadratic.InOut)
                        .onComplete(function() {
                            new TWEEN.Tween(hand.rotation)
                            .to({x: -0.9, y: 0.25, z: 1.8}, 400)
                            .easing(TWEEN.Easing.Quadratic.InOut)
                            .onComplete(function() {
                                THREE.SceneUtils.attach(hand, scope.labScene.scene, scope.labScene.camera);

                                new TWEEN.Tween(hand.position)
                                .to({x: oldPos.x, y: oldPos.y, z: oldPos.z}, 400)
                                .easing(TWEEN.Easing.Quadratic.InOut)
                                .start();

                                new TWEEN.Tween(hand.rotation)
                                .to({x: oldRotation.x, y: oldRotation.y, z: oldRotation.z}, 400)
                                .easing(TWEEN.Easing.Quadratic.InOut)
                                .onComplete(function() {
                                    mouseClickLock = false;
                                })
                                .start();

                                nextInteractiveStep();
                                checkForReaction();
                            })
                            .start();
                        })
                        .start();

                        break;
                    }
                    case "clean": {
                        var object = scope.INTERSECTED;
                        object.boundingBox = scope.INTERSECTED.boundingBox;
                        object.scaleMultiplier = scope.INTERSECTED.scaleMultiplier; 
                        object.scale.set(object.scaleMultiplier / 2, object.scaleMultiplier / 2, object.scaleMultiplier / 2);
                        var dustpan = scope.labScene.labwares.getUtils("dustpan");
                        
                        var width = (object.boundingBox.max.x - object.boundingBox.min.x) * object.scaleMultiplier;
                        var height = (object.boundingBox.max.y - object.boundingBox.min.y) * object.scaleMultiplier;
                        var depth = (object.boundingBox.max.z - object.boundingBox.min.z) * object.scaleMultiplier;
                        var cleanPos = {
                            x: object.position.x + width / 2,
                            y: object.position.y,
                            z: object.position.z + depth / 2
                        }

                        dustpan.position.set(cleanPos.x, cleanPos.y, cleanPos.z);
                        dustpan.rotation.z += Math.PI * 3 / 4;
                        scope.labScene.add(dustpan);
                        
                        scope.labGuide.resetToEmptyHand();
                        var hand = scope.labScene.camera.children[1];
                        var oldPos = {
                            x: hand.position.x,
                            y: hand.position.y,
                            z: hand.position.z
                        }
                        THREE.SceneUtils.detach(hand, scope.labScene.camera, scope.labScene.scene);
                        hand.rotation.set(-1, -0.1, 2.4);

                        new TWEEN.Tween(hand.position)
                        .to({
                            x: cleanPos.x - 1.5,
                            y: cleanPos.y + 1,
                            z: cleanPos.z - 2
                        }, 300)
                        .easing(TWEEN.Easing.Quadratic.InOut)
                        .onComplete(function() {
                            var brush = dustpan.children[0];
                            THREE.SceneUtils.attach(hand, scope.labScene.scene, brush);
                            hand.position.x = -25;
                            hand.position.y = 25;
                            hand.position.z = 25;

                            var oldX = brush.position.x;
                            var newX = brush.position.x + 100;

                            new TWEEN.Tween(brush.position)
                            .to({x: newX}, 250)
                            .easing(TWEEN.Easing.Quadratic.InOut)
                            .onComplete(function() {
                                new TWEEN.Tween(brush.position)
                                .to({x: oldX}, 250)
                                .easing(TWEEN.Easing.Quadratic.InOut)
                                .onComplete(function() {         
                                    new TWEEN.Tween(brush.position)
                                    .to({x: newX}, 250)
                                    .easing(TWEEN.Easing.Quadratic.InOut)
                                    .onComplete(function() {
                                        new TWEEN.Tween(brush.position)
                                        .to({x: oldX}, 250)
                                        .easing(TWEEN.Easing.Quadratic.InOut)
                                        .onComplete(function() {
                                            THREE.SceneUtils.attach(object, scope.labScene.scene, dustpan);
                                            object.position.x = 75;

                                            THREE.SceneUtils.attach(dustpan, scope.labScene.scene, scope.labScene.camera);

                                            new TWEEN.Tween(dustpan.position)
                                            .to({
                                                x: oldPos.x,
                                                y: oldPos.y,
                                                z: oldPos.z
                                            }, 400)
                                            .start();

                                            new TWEEN.Tween(scope.labGuide.controls.target)
                                            .to({x: -24.995, y: 27.499, z: -27.01}, 700)
                                            .onComplete(function() {
                                                THREE.SceneUtils.detach(dustpan, scope.labScene.camera, scope.labScene.scene);
                                                dustpan.rotation.y = 0.45;

                                                new TWEEN.Tween(dustpan.position)
                                                .to({
                                                    x: -12.5,
                                                    y: 15,
                                                    z: -42.5
                                                }, 400)
                                                .onComplete(function() {
                                                    THREE.SceneUtils.detach(hand, brush, scope.labScene.scene);
                                                    THREE.SceneUtils.attach(hand, scope.labScene.scene, scope.labScene.camera);
                                                    scope.labGuide.resetToEmptyHand();
                                                    scope.labScene.destroy(dustpan);

                                                    new TWEEN.Tween(scope.labGuide.controls.target)
                                                    .to({x: -25.01, y: 27.5, z: -27}, 400)
                                                    .start();

                                                    nextInteractiveStep();
                                                })
                                                .start(); 
                                            })
                                            .start();
                                        })
                                        .start();
                                    })
                                    .start();
                                })
                                .start();
                            })
                            .start();
                        })
                        .start();
                        
                        break;
                    }
                    case "light-burner": {
                        mouseClickLock = true;
                        var object = scope.INTERSECTED;
                        var hand = scope.labScene.camera.children[1];

                        var oldPos = {
                            x: hand.position.x,
                            y: hand.position.y,
                            z: hand.position.z
                        };

                        THREE.SceneUtils.detach(hand, scope.labScene.camera, scope.labScene.scene);

                        var objPos = {
                            x: scope.INTERSECTED.position.x,
                            y: scope.INTERSECTED.position.y,
                            z: scope.INTERSECTED.position.z
                        }
                        new TWEEN.Tween(hand.position)
                        .to({x: objPos.x, y: objPos.y, z: objPos.z}, 400)
                        .easing(TWEEN.Easing.Quadratic.InOut)
                        .onComplete(function() {
                            THREE.SceneUtils.attach(hand, scope.labScene.scene, scope.labScene.camera);

                            scope.labScene.getAnimation(object, "flame");

                            new TWEEN.Tween(hand.position)
                            .to({x: oldPos.x, y: oldPos.y, z: oldPos.z}, 400)
                            .easing(TWEEN.Easing.Quadratic.InOut)
                            .onComplete(function() {
                                mouseClickLock = false;
                                nextInteractiveStep();
                                checkForReaction();
                            })
                            .start();
                        })
                        .start();

                        break;
                    }
                    default: break;
                }
            }
        }
    }

    function nextInteractiveStep() {
        interactiveStep += 1;

        // If the previous action is "reaction",
        // We need to decrease the interactiveStep by 1
        // to get the correct guideText
        if (interactiveStep > interactive.steps.length - 1) {
            scope.labGuide.unitLoop.readyForNextStep = true;
            enableInteractingWithLabware = false;
        }

        if (interactive.steps[interactiveStep - delay]) {
            var guideText = interactive.steps[interactiveStep - delay].guideText;
            if (guideText) {
                scope.labGuide.createGuideText(guideText);
            }
        }
        
        delay = 0;
    }

    function checkForReaction() {
        if (!enableInteractingWithLabware) {
            return;
        }

        var step = interactive.steps[interactiveStep];
        var labware = interactive.labwares[step.target - 1];
        
        if (step.action == "reaction") {
            var target = scope.labScene.labwares.interactingTargets[step.target - 1];

            switch (step.reaction.type) {
                case "change-texture": {
                    switch (labware.name) {
                        case 'spilled-chemical': {
                            new THREE.TextureLoader()
                            .load("textures/chemical/sulphur.jpg", function(texture) {
                                target.children[0].material.map = texture;
                                target.children[0].material.needsUpdate = true;

                                var r = (target.boundingBox.max.x - target.boundingBox.min.x) / 6;
                                var h = (target.boundingBox.max.y - target.boundingBox.min.y) / 4;
                                var pile = new THREE.Mesh(
                                    new THREE.ConeBufferGeometry(r, h, 32, 32),
                                    new THREE.MeshPhongMaterial({
                                        map: texture
                                    })
                                )
                                
                                target.add(pile);
                                pile.position.y += h / 2;
                                pile.position.z += 150;

                                interactiveStep += 1;
                                delay = 1;
                            });

                            break;
                        }
                        default: break;
                    }
                    
                    break;
                }
                case 'evaporate': {
                    switch (labware.name) {
                        case 'retort': {
                            var fill = target.children[2];
                            fill.boundingBox = new THREE.Box3().setFromObject(fill);
                            fill.name = labware.name;

                            setTimeout(function() {
                                scope.labScene.getParticleSystem("bubble", fill);
                            }, 1000);

                            break;
                        }
                        default: break;
                    }

                    break;
                }
                default: break;
            }
        };
    }

    // Preview Info Panel
    function getInfoPanel() {
        if (!scope.labScene.previewInfo[scope.INTERSECTED.name]) {
            return;
        }

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
            <h3>${scope.labScene.previewInfo[scope.INTERSECTED.name].name}</h3>
            <p>${scope.labScene.previewInfo[scope.INTERSECTED.name].desc}</p>`;
        infoPanel.style.transform = 'translate(' + newPos.x + 'px, ' + newPos.y + 'px)';
        infoPanel.style.opacity = 1;
    }

    // Hide element preview data panel
    function hideInfoPanel() {
        infoPanel.style.opacity = 0;
    }
}
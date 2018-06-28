var initGuideTexts = [
    "Use mouse to look around by clicking & dragging",
    "You can view some areas & equipment's info by hovering over them",
    "To start with the lab tutorial experience, please bring up the tab on your left hand"
]

LabGuide = function(gui, labScene) {
    this.gui = gui;

    this.labScene = labScene;

    this.lessons = new Lessons(this);

    this.raycaster = new THREE.Raycaster();

    this.animation = new Animation(this);

    this.currentPos = ''
    this.prevPos = '';

    this.init = function(raycastTarget) {
        initOnScreenGuideSys();
        scope.createGuideText(initGuideTexts);

        loadGuideTab();

        scope.animation.init();
        scope.lessons.init();

        document.addEventListener('mousemove', onDocumentMouseMove, false);
        document.addEventListener('mousedown', onDocumentMouseDown, false);
    }

    this.getMainMenu = function(section) {
        document.getElementById('gtab-back-to-menu').style.pointerEvents = "none";
        document.getElementById('gtab-back-to-menu').style.opacity = 0.5;

        document.getElementById('gtab-pagination').style.visibility = "hidden";

        switch(section) {
            case 'lessons': {
                document.getElementById('gtab-content-header').innerHTML = '<h4>' + section.charAt(0).toUpperCase() + section.slice(1) + '</h4>';

                scope.lessons.listUnit();

                break;
            }
            default: break;
        }
    }

    this.createGuideText = function(texts) {
        page = 0;
        guideTexts = texts;

        document.getElementById("gt-pagination-page").innerHTML = (page + 1) + ' / ' + texts.length;
        document.getElementById("gt-body").innerHTML = texts[page];

        document.getElementById("guide-text").style.visibility = "visible";
        document.getElementById("guide-text").style.opacity = 1;
    }

    this.hideGuideText = function() {
        document.getElementById("guide-text").style.visibility = "hidden";
        document.getElementById("guide-text").style.opacity = 0;
    }

    this.reset = function() {
        resetInteractiveSettings();
        scope.resetToEmptyHand();
        scope.hideGuideText();
        scope.labScene.reset();
        scope.animation.reset();
    }

    this.resetToEmptyHand = function() {
        var hand = scope.labScene.camera.children[1];
        var handAttachment = hand.children[1];
        
        hand.rotation.set(-1.25, -0.5, 0);
        hand.position.set(2.75, -3, -4.5);
    
        if (handAttachment) {
            hand.remove(handAttachment);
            scope.labScene.destroy(handAttachment);
        };
    }

    this.enableInteractingWithLabware = function(content) {
        enableInteractingWithLabware = true;
        interactive = {
            labwares: content.labware,
            steps: content.steps
        }

        scope.createGuideText(interactive.steps[0].guideText);
    }

    this.nextInteractiveStep = function() {
        interactiveStep += 1;

        // If the previous action is "reaction",
        // We need to decrease the interactiveStep by 1
        // to get the correct guideText
        if (interactiveStep > interactive.steps.length - 1) {
            console.log("Eos");
            scope.lessons.readyForNextStep = true;
            enableInteractingWithLabware = false;
        }

        if (interactive.steps[interactiveStep]) {
            var guideText = interactive.steps[interactiveStep].guideText;
            if (guideText) {
                scope.createGuideText(guideText);
            }
        }
        
        mouseClickLock = false;
        checkForReaction();
    }

    this.update = function() {
        if (!guideLock) {
            scope.raycaster.setFromCamera(mouse, scope.labScene.camera);
            var intersects = scope.raycaster.intersectObjects(scope.labScene.raycastTarget, true);
            if (intersects.length > 0) {
                if (INTERSECTED != intersects[0].object.parent) {
                    if (INTERSECTED) {
                        INTERSECTED.traverse(function(child) {
                            if (labScene.scene.getObjectByName(INTERSECTED.name + "-helper")) {
                                labScene.scene.getObjectByName(INTERSECTED.name + "-helper").material.opacity = 0;
                            }

                            hideInfoPanel();
                        })
                    }

                    INTERSECTED = intersects[0].object.parent;

                    if (INTERSECTED.name == "bypass") {
                        INTERSECTED = INTERSECTED.parent;
                    }

                    INTERSECTED.traverse(function(child) {
                        if (labScene.scene.getObjectByName(INTERSECTED.name + "-helper")) {
                            if (INTERSECTED.name != scope.currentPos) {
                                labScene.scene.getObjectByName(INTERSECTED.name + "-helper").material.opacity = 1;
                                getInfoPanel();
                            }
                        } else if (child instanceof THREE.Mesh) {
                            if (INTERSECTED.name != scope.currentPos) {
                                getInfoPanel();
                            }
                        }
                    })
                }
            } else {
                if (INTERSECTED) {
                    INTERSECTED.traverse(function(child) {
                        if (labScene.scene.getObjectByName(INTERSECTED.name + "-helper")) {
                            labScene.scene.getObjectByName(INTERSECTED.name + "-helper").material.opacity = 0;
                        } 

                        hideInfoPanel();
                    })
                }

                INTERSECTED = null;
            }
        }

        scope.lessons.update();
        scope.labScene.update();
        scope.animation.update();
    }

    // Move to experiment desk position
    this.moveToDesk = function() {
        new TWEEN.Tween(scope.labScene.controls.target)
        .to({x: -25.01, y: 27.5, z: -27}, 500)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();

        new TWEEN.Tween(scope.labScene.camera.position)
        .to({x: -25, y: 27.5, z: -27}, 500)
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
            document.getElementById("guide-tab").style.pointerEvents = "auto";
        })
        .start();

        INTERSECTED.parent.children[1].visible = false;

        guideLock = true;
        scope.lessons.checkNextStep();
    }

    // Turn off the guide tab
    this.turnOffGuideTab = function(event) {
        event.preventDefault();

        document.getElementById("guide-tab").style.visibility = "hidden";
        document.getElementById("guide-tab").style.opacity = 0;
        document.getElementById("guide-tab").style.pointerEvents = "none";

        new TWEEN.Tween(INTERSECTED.rotation)
        .to({x: -0.5, y: 0, z: 0.05}, 300)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();

        new TWEEN.Tween(INTERSECTED.position)
        .to({x: -4.5, y: -2.2, z: -3}, 300)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();

        INTERSECTED.parent.children[1].visible = true;

        guideLock = false;
        scope.currentPos = scope.prevPos;
        scope.lessons.checkNextStep();
    }

     // Move to window position
    this.moveToWindow = function() {
        new TWEEN.Tween(scope.labScene.controls.target)
        .to({x: 0, y: 30, z: 42.51}, 500)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();

        new TWEEN.Tween(scope.labScene.camera.position)
        .to({x: 0, y: 30, z: 42.5}, 500)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();
    }

    this.moveToElementTable = function() {
        scope.labScene.elementTable.enabled = true;
        
        new TWEEN.Tween(scope.labScene.controls.target)
        .to({x: 0, y: 30, z: 42.51}, 500)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();

        new TWEEN.Tween(scope.labScene.camera.position)
        .to({x: 0, y: 30, z: 42.5}, 500)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();
    }

    // Internals
    var scope = this;

    var guideTexts, page = 0;

    var mouse = new THREE.Vector2(), infoMouse = new THREE.Vector2();

    var infoPanel = document.getElementById("info-panel");

    var guideLock = false, mouseClickLock = false;
    var enableInteractingWithLabware = false, interactive = null, interactiveStep = 0, INTERSECTED = null;

    function loadGuideTab() {
        // Load the tablet
        new THREE.OBJLoader()
        .setPath('models/')
        .load('tablet.obj', function(object) {
            object.scale.set(0.1, 0.1, 0.1);
            object.position.set(-4.5, -2.2, -3);
            object.rotation.x = -0.5;
            object.rotation.z = 0.05;

            object.children[7].material.color.setHex(0x000000);
            object.name = "guide-tab";
            labScene.previewInfo["guide-tab"] = {
                name: "Guide Tab",
                desc: "A glorious Ipad that will assists you with your learning. Click to bring it up."
            };

            scope.labScene.raycastTarget.push(object);
            scope.labScene.camera.add(object);

            // Load the hand
            new THREE.OBJLoader()
            .load("/models/hand.obj", function(object) {
                object.boundingBox = new THREE.Box3().setFromObject(object);
                var offsetX = (object.boundingBox.max.x +  object.boundingBox.min.x) / 2;
                var offsetY = (object.boundingBox.max.y +  object.boundingBox.min.y) / 2;
                var offsetZ = (object.boundingBox.max.z +  object.boundingBox.min.z) / 2;

                object.traverse(function(child) {
                    if (child instanceof THREE.Mesh) {
                        child.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-offsetX, -offsetY, -offsetZ));
                        child.material.side = THREE.DoubleSide;
                    }
                });
                object.scale.set(20, 20, 20);

                object.rotation.x = -1.25;
                object.rotation.y = -0.5;
                object.position.set(2.75, -3, -4.5);
                object.children[0].material.color.setHex(0xFFCD94);

                scope.labScene.camera.add(object);
                scope.labScene.add(camera);

                // Add left hand
                var leftHand = object.clone();
                leftHand.traverse(function(child) {
                    if (child instanceof THREE.Mesh) {
                        child.material = child.material.clone();
                        child.geometry = child.geometry.clone();
                        child.geometry.applyMatrix(new THREE.Matrix4().makeScale(-1, 1, 1));
                    }
                })
                scope.labScene.camera.children[0].add(leftHand);
                leftHand.scale.set(60, 70, 60);
                leftHand.position.set(21, -9, 3);
                leftHand.rotation.set(0, -1, 0.5)
            });
        });
    }

    function initOnScreenGuideSys() {
        document.getElementById("gt-close-button").addEventListener("click", function(event) {
            event.preventDefault();

            document.getElementById("guide-text").style.visibility = "hidden";
            document.getElementById("guide-text").style.opacity = 0;
        });

        document.getElementById("gt-pagination-left").addEventListener("click", function(event) {
            event.preventDefault();

            page -= 1;
            if (page < 0) {
                page = 0;
            }

            document.getElementById("gt-pagination-page").innerHTML = (page + 1) + ' / ' + guideTexts.length;
            document.getElementById("gt-body").innerHTML = guideTexts[page];
        });

        document.getElementById("gt-pagination-right").addEventListener("click", function(event) {
            event.preventDefault();

            page += 1;
            if (page > guideTexts.length - 1) {
                page = guideTexts.length - 1;
            }

            document.getElementById("gt-pagination-page").innerHTML = (page + 1) + ' / ' + guideTexts.length;
            document.getElementById("gt-body").innerHTML = guideTexts[page];
        });
    }

    // -------------------------

    function onDocumentMouseMove(event) {
        event.preventDefault();
    
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
        infoMouse.x = event.clientX;
        infoMouse.y = event.clientY;
    }

    function onDocumentMouseDown(event) {
        event.preventDefault();
        
        if (INTERSECTED && INTERSECTED.name != scope.currentPos) {
            switch(INTERSECTED.name) {
                case "guide-tab": {
                    scope.prevPos = scope.currentPos;
                    scope.currentPos = "guide-tab";
                    hideInfoPanel();
                    scope.bringUpGuideTab();
                    break;
                }
                case "window": {
                    scope.currentPos = "window";
                    hideInfoPanel();
                    scope.moveToWindow();
                    break;
                }
                case "lab-desk": {
                    scope.currentPos = "lab-desk";
                    hideInfoPanel();
                    scope.moveToDesk();
                    break;
                }
                case "element-table": {
                    scope.currentPos = "element-table";
                    hideInfoPanel();
                    scope.moveToElementTable();
                    break;
                }
                default: break;
            }
        }

        if (enableInteractingWithLabware && !scope.mouseClickLock) {
            var labware = interactive.labwares[interactive.steps[interactiveStep].target - 1]; 
            if (INTERSECTED && INTERSECTED.contentId == labware.id) {
                mouseClickLock = true;
                scope.animation.getInteractiveAnimation(interactive.steps[interactiveStep].action, INTERSECTED);
            }
        }
    }

    // Preview Info Panel
    function getInfoPanel() {
        if (!scope.labScene.previewInfo[INTERSECTED.name]) {
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
            <h3>${scope.labScene.previewInfo[INTERSECTED.name].name}</h3>
            <p>${scope.labScene.previewInfo[INTERSECTED.name].desc}</p>`;
        infoPanel.style.transform = 'translate(' + newPos.x + 'px, ' + newPos.y + 'px)';
        infoPanel.style.opacity = 1;
    }

    // Hide element preview data panel
    function hideInfoPanel() {
        infoPanel.style.opacity = 0;
    }

    // ---------------------
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
                            });

                            break;
                        }
                        default: break;
                    }
                    
                    break;
                }
                case 'evaporate': {
                    switch (labware.name) {
                        case 'test-tube': {
                            var object = target.children[0];
                            object.container = labware.name;
                            
                            if (labware.reversed) {
                                object.reversed = true;
                            }

                            setTimeout(function() {
                                scope.animation.getParticleSystem("bubble", object);
                            }, 1000);

                            break;
                        }
                        case 'retort': {
                            var object = target.children[2];
                            object.container = labware.name;

                            setTimeout(function() {
                                scope.animation.getParticleSystem("bubble", object);
                            }, 1000);

                            break;
                        }
                        default: {
                            var object = target.children[0];
                            object.container = labware.name;
                            
                            if (labware.reversed) {
                                object.reversed = true;
                            }

                            setTimeout(function() {
                                scope.animation.getParticleSystem("bubble", object);
                            }, 1000);

                            break;
                        };
                    }

                    break;
                }
                default: break;
            }

            scope.nextInteractiveStep();
        };
    }

    // ---------------------
    // Reset functions
    function resetInteractiveSettings() {
        interactive = null;
        interactiveStep = 0;
        enableInteractingWithLabware = false;
        scope.labScene.labwares.reset();
    }
}
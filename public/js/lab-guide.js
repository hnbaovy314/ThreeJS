var initGuideTexts = [
    "Use mouse to look around by clicking & dragging",
    "You can view some areas & equipment's info by hovering over them",
    "To start with the lab tutorial experience, please bring up the tab on your left hand"
]

LabGuide = function(gui, controls, labScene) {

    this.controls = controls;

    this.labScene = labScene;

    this.raycaster = new Raycaster(gui, controls, labScene, this);

    this.unitLoop = null;

    this.gui = gui;

    this.init = function(raycastTarget) {
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

        document.getElementById('gtab-back-to-menu').addEventListener("click", function(event) {
            event.preventDefault();

            scope.unitLoop.reset();
            scope.labScene.reset();
            scope.reset();
            getMainMenu('lessons');
        })

        document.getElementById("gtab-back-to-scene").addEventListener("click", scope.turnOffGuideTab, false);

        scope.createGuideText(initGuideTexts);
        scope.raycaster.init();
        scope.unitLoop = new UnitLoop(scope.labScene.camera, scope.controls, scope.labScene, scope);
        scope.unitLoop.init();
        
        getMainMenu('lessons');
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
        scope.raycaster.resetInteractiveSettings();
        scope.resetToEmptyHand();
        scope.hideGuideText();
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

    this.update = function() {
        scope.labScene.update();
        scope.raycaster.update();
        scope.unitLoop.update();
    }

    // Move to experiment desk position
    this.moveToDesk = function() {
        new TWEEN.Tween(scope.controls.target)
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
        new TWEEN.Tween(scope.raycaster.INTERSECTED.rotation)
        .to({x: 0, y: 0, z: 0}, 300)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();

        new TWEEN.Tween(scope.raycaster.INTERSECTED.position)
        .to({x: -3.29, y: 0.5, z: -1.75}, 300)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onComplete(function() {
            document.getElementById("guide-tab").style.visibility = "visible";
            document.getElementById("guide-tab").style.opacity = 1;
            document.getElementById("guide-tab").style.pointerEvents = "auto";
        })
        .start();

        scope.raycaster.INTERSECTED.parent.children[1].visible = false;

        guideLock = true;
        scope.unitLoop.checkNextStep();
    }

    // Turn off the guide tab
    this.turnOffGuideTab = function(event) {
        event.preventDefault();

        document.getElementById("guide-tab").style.visibility = "hidden";
        document.getElementById("guide-tab").style.opacity = 0;
        document.getElementById("guide-tab").style.pointerEvents = "none";

        new TWEEN.Tween(scope.raycaster.INTERSECTED.rotation)
        .to({x: -0.5, y: 0, z: 0.05}, 300)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();

        new TWEEN.Tween(scope.raycaster.INTERSECTED.position)
        .to({x: -4.5, y: -2.2, z: -3}, 300)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();

        scope.raycaster.INTERSECTED.parent.children[1].visible = true;

        guideLock = false;
        scope.raycaster.currentPos = scope.raycaster.prevPos;
        scope.unitLoop.checkNextStep();
    }

     // Move to window position
    this.moveToWindow = function() {
        new TWEEN.Tween(scope.controls.target)
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

    function getMainMenu(section) {
        document.getElementById('gtab-back-to-menu').style.pointerEvents = "none";
        document.getElementById('gtab-back-to-menu').style.opacity = 0.5;

        document.getElementById('gtab-pagination').style.visibility = "hidden";

        switch(section) {
            case 'lessons': {
                document.getElementById('gtab-content-header').innerHTML = '<h4>' + section.charAt(0).toUpperCase() + section.slice(1) + '</h4>';

                listUnit();

                break;
            }
            default: break;
        }
    }

    function listUnit() {
        document.getElementById("gtab-content-body").innerHTML = '<ul><li><a id="unit-1" href="javascript:void(0)">Unit 1</a></li><li><a id="unit-2" href="javascript:void(0)">Unit 2</a></li></ul>';
        document.getElementById('unit-1').addEventListener('click', scope.unitLoop.unit1, false);
        document.getElementById('unit-2').addEventListener('click', scope.unitLoop.unit2, false);
    }
}
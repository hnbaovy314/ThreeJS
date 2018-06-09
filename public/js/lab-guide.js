var initGuideTexts = [
    "Use mouse to look around by clicking & dragging",
    "You can view some areas & equipment's info by hovering over them",
    "To start with the lab tutorial experience, please bring up the tab on your left hand"
]

var equipmentsInfo = {
    "guide-tab": {
        name: "Guide Tab",
        desc: "A glorious Ipad that will assists you with your learning. Click to bring it up."
    },
    "window": {
        name: "Lab's Window",
        desc: "Click if you want to take a closer look at the city."
    },
    "lab-desk": {
        name: "Lab's Experiment Desk",
        desc: "All experiments will be conducted here. Click to move to the desk."
    },
    "test-tube": {
        name: "Test Tube",
        desc: "All experiments will be conducted here. Click to move to the desk."
    },
    "flask": {
        name: "Conical Flask",
        desc: "All experiments will be conducted here. Click to move to the desk."
    },
    "retort": {
        name: "Retort",
        desc: "All experiments will be conducted here. Click to move to the desk."
    },
    "beaker": {
        name: "Beaker",
        desc: "All experiments will be conducted here. Click to move to the desk."
    }
}

LabGuide = function(gui, camera, scene, controls, labScene) {

    this.camera = camera;
    
    this.scene = scene;

    this.controls = controls;

    this.labScene = labScene;

    this.raycaster = new Raycaster(gui, camera, scene, controls, labScene.raycastTarget, equipmentsInfo);

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

                scope.labScene.raycastTarget.push(object);
                scope.camera.add(object);
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

            getMainMenu('lessons');
        })

        scope.createGuideText(initGuideTexts);
        scope.raycaster.init();
        scope.unitLoop = new UnitLoop(scope.camera, scope.controls, scope.raycaster, scope.labScene);
        scope.unitLoop.init();
        
        getMainMenu('lessons');
    }

    this.createGuideText = function(texts) {
        guideTexts = texts;

        document.getElementById("gt-pagination-page").innerHTML = (page + 1) + ' / ' + texts.length;
        document.getElementById("gt-body").innerHTML = texts[page];

        document.getElementById("guide-text").style.visibility = "visible";
        document.getElementById("guide-text").style.opacity = 1;
    }

    this.update = function() {
        scope.raycaster.update();
        scope.unitLoop.update();
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
        document.getElementById("gtab-content-body").innerHTML = '<a id="unit-1" href="javascript:void(0)">Unit 1</a>';
        document.getElementById('unit-1').addEventListener('click', scope.unitLoop.unit1, false);
    }
}
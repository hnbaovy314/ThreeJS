LabGuide = function(camera, scene) {

    this.camera = camera;
    
    this.scene = scene;

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

                raycastTarget.push(object);
                scope.camera.add(object);
            });

        document.getElementById("gt-close-button").addEventListener("click", function(event) {
            document.getElementById("guide-text").style.visibility = "hidden";
            document.getElementById("guide-text").style.opacity = 0;
        });

        document.getElementById("gt-pagination-left").addEventListener("click", function(event) {
            page -= 1;
            if (page < 0) {
                page = 0;
            }

            document.getElementById("gt-pagination-page").innerHTML = page + ' / ' + guideTexts.length;
            document.getElementById("gt-body").innerHTML = guideTexts[page - 1];
        });

        document.getElementById("gt-pagination-right").addEventListener("click", function(event) {
            page += 1;
            if (page > guideTexts.length) {
                page = guideTexts.length;
            }

            document.getElementById("gt-pagination-page").innerHTML = page + ' / ' + guideTexts.length;
            document.getElementById("gt-body").innerHTML = guideTexts[page - 1];
        });
    }

    this.createGuideText = function(texts) {
        guideTexts = texts;

        document.getElementById("gt-pagination-page").innerHTML = page + ' / ' + texts.length;
        document.getElementById("gt-body").innerHTML = texts[page - 1];

        document.getElementById("guide-text").style.visibility = "visible";
        document.getElementById("guide-text").style.opacity = 1;
    }

    // Internals
    var scope = this;

    var guideTexts, page = 1;
}
Labwares = function(labScene, gui) {

    this.labScene = labScene;

    this.interactingTargets = [];

    this.gui = gui;

    this.reset = function() {
        for (var i = scope.interactingTargets.length - 1; i >= 0; i--) {
            scope.labScene.destroy(scope.interactingTargets[i]);
        };

        scope.interactingTargets = [];
    }

    this.init = function() {
        loadLabware();
        loadSampleSituation();
        loadUtils();
    }

    this.getLabware = function(chemical) {
        var labware = labwares[chemical.container].clone();
        labware.boundingBox = labwares[chemical.container].boundingBox;
        labware.scaleMultiplier = labwares[chemical.container].scaleMultiplier;
        labware.enableInfo = labwares[chemical.container].enableInfo;

        labware.traverse(function(child) {
            if (child instanceof THREE.Mesh) {
                child.material = child.material.clone();
            }
        });

        // Fill labware
        fillLabware(labware, chemical);

        scope.interactingTargets.push(labware);
        return labware;
    }

    this.getUtils = function(name) {
        var util = utils[name].clone();
        util.boundingBox = utils[name].boundingBox;
        util.scaleMultiplier = utils[name].scaleMultiplier;
        util.enableInfo = utils[name].enableInfo;

        util.traverse(function(child) {
            if (child instanceof THREE.Mesh) {
                child.material = child.material.clone();
            }
        });

        return util;
    }

    // Internals
    var scope = this;

    var labwares = {};
    var utils = {};

    function loadLabware() {
        // Load the test tube rack
        new THREE.MTLLoader()
        .setPath('/models/labware/')
        .load('test-tube-rack.mtl', function(materials) {
            materials.preload();
            new THREE.OBJLoader()
                .setMaterials(materials)
                .setPath('models/labware/')
                .load('test-tube-rack.obj', function(object) {
                    object.scale.set(0.125, 0.125, 0.125);
                    object.position.set(-44, 22, -30);
                    object.rotation.y = Math.PI / 2;

                    object.traverse(function(child) {
                        if (child instanceof THREE.Mesh) {
                            child.castShadow = true;
                        }
                    })

                    scope.labScene.add(object);
                });
        });

        // Load the test tube
        new THREE.OBJLoader()
        .load("/models/labware/test-tube.obj", function(object) {
            object.traverse(function(child) {
                if (child instanceof THREE.Mesh) {
                    child.castShadow = true;
                    child.material.transparent = true;
                    child.material.opacity = 0.7;
                }
            });

            object.boundingBox = new THREE.Box3().setFromObject(object);
            var offsetX = (object.boundingBox.max.x +  object.boundingBox.min.x) / 2;
            var offsetY = (object.boundingBox.max.y +  object.boundingBox.min.y) / 2;
            var offsetZ = (object.boundingBox.max.z +  object.boundingBox.min.z) / 2;
            object.traverse(function(child) {
                if (child instanceof THREE.Mesh) {
                    child.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-offsetX, -offsetY, -offsetZ));
                }
            });

            var anotherTube = object.clone();
            anotherTube.boundingBox = new THREE.Box3().setFromObject(anotherTube);
            fillLabware(anotherTube, {container: "test-tube", color: 0xFF0000, form: "liquid", fillScale: 2 /5});
            
            object.scaleMultiplier = 3;
            object.name = "test-tube";
            scope.labScene.previewInfo["test-tube"] = {
                name: "Test Tube",
                desc: "All experiments will be conducted here. Click to move to the desk."
            };
            object.scale.set(object.scaleMultiplier, object.scaleMultiplier, object.scaleMultiplier);
            anotherTube.scale.set(3, 3, 3);

            var height = object.boundingBox.max.y - object.boundingBox.min.y;
            object.position.set(-43.0, 20.05 + height * object.scaleMultiplier / 2, -27.25);
            anotherTube.position.set(-43.0, 20.05 + height * object.scaleMultiplier / 2, -29.05);

            object.enableInfo = true;
            labwares[object.name] = object;
            scope.labScene.raycastTarget.push(object);
            scope.labScene.add(object);
            scope.labScene.add(anotherTube);
        });

        // Load the flask
        new THREE.OBJLoader()
        .load("/models/labware/flask.obj", function(object) {
            var anotherFlask = object.clone();
            anotherFlask.position.set(-45, 21, -25);
            
            object.traverse(function(child) {
                if (child instanceof THREE.Mesh) {
                    child.castShadow = true;
                    child.material.transparent = true;
                    child.material.opacity = 0.7;
                }
            });

            object.boundingBox = new THREE.Box3().setFromObject(object);
            var offsetX = (object.boundingBox.max.x +  object.boundingBox.min.x) / 2;
            var offsetY = (object.boundingBox.max.y +  object.boundingBox.min.y) / 2;
            var offsetZ = (object.boundingBox.max.z +  object.boundingBox.min.z) / 2;
            object.traverse(function(child) {
                if (child instanceof THREE.Mesh) {
                    child.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-offsetX, -offsetY, -offsetZ));
                }
            });

            object.scaleMultiplier = 1.5;
            object.name = "flask";
            scope.labScene.previewInfo["flask"] = {
                name: "Conical Flask",
                desc: "All experiments will be conducted here. Click to move to the desk."
            };
            object.scale.set(object.scaleMultiplier, object.scaleMultiplier, object.scaleMultiplier);
            var height = object.boundingBox.max.y - object.boundingBox.min.y;
            object.position.set(-42, 19.675 + height * object.scaleMultiplier / 2, -23.5);

            object.enableInfo = true;
            labwares[object.name] = object;
            scope.labScene.raycastTarget.push(object);
            scope.labScene.add(object);
            scope.labScene.add(anotherFlask);
        });

        // Load the retort and retort stand
        new THREE.OBJLoader()
        .load("/models/labware/retort.obj", function(object1) {
            object1.traverse(function(child) {
                if (child instanceof THREE.Mesh) {
                    child.castShadow = true;
                    child.material.transparent = true;
                    child.material.opacity = 0.7;
                }
            });

            object1.name = "retort";
            scope.labScene.previewInfo["retort"] = {
                name: "Retort",
                desc: "All experiments will be conducted here. Click to move to the desk."
            };

            object1.boundingBox = new THREE.Box3().setFromObject(object1);
            var offsetX = (object1.boundingBox.max.x +  object1.boundingBox.min.x) / 2;
            var offsetY = (object1.boundingBox.max.y +  object1.boundingBox.min.y) / 2;
            var offsetZ = (object1.boundingBox.max.z +  object1.boundingBox.min.z) / 2;
            object1.traverse(function(child) {
                if (child instanceof THREE.Mesh) {
                    child.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-offsetX, -offsetY, -offsetZ));
                }
            });

            new THREE.OBJLoader()
            .load("/models/labware/retort-stand.obj", function(object2) {
                object2.boundingBox = new THREE.Box3().setFromObject(object2);
                var offsetX = (object2.boundingBox.max.x +  object2.boundingBox.min.x) / 2;
                var offsetY = (object2.boundingBox.max.y +  object2.boundingBox.min.y) / 2;
                var offsetZ = (object2.boundingBox.max.z +  object2.boundingBox.min.z) / 2;
                object2.traverse(function(child) {
                    if (child instanceof THREE.Mesh) {
                        child.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-offsetX, -offsetY, -offsetZ));
                    }
                });
                
                object1.add(object2);
                object1.rotation.y = Math.PI * 3 / 4;
                object2.position.x -= 2;
                object2.position.y -= 3;
                object2.position.z -= 2;
                object2.name = "bypass";

                object1.scaleMultiplier = 0.75;
                object1.boundingBox = new THREE.Box3().setFromObject(object1);
                object1.scale.set(object1.scaleMultiplier, object1.scaleMultiplier, object1.scaleMultiplier);
                var height = object1.boundingBox.max.y - object1.boundingBox.min.y;
                object1.position.set(-44, 21 + height * object1.scaleMultiplier / 2, -40);
                
                object1.enableInfo = true;
                labwares[object1.name] = object1;
                scope.labScene.raycastTarget.push(object1);
                scope.labScene.add(object1);
            });
        });

        // Load the beaker
        new THREE.OBJLoader()
        .load("/models/labware/beaker.obj", function(object) {    
            object.traverse(function(child) {
                if (child instanceof THREE.Mesh) {
                    child.castShadow = true;
                    child.material.transparent = true;
                    child.material.opacity = 0.7;
                }
            });

            object.scaleMultiplier = 0.8;
            object.boundingBox = new THREE.Box3().setFromObject(object);
            var offsetX = (object.boundingBox.max.x +  object.boundingBox.min.x) / 2;
            var offsetY = (object.boundingBox.max.y +  object.boundingBox.min.y) / 2;
            var offsetZ = (object.boundingBox.max.z +  object.boundingBox.min.z) / 2;
            object.traverse(function(child) {
                if (child instanceof THREE.Mesh) {
                    child.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-offsetX, -offsetY, -offsetZ));
                }
            });
           
            object.name = "beaker";
            scope.labScene.previewInfo["beaker"] = {
                name: "Beaker",
                desc: "All experiments will be conducted here. Click to move to the desk."
            }
            var height = object.boundingBox.max.y - object.boundingBox.min.y;
            object.scale.set(object.scaleMultiplier, object.scaleMultiplier, object.scaleMultiplier);
            object.position.set(-43, 19.675 + height * object.scaleMultiplier / 2, -20);

            object.enableInfo = true;
            labwares[object.name] = object;
            scope.labScene.raycastTarget.push(object);
            scope.labScene.add(object);
        });
    }

    function loadSampleSituation() {
        // Add spilled chemical
        new THREE.OBJLoader()
        .load("/models/samples/spilled-water.obj", function(object1) {
            object1.remove(object1.children[1]);
            object1.name = "spilled-chemical";
            object1.scaleMultiplier = 0.0075;

            new THREE.OBJLoader()
            .setPath('models/samples/')
            .load('glass.obj', function(object2) { 
                object2.traverse(function(child) {
                    if (child instanceof THREE.Mesh) {
                        child.castShadow = true;
                        child.material.transparent = true;
                        child.material.opacity = 0.7;
                    }
                });

                object2.name = "bypass";
                object2.rotation.z += 0.5;

                object1.add(object2);
                object1.boundingBox = new THREE.Box3().setFromObject(object1);
                object1.scale.set(object1.scaleMultiplier, object1.scaleMultiplier, object1.scaleMultiplier);

                object1.enableInfo = true;
                labwares[object1.name] = object1;

                object2.position.z += 150;
            });
        });
    }

    function loadUtils() {
        // Add cleaning tool
        new THREE.STLLoader()
        .load("/models/dustpan.stl", function(geometry) {
            var object = new THREE.Mesh(
                geometry,
                new THREE.MeshPhongMaterial()
            )

            object.boundingBox = new THREE.Box3().setFromObject(object);
            var offsetX = (object.boundingBox.max.x +  object.boundingBox.min.x) / 2;
            var offsetY = (object.boundingBox.max.y +  object.boundingBox.min.y) / 2;
            var offsetZ = (object.boundingBox.max.z +  object.boundingBox.min.z) / 2;
            object.traverse(function(child) {
                if (child instanceof THREE.Mesh) {
                    child.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-offsetX, -offsetY, -offsetZ));
                    child.material.color.setHex(0xFF0000);
                }
            });

            object.scaleMultiplier = 0.02;
            object.scale.set(object.scaleMultiplier, object.scaleMultiplier, object.scaleMultiplier);
            object.rotation.x = -Math.PI / 2;

            var brush = new THREE.Mesh(
                new THREE.BoxBufferGeometry(150, 75, 5),
                new THREE.MeshPhongMaterial({
                    color: 0xE4E4E4,
                    side: THREE.DoubleSide
                })
            )
            brush.rotation.y = Math.PI / 2;
            brush.rotation.z = Math.PI / 2;
            brush.position.x += 100;
            brush.position.z += 30;
            object.add(brush);

            object.name = "dustpan";
            object.enableInfo = false;
            utils[object.name] = object;

            // Load the trashbin
            new THREE.MTLLoader()
            .setPath('/models/')
            .load('trashbin.mtl', function(materials) {
                materials.preload();
                new THREE.OBJLoader()
                    .setMaterials(materials)
                    .setPath('models/')
                    .load('trashbin.obj', function(object) {
                        object.traverse(function(child) {
                            if (child instanceof THREE.Mesh) {
                                child.material.color.setHex(0x696969);                            }
                        });

                        object.scale.set(0.4, 0.4, 0.4);
                        object.position.set(-10, 0, -45);
                        object.rotation.x = -Math.PI / 2;
                        object.rotation.z = -Math.PI / 2;

                        scope.labScene.add(object);
                    });
            });
        });
    }

    function fillLabware(labware, chemical) {
        if (chemical.fillScale == -1) {
            switch (chemical.container) {
                case "spilled-chemical": {
                    new THREE.TextureLoader()
                    .load('textures/chemical/mercury.jpg', function(texture) {
                        labware.children[0].material.map = texture;
                        labware.children[0].material.needsUpdate = true;
                    });

                    break;
                }
                default: break;
            }

            return;
        }

        var boundingBox = labware.boundingBox;

        var width = boundingBox.max.x - boundingBox.min.x;
        var height = boundingBox.max.y - boundingBox.min.y;
        var depth = boundingBox.max.z - boundingBox.min.z;

        switch(chemical.container) {
            case 'test-tube': {
                switch (chemical.form) {
                    case "liquid": {
                        var fillHeight = height * chemical.fillScale;

                        var mergeGeometry = new THREE.Geometry();
                        var geometry = new THREE.CylinderGeometry(width / 2.2, width / 2.2, fillHeight, 32, 32);
                        mergeGeometry.merge(geometry);
                        geometry = new THREE.SphereGeometry(width / 2.2, 32, 32);
                        geometry.translate(0, -fillHeight / 2, 0);
                        mergeGeometry.merge(geometry);

                        var material = new THREE.MeshPhongMaterial();

                        var fill = new THREE.Mesh(mergeGeometry, material);

                        if (chemical.texture) {
                            var loader = new THREE.TextureLoader();
                            loader.load(
                                'textures/chemical/' + chemical.texture,
                                function(texture) {
                                    material.map = texture;
                                    material.needsUpdate = true;
                                }
                            );   
                        } else {
                            material.color = new THREE.Color(chemical.color);
                            material.needsUpdate = true;
                        }

                        fill.position.set(0, 0 - height / 2 + width / 2.2 + fillHeight / 2, 0);
                        labware.add(fill);

                        break;
                    }
                    case "solid": {
                        var fillHeight = height * chemical.fillScale;

                        var mergeGeometry = new THREE.Geometry();
                        var geometry = new THREE.ConeGeometry(width / 2.2, fillHeight, 32, 32);
                        mergeGeometry.merge(geometry);
                        geometry = new THREE.SphereGeometry(width / 2.2, 32, 32);
                        geometry.translate(0, -fillHeight / 2, 0);
                        mergeGeometry.merge(geometry);
                        
                        var material = new THREE.MeshPhongMaterial();

                        var fill = new THREE.Mesh(mergeGeometry, material);

                        var loader = new THREE.TextureLoader();
                        loader.load(
                            'textures/chemical/' + chemical.texture,
                            function(texture) {
                                material.map = texture;
                                material.needsUpdate = true;
                            }
                        );

                        fill.position.set(0, 0 - height / 2 + width / 2.2 + fillHeight / 2, 0);
                        labware.add(fill);

                        break;
                    }
                    default: break;
                }

                break;
            }
            case 'beaker': {
                switch (chemical.form) {
                    case "liquid": {
                        var fillHeight = height * chemical.fillScale;
                        var geometry = new THREE.CylinderBufferGeometry(width / 2.1, width / 2.1, fillHeight, 32, 32);
                        var material = new THREE.MeshPhongMaterial();
                        var fill = new THREE.Mesh(geometry, material);

                        if (chemical.texture) {
                            var loader = new THREE.TextureLoader();
                            loader.load(
                                'textures/chemical/' + chemical.texture,
                                function(texture) {
                                    material.map = texture;
                                    material.needsUpdate = true;
                                }
                            );   
                        } else {
                            material.color =  new THREE.Color(chemical.color);
                            material.needsUpdate = true;
                        }

                        fill.position.set(0, 0 - height / 2 + fillHeight / 2 + 0.15, 0 - width / 9);
                        labware.add(fill);

                        break;
                    }
                    case "solid": {
                        var fillHeight = height * chemical.fillScale;
                        var geometry = new THREE.ConeBufferGeometry(width / 2.1, fillHeight, 32, 32);
                        var material = new THREE.MeshPhongMaterial();
                        var fill = new THREE.Mesh(geometry, material);

                        var loader = new THREE.TextureLoader();
                        loader.load(
                            'textures/chemical/' + chemical.texture,
                            function(texture) {
                                material.map = texture;
                                material.needsUpdate = true;
                            }
                        );

                        fill.position.set(0, 0 - height / 2 + fillHeight / 2 + 0.15, 0 - width / 9);
                        labware.add(fill);

                        break;
                    }
                    default: break;
                }

                break;
            }
            default: break;
        }
    } 
}
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

    this.getInteractiveLabware = function(data) {
        var labware = labwares[data.name].clone();
        labware.boundingBox = labwares[data.name].boundingBox;
        labware.scaleMultiplier = labwares[data.name].scaleMultiplier;
        labware.enableInfo = labwares[data.name].enableInfo;

        labware.traverse(function(child) {
            if (child instanceof THREE.Mesh) {
                child.material = child.material.clone();
            }
        });

        if (data.chemical) {
            // Fill labware
            scope.fillLabware(labware, data);
        }

        if (data.placed == "horizontal") {
            labware.rotation.x = -Math.PI / 2;
        }

        if (labware) {
            scope.interactingTargets.push(labware);
            return labware;
        }

        return null;
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

    this.getNonInteractiveLabware = function(name) {
        var labware = labwares[name].clone();
        labware.boundingBox = labwares[name].boundingBox;
        labware.scaleMultiplier = labwares[name].scaleMultiplier;
        labware.enableInfo = labwares[name].enableInfo;

        labware.traverse(function(child) {
            if (child instanceof THREE.Mesh) {
                child.material = child.material.clone();
            }
        });

        return labware;
    }

    this.fillLabware = function(labware, data) {
        if (data.fillScale == -1) {
            switch (data.name) {
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

        switch(data.name) {
            case 'test-tube': {
                switch (data.form) {
                    case "liquid": {
                        var fillHeight = height * data.fillScale;

                        if (!data.reversed) {
                            var mergeGeometry = new THREE.Geometry();
                            var geometry = new THREE.CylinderGeometry(width / 2.2, width / 2.2, fillHeight, 32, 32);
                            mergeGeometry.merge(geometry);
                            geometry = new THREE.SphereGeometry(width / 2.2, 32, 32);
                            geometry.translate(0, -fillHeight / 2, 0);
                            mergeGeometry.merge(geometry);

                            var material = new THREE.MeshPhongMaterial();

                            var fill = new THREE.Mesh(mergeGeometry, material);

                            if (data.texture) {
                                var loader = new THREE.TextureLoader();
                                loader.load(
                                    'textures/chemical/' + data.texture,
                                    function(texture) {
                                        material.map = texture;
                                        material.needsUpdate = true;
                                    }
                                );
                            } else {
                                material.color = new THREE.Color(data.color);
                                material.needsUpdate = true;
                            }

                            fill.position.set(0, 0 - height / 2 + width / 2.2 + fillHeight / 2, 0);
                            labware.add(fill);
                            fill.name = "fill";
                        } else {
                            labware.rotation.x = Math.PI;

                            // Create a tray
                            var mergedGeometry = new THREE.Geometry();
                            var geometry = new THREE.PlaneGeometry(width * 4, depth * 4);
                            geometry.rotateX(-Math.PI / 2);
                            geometry.translate(0, height / 4, 0);
                            mergedGeometry.merge(geometry);
                            geometry = new THREE.PlaneGeometry(width * 4, height / 2);
                            geometry.translate(0, 0, -depth * 2);
                            mergedGeometry.merge(geometry);
                            geometry.translate(0, 0, depth * 4);
                            mergedGeometry.merge(geometry);
                            geometry.translate(0, 0, -depth * 2);
                            geometry.rotateY(Math.PI / 2);
                            geometry.translate(-width * 2, 0, 0);
                            mergedGeometry.merge(geometry);
                            geometry.translate(width * 4, 0, 0);
                            mergedGeometry.merge(geometry);

                            var tray = new THREE.Mesh(
                                mergedGeometry,
                                new THREE.MeshPhongMaterial({
                                    side: THREE.DoubleSide,
                                    transparent: true,
                                    opacity: 0.7
                                })
                            )

                            labware.add(tray);
                            tray.position.y += height / 3;
                            labware.children[0].position.y -= height / 12;

                            // Fill
                            mergedGeometry = new THREE.Geometry();
                            geometry = new THREE.PlaneGeometry(width * 4 * 0.95, depth * 4 * 0.95);
                            geometry.rotateX(-Math.PI / 2);
                            geometry.translate(0, height / 6, 0);
                            mergedGeometry.merge(geometry);
                            geometry.translate(0, -height / 3, 0);
                            mergedGeometry.merge(geometry);
                            geometry = new THREE.PlaneGeometry(width * 4 * 0.95, height / 3);
                            geometry.translate(0, 0, -depth * 2 * 0.95);
                            mergedGeometry.merge(geometry);
                            geometry.translate(0, 0, depth * 4 * 0.95);
                            mergedGeometry.merge(geometry);
                            geometry.translate(0, 0, -depth * 2 * 0.95);
                            geometry.rotateY(Math.PI / 2);
                            geometry.translate(-width * 2 * 0.95, 0, 0);
                            mergedGeometry.merge(geometry);
                            geometry.translate(width * 4 * 0.95, 0, 0);
                            mergedGeometry.merge(geometry);
                            geometry = new THREE.CylinderGeometry((width / 2) * 0.9, (width / 2) * 0.9, height / 3, 32, 32);
                            geometry.translate(0, -height / 6, 0);
                            mergedGeometry.merge(geometry);

                            var material = new THREE.MeshPhongMaterial({
                                side: THREE.DoubleSide,
                                transparent: true,
                                opacity: 0.7
                            });
                            if (data.texture) {
                                var loader = new THREE.TextureLoader();
                                loader.load(
                                    'textures/chemical/' + data.texture,
                                    function(texture) {
                                        material.map = texture;
                                        material.needsUpdate = true;
                                    }
                                );
                            } else {
                                material.color = new THREE.Color(data.color);
                                material.needsUpdate = true;
                            }

                            var fill = new THREE.Mesh(mergedGeometry, material);
                            tray.add(fill);
                            fill.position.y += height / 12 * 0.95;
                        }
                        break;
                    }
                    case "solid": {
                        if (data.reversed) {
                            break;
                        }

                        // var fillHeight = height * data.fillScale;
                        var fillHeight = height * 1 / 6;

                        var mergeGeometry = new THREE.Geometry();
                        var geometry = new THREE.ConeGeometry(width / 2.2, fillHeight * 3 / 4, 32, 32);
                        geometry.translate(0, fillHeight / 2 * 0.95, 0);
                        geometry.rotateX(-0.5);
                        mergeGeometry.merge(geometry);
                        geometry = new THREE.CylinderGeometry(width / 2.2, width / 2.2, fillHeight * 2 / 3, 32, 32);
                        geometry.translate(0, -fillHeight / 8, 0);
                        mergeGeometry.merge(geometry);
                        geometry = new THREE.SphereGeometry(width / 2.2, 32, 32);
                        geometry.translate(0, -fillHeight / 2, 0);
                        mergeGeometry.merge(geometry);

                        var material = new THREE.MeshPhongMaterial();

                        var fill = new THREE.Mesh(mergeGeometry, material);

                        var loader = new THREE.TextureLoader();
                        loader.load(
                            'textures/chemical/' + data.texture,
                            function(texture) {
                                material.map = texture;
                                material.needsUpdate = true;
                            }
                        );

                        fill.position.set(0, 0 - height / 2 + width / 2.2 + fillHeight / 2, 0);
                        labware.add(fill);
                        fill.name = "fill";

                        break;
                    }
                    default: break;
                }

                if (data.corked) {
                    var cork = new THREE.Mesh(
                        new THREE.CylinderGeometry(width / 2 * 0.9, width / 2 * 0.9, height / 6, 32, 32),
                        new THREE.MeshPhongMaterial({
                            color: 0x000000
                        })
                    )

                    labware.add(cork);
                    cork.position.y += height / 2;
                }

                break;
            }
            case 'flask': {
                switch (data.form) {
                    case "liquid": {
                        var fillHeight = height * data.fillScale;
                        var geometry = new THREE.CylinderBufferGeometry((width / 2.1) * (data.fillScale * 2), width / 2.1, fillHeight, 32, 32);
                        var material = new THREE.MeshPhongMaterial({
                            transparent: true,
                            opacity: 0.5
                        });
                        var fill = new THREE.Mesh(geometry, material);

                        if (data.texture) {
                            var loader = new THREE.TextureLoader();
                            loader.load(
                                'textures/chemical/' + data.texture,
                                function(texture) {
                                    material.map = texture;
                                    material.needsUpdate = true;
                                }
                            );
                        } else {
                            material.color =  new THREE.Color(data.color);
                            material.needsUpdate = true;
                        }

                        labware.add(fill);
                        fill.name = "fill";
                        fill.position.y -= height / 2 - fillHeight / 2 - 0.15;

                        break;
                    }
                    case "solid": {
                        var fillHeight = height * data.fillScale;
                        var mergedGeometry = new THREE.Geometry();
                        var geometry = new THREE.CylinderGeometry((width / 2.1) * (data.fillScale * 2), width / 2.1, fillHeight, 32, 32, true);
                        mergedGeometry.merge(geometry);
                        geometry = new THREE.ConeGeometry((width / 2.1) * (data.fillScale * 2), fillHeight / 4, 32, 32, true);
                        geometry.translate(0, fillHeight * 5 / 8, 0);
                        mergedGeometry.merge(geometry);


                        var material = new THREE.MeshPhongMaterial();
                        var fill = new THREE.Mesh(mergedGeometry, material);

                        var loader = new THREE.TextureLoader();
                        loader.load(
                            'textures/chemical/' + data.texture,
                            function(texture) {
                                material.map = texture;
                                material.needsUpdate = true;
                            }
                        );

                        labware.add(fill);
                        fill.name = "fill";
                        fill.position.y -= height / 2 - fillHeight / 2 - 0.15;

                        break;
                    }
                    default: break;
                }

                break;
            }
            case 'retort': {
                switch (data.form) {
                    case 'liquid': {
                        var fillHeight = height * 1 / 3 - 0.1;

                        var mergedGeometry = new THREE.Geometry();
                        var geometry = new THREE.SphereGeometry(fillHeight / 2, 32, 32, 0, Math.PI);
                        mergedGeometry.merge(geometry);
                        geometry = new THREE.CircleGeometry(fillHeight / 2, 32);
                        mergedGeometry.merge(geometry);
                        var material = new THREE.MeshPhongMaterial({
                            side: THREE.DoubleSide
                        });

                        if (data.texture) {
                            var loader = new THREE.TextureLoader();
                            loader.load(
                                'textures/chemical/' + data.texture,
                                function(texture) {
                                    material.map = texture;
                                    material.needsUpdate = true;
                                }
                            );
                        } else {
                            material.color = new THREE.Color(data.color);
                            material.needsUpdate = true;
                        }

                        var fill = new THREE.Mesh(mergedGeometry, material);
                        fill.position.set(-2.05, 1.75, -2.15);
                        fill.rotation.x = Math.PI / 2;

                        labware.add(fill);
                        fill.name = "fill";

                        break;
                    }
                    case 'solid': {
                        break;
                    }
                    default: break;
                }

                break;
            }
            case 'beaker': {
                switch (data.form) {
                    case "liquid": {
                        var fillHeight = height * data.fillScale;
                        var geometry = new THREE.CylinderBufferGeometry(width / 2.1, width / 2.1, fillHeight, 32, 32);
                        var material = new THREE.MeshPhongMaterial({
                            transparent: true,
                            opacity: 0.5
                        });
                        var fill = new THREE.Mesh(geometry, material);

                        if (data.texture) {
                            var loader = new THREE.TextureLoader();
                            loader.load(
                                'textures/chemical/' + data.texture,
                                function(texture) {
                                    material.map = texture;
                                    material.needsUpdate = true;
                                }
                            );
                        } else {
                            material.color =  new THREE.Color(data.color);
                            material.needsUpdate = true;
                        }

                        fill.position.set(0, 0 - height / 2 + fillHeight / 2 + 0.15, 0 - width / 9);
                        labware.add(fill);
                        fill.name = "fill";

                        break;
                    }
                    case "solid": {
                        var fillHeight = height * data.fillScale;
                        var mergedGeometry = new THREE.Geometry();
                        var geometry = new THREE.CylinderGeometry(width / 2.1, width / 2.1, fillHeight / 2, 32, 32, true);
                        mergedGeometry.merge(geometry);
                        geometry = new THREE.ConeGeometry(width / 2.1, fillHeight / 2, 32, 32, true);
                        geometry.translate(0, fillHeight / 2, 0);
                        mergedGeometry.merge(geometry);


                        var material = new THREE.MeshPhongMaterial();
                        var fill = new THREE.Mesh(mergedGeometry, material);

                        var loader = new THREE.TextureLoader();
                        loader.load(
                            'textures/chemical/' + data.texture,
                            function(texture) {
                                material.map = texture;
                                material.needsUpdate = true;
                            }
                        );

                        fill.position.set(0, 0 - height / 2 + fillHeight / 2, 0 - width / 9);
                        labware.add(fill);
                        fill.name = "fill";

                        break;
                    }
                    default: break;
                }

                break;
            }
            case 'jar': {
                switch (data.form) {
                    case "liquid": {
                        var fillHeight = height * data.fillScale;
                        var mergedGeometry = new THREE.Geometry();
                        var geometry = new THREE.CylinderGeometry(width / 2.1, width / 2.1, fillHeight, 32, 32);
                        mergedGeometry.merge(geometry);

                        var material = new THREE.MeshPhongMaterial({
                            transparent: true,
                            opacity: 0.5
                        });
                        var fill = new THREE.Mesh(mergedGeometry, material);

                        var loader = new THREE.TextureLoader();
                        loader.load(
                            'textures/chemical/' + data.texture,
                            function(texture) {
                                material.map = texture;
                                material.needsUpdate = true;
                            }
                        );

                        fill.position.set(0, 0 - fillHeight / 1.5, 0);
                        labware.add(fill);
                        fill.name = "fill";

                        break;
                    }
                    case "solid": {
                        var fillHeight = height * data.fillScale;
                        var mergedGeometry = new THREE.Geometry();
                        var geometry = new THREE.CylinderGeometry(width / 2.1, width / 2.1, fillHeight, 32, 32);
                        mergedGeometry.merge(geometry);

                        var material = new THREE.MeshPhongMaterial();
                        var fill = new THREE.Mesh(mergedGeometry, material);

                        var loader = new THREE.TextureLoader();
                        loader.load(
                            'textures/chemical/' + data.texture,
                            function(texture) {
                                material.map = texture;
                                material.needsUpdate = true;
                            }
                        );

                        fill.position.set(0, 0 - fillHeight / 2, 0);
                        labware.add(fill);
                        fill.name = "fill";

                        break;
                    }
                    default: break;
                }

                break;
            }
            default: break;
        }
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
                    child.material.opacity = 0.5;
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
            scope.fillLabware(anotherTube, {container: "test-tube", color: 0xFF0000, form: "liquid", fillScale: 2 /5});

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
                    child.material.opacity = 0.5;
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
                    child.material.opacity = 0.5;
                }
            });

            object1.name = "retort";
            scope.labScene.previewInfo["retort"] = {
                name: "Retort",
                desc: "All experiments will be conducted here. Click to move to the desk."
            };

            object1.boundingBox = new THREE.Box3().setFromObject(object1);
            var offsetX = (object1.boundingBox.max.x + object1.boundingBox.min.x) / 2;
            var offsetY = (object1.boundingBox.max.y + object1.boundingBox.min.y) / 2;
            var offsetZ = (object1.boundingBox.max.z + object1.boundingBox.min.z) / 2;
            object1.traverse(function(child) {
                if (child instanceof THREE.Mesh) {
                    child.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-offsetX, -offsetY, -offsetZ));
                }
            });

            new THREE.OBJLoader()
            .load("/models/labware/retort-stand.obj", function(object2) {
                object2.boundingBox = new THREE.Box3().setFromObject(object2);
                var offsetX = (object2.boundingBox.max.x + object2.boundingBox.min.x) / 2;
                var offsetY = (object2.boundingBox.max.y + object2.boundingBox.min.y) / 2;
                var offsetZ = (object2.boundingBox.max.z + object2.boundingBox.min.z) / 2;
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

                object1.boundingBox = new THREE.Box3().setFromObject(object1);
                var offsetX = (object1.boundingBox.max.x + object1.boundingBox.min.x) / 2;
                var offsetY = (object1.boundingBox.max.y + object1.boundingBox.min.y) / 2;
                var offsetZ = (object1.boundingBox.max.z + object1.boundingBox.min.z) / 2;
                object1.traverse(function(child) {
                    if (child instanceof THREE.Mesh) {
                        child.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-offsetX, -offsetY, -offsetZ));
                    }
                });

                object1.scaleMultiplier = 1;
                object1.boundingBox = new THREE.Box3().setFromObject(object1);
                object1.scale.set(object1.scaleMultiplier, object1.scaleMultiplier, object1.scaleMultiplier);
                var height = object1.boundingBox.max.y - object1.boundingBox.min.y;
                object1.position.set(-44, 19.75 + height * object1.scaleMultiplier / 2, -40);

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
                    child.material.opacity = 0.5;
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

        // Load the spirit lamp
        new THREE.MTLLoader()
        .setPath('/models/labware/')
        .load('burner.mtl', function(materials) {
            materials.preload();
            new THREE.OBJLoader()
                .setMaterials(materials)
                .setPath('models/labware/')
                .load('burner.obj', function(object) {
                    object.remove(object.children[3]);

                    object.boundingBox = new THREE.Box3().setFromObject(object);
                    var offsetX = (object.boundingBox.max.x +  object.boundingBox.min.x) / 2;
                    var offsetY = (object.boundingBox.max.y +  object.boundingBox.min.y) / 2;
                    var offsetZ = (object.boundingBox.max.z +  object.boundingBox.min.z) / 2;
                    object.traverse(function(child) {
                        if (child instanceof THREE.Mesh) {
                            child.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-offsetX, -offsetY, -offsetZ));
                        }
                    });

                    object.children[3].material.transparent = true;
                    object.children[3].material.opacity = 0.5;
                    object.children[3].material.color.setHex(0xFFFFFF);
                    object.children[2].material.color.setHex(0xA1A1A1);

                    object.scaleMultiplier = 0.15;
                    object.scale.set(object.scaleMultiplier, object.scaleMultiplier, object.scaleMultiplier);

                    object.name = "burner";
                    object.enableInfo = false;
                    labwares[object.name] = object;
                });
        });

        // Load the eyedropper
        new THREE.OBJLoader()
        .load('/models/labware/eyedropper.obj', function(object) {
            object.boundingBox = new THREE.Box3().setFromObject(object);
            var offsetX = (object.boundingBox.max.x +  object.boundingBox.min.x) / 2;
            var offsetY = (object.boundingBox.max.y +  object.boundingBox.min.y) / 2;
            var offsetZ = (object.boundingBox.max.z +  object.boundingBox.min.z) / 2;
            object.traverse(function(child) {
                if (child instanceof THREE.Mesh) {
                    child.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-offsetX, -offsetY, -offsetZ));
                    child.material.transparent = true;
                    child.material.opacity = 0.5;
                }
            });

            object.scaleMultiplier = 1;
            object.scale.set(object.scaleMultiplier, object.scaleMultiplier, object.scaleMultiplier);

            object.name = "eyedropper";
            object.enableInfo = false;
            labwares[object.name] = object;
        })

        // Load the funnel
        new THREE.OBJLoader()
        .load('/models/labware/funnel.obj', function(object) {
            object.boundingBox = new THREE.Box3().setFromObject(object);
            var offsetX = (object.boundingBox.max.x +  object.boundingBox.min.x) / 2;
            var offsetY = (object.boundingBox.max.y +  object.boundingBox.min.y) / 2;
            var offsetZ = (object.boundingBox.max.z +  object.boundingBox.min.z) / 2;
            object.traverse(function(child) {
                if (child instanceof THREE.Mesh) {
                    child.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-offsetX, -offsetY, -offsetZ));
                }
            });

            object.scaleMultiplier = 1;
            object.scale.set(object.scaleMultiplier, object.scaleMultiplier, object.scaleMultiplier);

            object.name = "funnel";
            object.enableInfo = false;
            labwares[object.name] = object;
        })

        // Load the pipette
        new THREE.OBJLoader()
        .load('/models/labware/pipette.obj', function(object) {
            object.boundingBox = new THREE.Box3().setFromObject(object);
            var offsetX = (object.boundingBox.max.x +  object.boundingBox.min.x) / 2;
            var offsetY = (object.boundingBox.max.y +  object.boundingBox.min.y) / 2;
            var offsetZ = (object.boundingBox.max.z +  object.boundingBox.min.z) / 2;
            object.traverse(function(child) {
                if (child instanceof THREE.Mesh) {
                    child.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-offsetX, -offsetY, -offsetZ));
                }
            });

            object.scaleMultiplier = 1;
            object.scale.set(object.scaleMultiplier, object.scaleMultiplier, object.scaleMultiplier);

            object.name = "pipette";
            object.enableInfo = false;
            labwares[object.name] = object;
        })

        // Load the stirring rod
        new THREE.OBJLoader()
        .load('/models/labware/stirring-rod.obj', function(object) {
            object.boundingBox = new THREE.Box3().setFromObject(object);
            var offsetX = (object.boundingBox.max.x +  object.boundingBox.min.x) / 2;
            var offsetY = (object.boundingBox.max.y +  object.boundingBox.min.y) / 2;
            var offsetZ = (object.boundingBox.max.z +  object.boundingBox.min.z) / 2;
            object.traverse(function(child) {
                if (child instanceof THREE.Mesh) {
                    child.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-offsetX, -offsetY, -offsetZ));
                }
            });

            object.scaleMultiplier = 1;
            object.scale.set(object.scaleMultiplier, object.scaleMultiplier, object.scaleMultiplier);

            object.name = "stirring-rod";
            object.enableInfo = false;
            labwares[object.name] = object;
        })

        // Load the tongs
        new THREE.MTLLoader()
        .setPath('/models/labware/')
        .load('tongs.mtl', function(materials) {
            materials.preload();
            new THREE.OBJLoader()
            .setMaterials(materials)
            .setPath('models/labware/')
            .load('tongs.obj', function(object) {
                object.boundingBox = new THREE.Box3().setFromObject(object);
                var offsetX = (object.boundingBox.max.x +  object.boundingBox.min.x) / 2;
                var offsetY = (object.boundingBox.max.y +  object.boundingBox.min.y) / 2;
                var offsetZ = (object.boundingBox.max.z +  object.boundingBox.min.z) / 2;
                object.traverse(function(child) {
                    if (child instanceof THREE.Mesh) {
                        child.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-offsetX, -offsetY, -offsetZ));
                    }
                });
    
                object.scaleMultiplier = 12.5;
                object.scale.set(object.scaleMultiplier, object.scaleMultiplier, object.scaleMultiplier);
    
                object.name = "tongs";
                object.enableInfo = false;
                labwares[object.name] = object;
            });
        });

        // Load the jar
        new THREE.OBJLoader()
        .setPath('models/labware/')
        .load('jar.obj', function(object) {
            object.boundingBox = new THREE.Box3().setFromObject(object);
            var offsetX = (object.boundingBox.max.x + object.boundingBox.min.x) / 2;
            var offsetY = (object.boundingBox.max.y + object.boundingBox.min.y) / 2;
            var offsetZ = (object.boundingBox.max.z + object.boundingBox.min.z) / 2;
            object.traverse(function(child) {
                if (child instanceof THREE.Mesh) {
                    child.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-offsetX, -offsetY, -offsetZ));
                    // child.material.side = THREE.DoubleSide;
                    child.material.transparent = true;
                    child.material.opacity = 0.7;
                }
            });

            object.scaleMultiplier = 0.03;
            object.scale.set(object.scaleMultiplier, object.scaleMultiplier, object.scaleMultiplier);

            object.name = "jar";
            object.enableInfo = true;
            labwares[object.name] = object;
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
                                child.material.color.setHex(0x696969);
                            }
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
}

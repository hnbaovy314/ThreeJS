LabScene = function(gui, camera, scene) {
    
    this.camera = camera;
    
    this.scene = scene;

    this.gui = gui;

    this.raycastTarget = [];

    this.init = function() {
        // Build the room
        var roomGeometry = new THREE.Geometry();
        var roomFloorGeometry = new THREE.PlaneGeometry(100, 100, 1);
        var roomWallGeometry = new THREE.PlaneGeometry(100, 60, 10);
        // Ground
        roomFloorGeometry.rotateX(Math.PI / 2);
        roomGeometry.merge(roomFloorGeometry);
        // Ceiling
        roomFloorGeometry.translate(0, 60, 0);
        roomGeometry.merge(roomFloorGeometry);
        roomFloorGeometry.translate(0, -60, 0);
        // Walls
        // Rear
        roomWallGeometry.translate(0, 30, -50);
        var rearWallGeometry = roomWallGeometry.clone();
        rearWallGeometry.vertices[8].x = 45;
        rearWallGeometry.vertices[9].x = 45;
        rearWallGeometry.vertices[16].x = 30;
        rearWallGeometry.vertices[17].x = 30;
        rearWallGeometry.vertices[17].y = 44;
        rearWallGeometry.vertices[18].x = 45;
        rearWallGeometry.vertices[18].y = 44;
        rearWallGeometry.vertices[19].x = 45;
        rearWallGeometry.vertices[20].x = 45;
        roomGeometry.merge(rearWallGeometry);
        // Front
        roomWallGeometry.translate(0, 0, 100);
        // roomGeometry.merge(roomWallGeometry);
        roomWallGeometry.translate(0, 0, -50);
        // Left
        roomWallGeometry.rotateY(Math.PI / 2);
        roomWallGeometry.translate(-50, 0, 0);
        roomGeometry.merge(roomWallGeometry);
        // // Right
        roomWallGeometry.translate(100, 0, 0);
        roomGeometry.merge(roomWallGeometry);

        var room = new THREE.Mesh(
            roomGeometry,
            new THREE.MeshPhongMaterial({
                color: 0xFFFFFF,
                side: THREE.DoubleSide,
                // wireframe: true
            })
        );
        room.receiveShadow = true;
        scope.scene.add(room);

        // Load the door
        new THREE.MTLLoader()
        .setPath('/models/')
        .load('glass-door-2.mtl', function(materials) {
            materials.preload();
            new THREE.OBJLoader()
                .setMaterials(materials)
                .setPath('models/')
                .load('glass-door-2.obj', function(object) {
                    object.scale.set(0.5375, 0.5375, 0.5375);
                    object.position.set(37.5, 0, -50);
                    object.rotation.y = Math.PI;
                    scope.scene.add(object);
                });
        });

        // Load the window
        new THREE.MTLLoader()
        .setPath('/models/')
        .load('window.mtl', function(materials) {
            materials.preload();
            new THREE.OBJLoader()
                .setMaterials(materials)
                .setPath('models/')
                .load('window.obj', function(object) {
                    object.scale.set(1.45, 2.8, 2.5)
                    object.position.z = 50;
                    object.name = "window";

                    scope.raycastTarget.push(object);
                    scope.scene.add(object);
                });
        });
        // ----------------------------------------------------
        // Load light
        var light = new THREE.AmbientLight(0xFFFFFF, 0.4);
        scope.scene.add(light);

        var pointLight = new THREE.PointLight(0xFFFFFF, 0.1, 300, 2);
        pointLight.castShadow = true;
        pointLight.shadow.mapSize.width = 2048;
        pointLight.shadow.mapSize.height = 2048;
        pointLight.position.set(0, 50, 70);
        scope.scene.add(pointLight);

        var directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.3);
        directionalLight.position.set(0, 8000, -4000);
        scope.scene.add(directionalLight);

        var hemiLight = new THREE.HemisphereLight(0xFFFFFF, 0xFFFFFF, 0.2);
        hemiLight.color.setHSL(0.6, 1, 0.6);
        hemiLight.groundColor.setHSL(0.095, 1, 0.75);
        hemiLight.position.set(0, 0, 0);
        scope.scene.add(hemiLight);

        // ----------------------------------------------------
        // Helper
        var axesHelper = new THREE.AxesHelper(100);
        scope.scene.add(axesHelper);
        var gridHelper1 = new THREE.GridHelper(100, 20);
        scope.scene.add(gridHelper1);
        var gridHelper2 = new THREE.GridHelper(100, 20);
        gridHelper2.position.y = 60;
        scope.scene.add(gridHelper2);
        // ----------------------------------------------------
        // Load scene
        // Load the room
        new THREE.MTLLoader()
        .setPath('/models/')
        .load('room-2.mtl', function(materials) {
            materials.preload();
            new THREE.OBJLoader()
                .setMaterials(materials)
                .setPath('models/')
                .load('room-2.obj', function(object) {
                    for (var i = object.children.length - 1; i >= 0; i--) {
                        object.children[i].castShadow = true;
                        object.children[i].receiveShadow = true;
                    }
                    // Somehow the position of some meshes are incorrect
                    // So correct them
                    for (var i = 67; i <= 68; i++) {
                        object.children[i].position.z += 3.5;
                        object.children[i].position.x += 0.5;
                    }

                    for (var i = 72; i <= 74; i++) {
                        object.children[i].position.z += 3.6;
                        object.children[i].position.x += 0.1;
                    }

                    object.children[65].position.z += 3.5;
                    object.children[65].position.x -= 0.2;
                    object.children[66].position.z += 3.6;
                    object.children[66].position.x += 0.1;

                    // Flip the cabinet
                    object.children[64].rotation.y = -Math.PI;
                    object.children[64].position.x = 26.125;
                    object.children[64].position.z = 11;

                    // Move the microscope to the right of the table
                    object.children[70].position.x += 3;
                    object.children[70].position.z -= 5.5;
                    object.children[70].rotation.y = -0.5;

                    // Adjust the whole group
                    object.scale.set(3, 3, 3);
                    object.position.set(-32.5, 0, -25);
                    object.rotation.y = 0.785;

                    // Split the object into 2 different groups
                    // Part 2 is the unnecessary part of the original object
                    var part2 = object.clone();
                    for (var i = 63; i >= 0; i--) {
                        part2.remove(part2.children[i]);
                    }
                    part2.remove(part2.children[69]);
                    part2.remove(part2.children[70]);
                    part2.remove(part2.children[71]);
                    part2.remove(part2.children[75]);

                    // Remove part 2's meshes from part 1
                    object.remove(object.children[74]);
                    object.remove(object.children[73]);
                    object.remove(object.children[72]);
                    object.remove(object.children[68]);
                    object.remove(object.children[67]);
                    object.remove(object.children[66]);
                    object.remove(object.children[65]);
                    object.remove(object.children[64]);
                    object.name = "lab-desk";

                    var boundingBox = new THREE.Box3().setFromObject(object);
                    var helper = new THREE.Box3Helper(boundingBox, 0x1A1A1A);
                    helper.material.transparent = true;
                    helper.material.opacity = 0;
                    helper.name = "lab-desk-helper";
                    scope.scene.add(helper);

                    scope.raycastTarget.push(object);
                    scope.scene.add(part2);
                    scope.scene.add(object);
                });
        });

        // Load the fridge
        new THREE.MTLLoader()
        .setPath('/models/')
        .load('fridge.mtl', function(materials) {
            materials.preload();
            new THREE.OBJLoader()
                .setMaterials(materials)
                .setPath('models/')
                .load('fridge.obj', function(object) {
                    object.scale.set(0.5, 0.5, 0.5);
                    object.castShadow = true;

                    object.position.set(-37.5, 0, 35);
                    object.rotation.y = Math.PI / 2;

                    object.children[10].material[0].color.setHex(0x4C4C4C);
                    object.children[35].material[0].color.setHex(0x4C4C4C);

                    object.children[10].castShadow = true;
                    object.children[35].castShadow = true;

                    scope.scene.add(object);
                });
        });

        // Load the working desk
        new THREE.OBJLoader()
        .load("/models/table.obj", function(object) {
            object.scale.set(0.3, 0.3, 0.3);
            object.position.set(12.5, 0, 42.5);
            object.rotation.y += 0.3;

            for (var i = 0; i < object.children.length; i++) {
                object.children[i].castShadow = true;
            }

            object.children[2].material.transparent = true;
            object.children[2].material.side = THREE.DoubleSide;

            scope.scene.add(object);
        });

        new THREE.OBJLoader()
        .load("/models/chair.obj", function(object) {
            object.scale.set(0.25, 0.25, 0.25);
            object.rotateY(Math.PI + 0.2);
            object.position.set(52, 0, -33);

            for (var i = 0; i < object.children.length; i++) {
                object.children[i].castShadow = true;
            }

            scope.scene.add(object);
        });

        // Load the fire extinguisher
        new THREE.MTLLoader()
        .setPath('/models/extinguisher/')
        .load('extinguisher.mtl', function(materials) {
            materials.preload();
            new THREE.OBJLoader()
                .setMaterials(materials)
                .setPath('models/extinguisher/')
                .load('extinguisher.obj', function(object) {
                    object.scale.set(10, 10, 10);
                    object.position.set(24, 26.5, -48.5);
                    object.children[0].castShadow = true;

                    scope.scene.add(object);
                });
        });

        // Load the board
        new THREE.STLLoader()
        .load('/models/board/board.stl', function(geometry) {
            var board = new THREE.Mesh(
                geometry,
                new THREE.MeshPhongMaterial({
                    color: 0x1A1A1A
                })
            );

            new THREE.TextureLoader()
            .load("/models/board/textures/texture.jpg", function(texture) {
                var plane = new THREE.Mesh(
                    new THREE.PlaneBufferGeometry(146.5, 72.5),
                    new THREE.MeshBasicMaterial({
                        map: texture,
                        transparent: true,
                        opacity: 0.8
                    })
                );
                plane.position.set(75.5, 40, 1.5);
                board.add(plane);
    
                board.scale.set(0.3, 0.35, 0.45);
                board.rotation.y = -Math.PI / 2;
                board.position.set(49, 20, 0);
    
                scope.scene.add(board);
            });
        });

        // Load the hand
        new THREE.OBJLoader()
        .load("/models/hand.obj", function(object) {
            object.scale.set(5, 5, 5);
            object.position.set(1, -1, -0.75);
            object.rotation.set(-1, -0.45, 0.1);

            object.children[0].material.color.setHex(0xFFCD94);

            scope.camera.add(object);
            scope.scene.add(camera);
        });

        // Load the city
        new THREE.MTLLoader()
        .setPath('/models/city/center/')
        .load('city.mtl', function(materials) {
            materials.preload();
            new THREE.OBJLoader()
                .setMaterials(materials)
                .setPath('models/city/center/')
                .load('city.obj', function(object) {
                    object.scale.set(0.5, 0.5, 0.5);
                    object.position.set(-225, -535, 120);
                    object.rotation.y = -Math.PI;

                    scope.scene.add(object);
                });
        });

        new THREE.MTLLoader()
        .setPath('/models/city/')
        .load('city2.mtl', function(materials) {
            materials.preload();
            new THREE.OBJLoader()
                .setMaterials(materials)
                .setPath('models/city/')
                .load('city2.obj', function(object) {
                    object.scale.set(12, 12, 12);
                    object.position.set(1000, -550, 2100);
                    object.rotation.y = Math.PI;
                    scope.scene.add(object);
                });
        });

        // Create an ocean
        new THREE.TextureLoader()
        .load('/textures/sea.jpg', function(texture) {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.x = 15;
            texture.repeat.y = 15;

            var ocean = new THREE.Mesh(
                new THREE.PlaneBufferGeometry(8500, 8500, 100, 100),
                new THREE.MeshBasicMaterial({
                    map: texture
                })
            )

            ocean.position.y = -550;
            ocean.rotation.x = -Math.PI / 2;

            scope.scene.add(ocean);
        });

        // Create a skydome
        new THREE.TextureLoader()
        .load('/textures/sky.jpg', function(texture) {
            var skydome = new THREE.Mesh(
                new THREE.SphereBufferGeometry(4000, 100, 100),
                new THREE.MeshBasicMaterial({
                    map: texture,
                    side: THREE.BackSide
                })
            )

            scope.scene.add(skydome);
        });

        scope.scene.fog = new THREE.Fog(0xFFFFFF, 0.1, 5000);

        loadLabwareModels();
    }

    this.getLabware = function(name) {
        var labware = labware[name].clone();
        labware.traverse(function(child) {
            if (child instanceof THREE.Mesh) {
                child.material = child.material.clone();
            }
        });

        return labware;
    }

    // Internals
    var scope = this;

    var labware = {};

    // Load labware models onto the experiment desk
    function loadLabwareModels() {
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

                    scope.scene.add(object);
                });
        });

        // Load the test tube
        new THREE.OBJLoader()
        .load("/models/labware/test-tube.obj", function(object) {
            object.traverse(function(child) {
                if (child instanceof THREE.Mesh) {
                    child.material.transparent = true;
                    child.material.opacity = 0.7;
                }
            });

            var boundingBox = new THREE.Box3().setFromObject(object);
            
            var anotherTube = object.clone();
            anotherTube.add(fillLabware(boundingBox, 'test-tube', {color: 0xFF0000}));
            
            object.name = "test-tube";
            object.scale.set(3, 3, 3);
            anotherTube.scale.set(3, 3, 3);

            object.position.set(-43.0, 20.05, -26.25);
            anotherTube.position.set(-43.0, 20.05, -28.125);

            labware['test-tube'] = object;
            scope.raycastTarget.push(object);
            scope.scene.add(object);
            scope.scene.add(anotherTube);
        });

        // Load the flask
        new THREE.OBJLoader()
        .load("/models/labware/flask.obj", function(object) {
            var anotherFlask = object.clone();
            anotherFlask.position.set(-43, 20, -25);
            
            object.traverse(function(child) {
                if (child instanceof THREE.Mesh) {
                    child.material.transparent = true;
                    child.material.opacity = 0.7;
                }
            });
           
            object.name = "flask";
            object.scale.set(1.5, 1.5, 1.5);
            object.position.set(-41, 19.5, -24);

            labware['flask'] = object;
            scope.raycastTarget.push(object);
            scope.scene.add(object);
            scope.scene.add(anotherFlask);
        });

        // Load the retort and retort stand
        new THREE.OBJLoader()
        .load("/models/labware/retort-stand.obj", function(object) {
            var group = new THREE.Group;
            group.add(object);

            new THREE.OBJLoader()
            .load("/models/labware/retort.obj", function(object) {
                object.traverse(function(child) {
                    if (child instanceof THREE.Mesh) {
                        child.material.transparent = true;
                        child.material.opacity = 0.7;
                    }
                });
                
                object.name = "retort";
                group.add(object);
                group.name = "retort";
                group.scale.set(0.75, 0.75, 0.75);
                group.rotation.y = Math.PI * 3 / 4;
                group.position.set(-45, 20, -38);

                labware['retort'] = group;
                scope.raycastTarget.push(object);
                scope.scene.add(group);
            });
        });

        // Load the beaker
        new THREE.OBJLoader()
        .load("/models/labware/beaker.obj", function(object) {    
            object.traverse(function(child) {
                if (child instanceof THREE.Mesh) {
                    child.material.transparent = true;
                    child.material.opacity = 0.7;
                }
            });
           
            object.name = "beaker";
            object.scale.set(0.8, 0.8, 0.8);
            object.position.set(-40, 20, -20);

            labware['beaker'] = object;
            scope.raycastTarget.push(object);
            scope.scene.add(object);
        });
    }

    function fillLabware(boundingBox, type, chemical) {
        switch(type) {
            case 'test-tube': {
                var width = boundingBox.max.x - boundingBox.min.x;
                var height = boundingBox.max.y - boundingBox.min.y;
                var depth = boundingBox.max.z - boundingBox.min.z;
                var offsetX = (boundingBox.max.x + boundingBox.min.x) / 2;
                var offsetY = (boundingBox.max.y + boundingBox.min.y) / 2;
                var offsetZ = (boundingBox.max.z + boundingBox.min.z) / 2;

                var mergeGeometry = new THREE.Geometry();
                var geometry = new THREE.CylinderGeometry(width / 2, width / 2, height * 2 / 3, 32, 32);
                mergeGeometry.merge(geometry);
                geometry = new THREE.SphereGeometry(width / 2, 32, 32);
                geometry.translate(0, -height / 3, 0);
                mergeGeometry.merge(geometry);

                var fill = new THREE.Mesh(
                    mergeGeometry,
                    new THREE.MeshPhongMaterial({
                        color: chemical.color
                    })
                )
                fill.position.set(offsetX, offsetY - height / 6 + width / 4, offsetZ);

                return fill;
            }
        }
    }
}
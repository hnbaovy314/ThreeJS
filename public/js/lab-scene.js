LabScene = function(gui, camera, scene, renderer, controls) {

    this.camera = camera;

    this.scene = scene;

    this.renderer = renderer;

    this.controls = controls;

    this.renderer = renderer;

    this.raycastTarget = [];

    this.previewInfo = {};

    this.labwares = new Labwares(this);

    this.init = function() {
        loadScene();
        loadInteractiveAreas();
        // Load labware models
        scope.labwares.init();
    }

    this.periodicTable = new PeriodicTable(this);

    this.add = function(mesh) {
        scope.scene.add(mesh);
    }

    this.remove = function(mesh) {
        scope.scene.remove(mesh);
    }

    this.getObjectByName = function(name) {
        return scope.scene.getObjectByName(name);
    }

    this.addLabware = function(content) {
        var labwares = content.labware;
        var separation = 5;
        var totalWidth = separation * (labwares.length - 1);
        var containers = [];
        var repos = false;
        for (var i = 0; i < labwares.length; i++) {
            var container = scope.labwares.getLabware(labwares[i]);
            containers.push(container);

            var boundingBox = new THREE.Box3().setFromObject(container);
            var height = boundingBox.max.y - boundingBox.min.y;
            container.position.set(
                workAreaCoord.x,
                workAreaCoord.y + height / 2,
                workAreaCoord.z
            );

            container.position.z += totalWidth / 2 - (separation * i);

            // Add preview info
            container.contentId = labwares[i].id;
            if (container.enableInfo) {
                container.name = "container-" + i;
                scope.previewInfo[container.name] = {
                    name: labwares[i].chemical + " (" + labwares[i].formula + ")",
                    desc: "A " + labwares[i].name + " that contains " + labwares[i].chemical
                };
            }

            scope.scene.add(container);
            scope.raycastTarget.push(container);
        }

        if (content.combine) {
            for (var i = 0; i < content.combine.length; i++) {
                if (labwares[content.combine[i] - 1].target) {
                    var targetId = labwares[content.combine[i] - 1].target - 1;
                    var object = containers[content.combine[i] - 1];
                    var target = containers[targetId];

                    switch (labwares[content.combine[i] - 1].name) {
                        case 'burner': {
                            if (labwares[targetId].placed == "horizontal") {
                                var boundingBox = new THREE.Box3().setFromObject(target);
                                object.position.z = boundingBox.max.z - (boundingBox.max.z - boundingBox.min.z) / 12;
                            } else {
                                object.position.z = target.position.z;
                            }

                            repos = true;

                            break;
                        }
                        default: break;
                    }
                }
            }
        }

        if (content.stand) {
            for (var i = 0; i < content.stand.length; i++) {
                var target = containers[content.stand[i] - 1];
                var boundingBox = new THREE.Box3().setFromObject(target);
                var center = boundingBox.getCenter();

                var mergedGeometry = new THREE.Geometry();
                mergedGeometry.merge(new THREE.CylinderGeometry(0.1, 0.1, 5, 32, 32));
                var geometry = new THREE.PlaneGeometry(5, 7.5);
                geometry.rotateX(-Math.PI / 2);
                geometry.translate(0, -2.5, 2.5);
                mergedGeometry.merge(geometry);

                var stand = new THREE.Mesh(
                    mergedGeometry,
                    new THREE.MeshPhongMaterial()
                )

                target.position.y = workAreaCoord.y + 5 + (boundingBox.max.y - boundingBox.min.y) / 2;
                stand.position.x = center.x;
                stand.position.y = workAreaCoord.y + 2.5;
                stand.position.z = center.z - (boundingBox.max.z - boundingBox.min.z) / 5;

                scope.scene.add(stand);
                miscMesh.push(stand);
            }
        }

        if (content.base) {
            for (var i = 0; i < content.base.length; i++) {
                var target = containers[content.base[i] - 1];
                var boundingBox = new THREE.Box3().setFromObject(target);
                var center = boundingBox.getCenter();
                var width = boundingBox.max.x - boundingBox.min.x;
                var base = new THREE.Mesh(
                    new THREE.CylinderGeometry(width / 2, width / 2, 2, 32, 32),
                    new THREE.MeshPhongMaterial()
                )

                target.position.y = workAreaCoord.y + 2 + (boundingBox.max.y - boundingBox.min.y) / 2;
                base.position.x = center.x;
                base.position.y = workAreaCoord.y + 1;
                base.position.z = center.z;

                scope.scene.add(base);
                miscMesh.push(base);
            }
        }

        // Titillation tube
        // Temporarily fixed format: 2 objects only
        // First object is a horizontal placed tube
        // Second object maybe a normally or reversedly placed tube/flask/beaker...
        if (content.tube) {
            var firstObj = containers[content.tube[0] - 1];
            var secondObj = containers[content.tube[1] - 1];

            var firstBoundingBox = new THREE.Box3().setFromObject(firstObj);
            var firstCenter = firstBoundingBox.getCenter();
            var secondBoundingBox = new THREE.Box3().setFromObject(secondObj);
            var secondCenter = secondBoundingBox.getCenter();

            if (labwares[content.tube[1] - 1].reversed) {
                var curve = new THREE.CatmullRomCurve3([
                    new THREE.Vector3(
                        firstCenter.x,
                        firstCenter.y,
                        firstBoundingBox.min.z + (firstBoundingBox.max.z - firstBoundingBox.min.z) / 5),
                    new THREE.Vector3(
                        firstCenter.x,
                        firstCenter.y - 0.2,
                        secondBoundingBox.max.z - (secondBoundingBox.max.z - secondBoundingBox.min.z) / 12 + 0.2),
                    new THREE.Vector3(
                        secondCenter.x,
                        secondBoundingBox.min.y + (secondBoundingBox.max.y - secondBoundingBox.min.y) / 12,
                        secondBoundingBox.max.z - (secondBoundingBox.max.z - secondBoundingBox.min.z) / 6 - 0.2),
                    new THREE.Vector3(
                        secondCenter.x,
                        secondBoundingBox.min.y + (secondBoundingBox.max.y - secondBoundingBox.min.y) / 12,
                        secondCenter.z + 0.2),
                    new THREE.Vector3(
                        secondCenter.x,
                        secondCenter.y,
                        secondCenter.z)
                ]);
            } else {
                var curve = new THREE.CatmullRomCurve3([
                    new THREE.Vector3(
                        firstCenter.x,
                        firstCenter.y,
                        firstBoundingBox.min.z + (firstBoundingBox.max.z - firstBoundingBox.min.z) / 5),
                    new THREE.Vector3(
                        firstCenter.x,
                        firstCenter.y - 0.3,
                        secondCenter.z + 0.3),
                    new THREE.Vector3(
                        secondCenter.x,
                        secondBoundingBox.min.y + (secondBoundingBox.max.y - secondBoundingBox.min.y) / 12,
                        secondCenter.z)
                ]);
            }

            var geometry = new THREE.TubeGeometry(curve, 100, 0.1, 20, false);
            var material = new THREE.MeshPhongMaterial({
                color: 0x00ff00
            });
            var tube = new THREE.Mesh(geometry, material);
            scope.scene.add(tube);
            miscMesh.push(tube);
        }

        if (repos) {
            var boundingBox;
            var minZ = 50, maxZ = -50;
            for (var i = 0; i < containers.length; i++) {
                boundingBox = new THREE.Box3().setFromObject(containers[i]);
                if (boundingBox.max.z > maxZ) {
                    maxZ = boundingBox.max.z;
                }
                if (boundingBox.min.z < minZ) {
                    minZ = boundingBox.min.z;
                }
            }

            repositionLabwares((maxZ + minZ) / 2, containers);
        }

        // Create a wall for better view (temporary, because the transparency makes everything so hard to see :()
        var geometry = new THREE.PlaneBufferGeometry(8.5, 20, 32, 32);
        var material = new THREE.MeshPhongMaterial({
            side: THREE.DoubleSide,
            color: 0xBEFBFF
        });
        var wall = new THREE.Mesh(geometry, material);
        scope.scene.add(wall);
        wall.position.set(workAreaCoord.x - 4.25, workAreaCoord.y + 4.25, workAreaCoord.z);
        wall.rotation.set(-Math.PI / 2, -Math.PI / 2, 0);
        wall.name = "block-wall";
    }

    this.reset = function() {
        for (var i = scope.labwares.interactingTargets.length - 1; i >= 0; i--) {
            delete scope.previewInfo[scope.labwares.interactingTargets[i].name];
            scope.raycastTarget.pop();
        };

        for (var i = miscMesh.length - 1; i >= 0; i--) {
            scope.destroy(miscMesh[i]);
        }
        miscMesh = [];

        var wall = scope.scene.getObjectByName("block-wall");
        if (wall) {
            scope.destroy(wall);
        }
    }

    this.destroy = function(object) {
        scope.scene.remove(object);
        object.traverse(function(child) {
            if (child instanceof THREE.Mesh) {
                child.geometry.dispose();
                child.material.dispose();
            };

            if (child.name && scope.previewInfo[child.name]) {
                delete scope.previewInfo[child.name];
            }
        });

        if (object.name && scope.previewInfo[object.name]) {
            delete scope.previewInfo[object.name];
        }
    }

    this.update = function() {
        // if (scope.elementTable.enabled) {
        //     scope.elementTable.update();
        // }

        scope.controls.update();
        scope.renderer.render(scope.scene, scope.camera);
    }

    // Internals
    var scope = this;

    var workAreaCoord = {
        x: -34,
        y: 19.75,
        z: -27.5
    }

    var miscMesh = [];

    function repositionLabwares(center, containers) {
        var dist = workAreaCoord.z - center;

        for (var i = 0; i < containers.length; i++) {
            containers[i].position.z += dist;
        }

        for (var i = 0; i < miscMesh.length; i++) {
            miscMesh[i].position.z += dist;
        }

        scope.renderer.render(scene, camera);
    }

    function loadScene() {
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
        // new THREE.OBJLoader()
        // .load("/models/table.obj", function(object) {
        //     object.scale.set(0.3, 0.3, 0.3);
        //     object.position.set(12.5, 0, 42.5);
        //     object.rotation.y += 0.3;
        //
        //     for (var i = 0; i < object.children.length; i++) {
        //         object.children[i].castShadow = true;
        //     }
        //
        //     object.children[2].material.transparent = true;
        //     object.children[2].material.side = THREE.DoubleSide;
        //
        //     scope.scene.add(object);
        // });
        //
        // new THREE.OBJLoader()
        // .load("/models/chair.obj", function(object) {
        //     object.scale.set(0.25, 0.25, 0.25);
        //     object.rotateY(Math.PI + 0.2);
        //     object.position.set(52, 0, -33);
        //
        //     for (var i = 0; i < object.children.length; i++) {
        //         object.children[i].castShadow = true;
        //     }
        //
        //     scope.scene.add(object);
        // });

        // // Load the fire extinguisher
        // new THREE.MTLLoader()
        // .setPath('/models/extinguisher/')
        // .load('extinguisher.mtl', function(materials) {
        //     materials.preload();
        //     new THREE.OBJLoader()
        //         .setMaterials(materials)
        //         .setPath('models/extinguisher/')
        //         .load('extinguisher.obj', function(object) {
        //             object.scale.set(10, 10, 10);
        //             object.position.set(24, 26.5, -48.5);
        //             object.children[0].castShadow = true;
        //
        //             scope.scene.add(object);
        //         });
        // });

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

        // // Load the city
        // new THREE.MTLLoader()
        // .setPath('/models/city/center/')
        // .load('city.mtl', function(materials) {
        //     materials.preload();
        //     new THREE.OBJLoader()
        //         .setMaterials(materials)
        //         .setPath('models/city/center/')
        //         .load('city.obj', function(object) {
        //             object.scale.set(0.5, 0.5, 0.5);
        //             object.position.set(-225, -535, 120);
        //             object.rotation.y = -Math.PI;
        //
        //             scope.scene.add(object);
        //         });
        // });
        //
        // new THREE.MTLLoader()
        // .setPath('/models/city/')
        // .load('city2.mtl', function(materials) {
        //     materials.preload();
        //     new THREE.OBJLoader()
        //         .setMaterials(materials)
        //         .setPath('models/city/')
        //         .load('city2.obj', function(object) {
        //             object.scale.set(12, 12, 12);
        //             object.position.set(1000, -550, 2100);
        //             object.rotation.y = Math.PI;
        //             scope.scene.add(object);
        //         });
        // });
        //
        // // Create an ocean
        // new THREE.TextureLoader()
        // .load('/textures/sea.jpg', function(texture) {
        //     texture.wrapS = THREE.RepeatWrapping;
        //     texture.wrapT = THREE.RepeatWrapping;
        //     texture.repeat.x = 15;
        //     texture.repeat.y = 15;
        //
        //     var ocean = new THREE.Mesh(
        //         new THREE.PlaneBufferGeometry(8500, 8500, 100, 100),
        //         new THREE.MeshBasicMaterial({
        //             map: texture
        //         })
        //     )
        //
        //     ocean.position.y = -550;
        //     ocean.rotation.x = -Math.PI / 2;
        //
        //     scope.scene.add(ocean);
        // });
        //
        // // Create a skydome
        // new THREE.TextureLoader()
        // .load('/textures/sky.jpg', function(texture) {
        //     var skydome = new THREE.Mesh(
        //         new THREE.SphereBufferGeometry(4000, 100, 100),
        //         new THREE.MeshBasicMaterial({
        //             map: texture,
        //             side: THREE.BackSide
        //         })
        //     )
        //
        //     scope.scene.add(skydome);
        // });
        //
        // scope.scene.fog = new THREE.Fog(0xFFFFFF, 0.1, 5000);

        // Load labware models
        scope.labwares.init();
        loadAnimations();

        // Create Periodic Table
        scope.periodicTable.init();

    }

    function loadInteractiveAreas() {
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

                    scope.previewInfo["window"] = {
                        name: "Lab's Window",
                        desc: "Click if you want to take a closer look at the city."
                    };

                    scope.raycastTarget.push(object);
                    scope.scene.add(object);
                });
        });

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
                    scope.previewInfo["lab-desk"] = {
                        name: "Lab's Experiment Desk",
                        desc: "All experiments will be conducted here. Click to move to the desk."
                    };

                    var boundingBox = new THREE.Box3().setFromObject(object);
                    var helper = new THREE.Box3Helper(boundingBox, 0x1A1A1A);
                    helper.material.transparent = true;
                    helper.material.opacity = 0;
                    helper.name = "lab-desk-helper";
                    scope.scene.add(helper);

                    scope.raycastTarget.push(object);
                    scope.scene.add(part2);
                    scope.scene.add(object);

                    // Create a working area
                    var plane = new THREE.PlaneBufferGeometry(8.5, 20, 32, 32);
                    var geometry = new THREE.EdgesGeometry(plane);
                    var material = new THREE.LineBasicMaterial({color: 0xffffff, linewidth: 2});
                    var workArea = new THREE.LineSegments(geometry, material);
                    scope.scene.add(workArea);
                    workArea.position.set(workAreaCoord.x, workAreaCoord.y, workAreaCoord.z);
                    workArea.rotation.x = Math.PI / 2;

                    var cube = new THREE.Mesh(
                        new THREE.BoxBufferGeometry(0.2, 0.2, 0.2),
                        new THREE.MeshBasicMaterial()
                    )
                    cube.position.set(workAreaCoord.x, workAreaCoord.y, workAreaCoord.z);
                    scope.scene.add(cube);
                });
        });
    }
}

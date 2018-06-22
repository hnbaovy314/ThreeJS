LabScene = function(gui, camera, scene) {
    
    this.camera = camera;
    
    this.scene = scene;

    this.gui = gui;

    this.raycastTarget = [];

    this.previewInfo = {};

    this.labwares = new Labwares(this, gui);

    this.add = function(mesh) {
        scope.scene.add(mesh);
    }

    this.remove = function(mesh) {
        scope.scene.remove(mesh);
    }

    this.getObjectByName = function(name) {
        return scope.scene.getObjectByName(name);
    }

    this.getParticleSystem = function(name, fill) {
        var boundingBox = fill.boundingBox;
        var center = boundingBox.getCenter();

        var scale = 1;
        switch (fill.name) {
            case 'retort': {
                scale = 0.7;

                break;
            }
            default: break;
        }

        var maxX = (boundingBox.max.x - center.x) * scale;
        var minX = (boundingBox.min.x - center.x) * scale;
        var maxY = (boundingBox.max.y - center.y) * scale * 1.5;
        var minY = (boundingBox.min.y - center.y) * scale * 2;
        var maxZ = (boundingBox.max.z - center.z) * scale;
        var minZ = (boundingBox.min.z - center.z) * scale;
        
        switch (name) {
            case 'bubble': {
                new THREE.TextureLoader()
                .load("/textures/chemical/bubble.png", function(texture) {
                    // Test bubble effect (boiling?)
                    // create the particle variables
                    var particleCount = 50,
                    particles = new THREE.Geometry(),
                    pMaterial = new THREE.PointCloudMaterial({
                        map: texture,
                        size: 0.2,
                        transparent: true
                    });

                    // now create the individual particles
                    for (var p = 0; p < particleCount; p++) {
                        // create a particle with random position
                        var pX = Math.random() * (maxX - minX) + minX,
                            pY = Math.random() * (maxY - minY) + minY,
                            pZ = Math.random() * (maxZ - minZ) + minZ,
                            particle = new THREE.Vector3(pX, pY, pZ);

                        // create a velocity vector
                        particle.velocity = new THREE.Vector3(0, 0, 0);

                        // add it to the geometry
                        particles.vertices.push(particle);
                    }

                    // create the particle system
                    var particleSystem = new THREE.PointCloud(
                        particles,
                        pMaterial
                    );
                    particleSystem.boundingBox = {
                        max: {
                            x: maxX,
                            y: maxY,
                            z: maxZ
                        },
                        min: {
                            x: minX,
                            y: minY,
                            z: minZ
                        }
                    };
                    particleSystem.particleCount = 50;
                    particleSystem.position.set(
                        center.x,
                        center.y + (boundingBox.max.y - boundingBox.min.y) / 2,
                        center.z);

                    // add it to the scene
                    scope.scene.add(particleSystem);
                    particleSystems.push(particleSystem);
                })
            
                break;
            }
            default: break;
        }
    }

    this.getAnimation = function(object, name) {
        var anim = anims[name].clone();
        anim.data = anims[name].data;

        var height = (object.boundingBox.max.y - object.boundingBox.min.y) * object.scaleMultiplier;
        var width = (object.boundingBox.max.z - object.boundingBox.min.z) * object.scaleMultiplier;

        scope.scene.add(anim);
        anim.scale.set(width, width, width);
        anim.boundingBox = new THREE.Box3().setFromObject(anim);
        anim.position.set(
            object.position.x,
            object.position.y + height / 2 + (anim.boundingBox.max.y - anim.boundingBox.min.y) / 6,
            object.position.z
        );
        enabledAnims.push(anim);

        return anim;
    }

    this.addLabware = function(labwares) {
        var separation = 5;
        var totalWidth = separation * (labwares.length - 1);
        var containers = [];
        var repos = false;
        for (var i = 0; i < labwares.length; i++) {     
            var container = scope.labwares.getLabware(labwares[i]);
            containers.push(container);

            var height = container.boundingBox.max.y - container.boundingBox.min.y;
            container.position.set(
                workAreaCoord.x,
                workAreaCoord.y + height * container.scaleMultiplier / 2,
                workAreaCoord.z
            );

            container.position.z += totalWidth / 2 - (separation * i);

            // Add preview info
            container.contentId = labwares[i].id;
            if (container.enableInfo) {
                container.name = "container-" + i;
                scope.previewInfo[container.name] = {
                    name: labwares[i].chemical + " (" + labwares[i].formula + ")",
                    desc: "A " + labwares[i].name + " that contains " + labwares[i].form + " " + labwares[i].chemical
                };
            }           

            scope.scene.add(container);
            scope.raycastTarget.push(container);
        }

        var minZ = 50, maxZ = -50;
        for (var i = 0; i < labwares.length; i++) {
            if (labwares[i].with) {
                repos = true;
                var parentObject = containers[labwares[i].id - 1];
                
                switch (labwares[i].name) {
                    case 'retort': {
                        if (labwares[i].with.length > 2) {
                            console.log("Invalid input.");
                            return;
                        }

                        for (var j = 0; j < labwares[i].with.length; j++) {
                            var withObject = containers[labwares[i].with[j] - 1];
                            switch (withObject.name) {
                                case "burner": {
                                    // Get the stand of the retort
                                    var stand = parentObject.children[1];
                                    stand.boundingBox = new THREE.Box3().setFromObject(stand);
                                    var center = stand.boundingBox.getCenter();
                                    var standHeight = stand.boundingBox.max.y - stand.boundingBox.min.y;
                                    var burnerHeight = (withObject.boundingBox.max.y - withObject.boundingBox.min.y) * withObject.scaleMultiplier;
                                    var burnerWidth = (withObject.boundingBox.max.z - withObject.boundingBox.min.z) * withObject.scaleMultiplier;

                                    withObject.position.y = center.y;
                                    withObject.position.z = center.z;

                                    var platform = new THREE.Mesh(
                                        new THREE.BoxBufferGeometry(
                                            burnerWidth,
                                            (standHeight - burnerHeight) / 2,
                                            burnerWidth
                                        ),
                                        new THREE.MeshPhongMaterial({
                                            side: THREE.DoubleSide
                                        })
                                    );

                                    platform.position.x = center.x;
                                    platform.position.y = center.y - (standHeight - burnerHeight) / 4 - burnerHeight / 2;
                                    platform.position.z = center.z;

                                    scope.scene.add(platform);
                                    miscMesh.push(platform);

                                    break;
                                }
                                default: {
                                    var parentBoundingBox = new THREE.Box3().setFromObject(parentObject);
                                    var center = parentBoundingBox.getCenter();
                                    
                                    withObject.position.y = center.y;
                                    withObject.position.z = center.z - (parentBoundingBox.max.z - parentBoundingBox.min.z) / 2;
                                    withObject.rotation.x = 1.1;

                                    var withObjectBoundingBox = new THREE.Box3().setFromObject(withObject);
                                    var withObjectHeight = withObjectBoundingBox.max.y - withObjectBoundingBox.min.y;
                                    var withObjectWidth = withObjectBoundingBox.max.z - withObjectBoundingBox.min.z;

                                    // Erm... The platform pillar?
                                    var height = (parentObject.boundingBox.max.y - parentObject.boundingBox.min.y) * parentObject.scaleMultiplier;
                                    var width = (parentObject.boundingBox.max.z - parentObject.boundingBox.min.z) * parentObject.scaleMultiplier;
                                    var platform = new THREE.Mesh(
                                        new THREE.BoxBufferGeometry(
                                            withObjectWidth,
                                            (height - withObjectHeight) / 2,
                                            withObjectWidth
                                        ),
                                        new THREE.MeshPhongMaterial({
                                            side: THREE.DoubleSide
                                        })
                                    );

                                    platform.position.x = center.x;
                                    platform.position.y = center.y - (height - withObjectHeight) / 4 - withObjectHeight / 2;
                                    platform.position.z = center.z - width / 2;

                                    scope.scene.add(platform);
                                    miscMesh.push(platform);

                                    break;
                                }
                            }
                        }

                        break;
                    }
                    default: {
                        // Hmm

                        break;
                    }
                }
            }

            var boundingBox = new THREE.Box3().setFromObject(containers[labwares[i].id - 1]);
            if (boundingBox.max.z > maxZ) {
                maxZ = boundingBox.max.z;
            }
            if (boundingBox.min.z < minZ) {
                minZ = boundingBox.min.z;
            }
        }

        if (repos) {
            repositionLabwares(width, containers);
        }
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
        for (var i = 0; i < enabledAnims.length; i++) {
            if (animReady) {
                animReady = false;
                anim = enabledAnims[i].data;
                
                var img = new Image();
                img.onload = function() {
                    anim.ctx.clearRect(0, 0, anim.canvas.width, anim.canvas.height);
                    anim.ctx.drawImage(img, 0, 0);
                    anim.texture.needsUpdate = true;
                }
                img.src = anim.src + anim.frame + anim.format;
                anim.frame++;

                if (anim.frame > anim.maxFrame) {
                    anim.frame = 1;
                }

                setTimeout(function() {
                    img = null;
                    animReady = true;
                }, 50);
            }
        }

        if (particleSystems.length > 0) {
            // Update particle systems
            var pCount = particleSystems[0].particleCount;
            while (pCount--) {
                // get the particle
                var particle = particleSystems[0].geometry.vertices[pCount];

                // check if we need to reset
                if (particle.y > particleSystems[0].boundingBox.max.y) {
                    particle.y = particleSystems[0].boundingBox.min.y;
                    particle.y = 0;
                }

                // update the velocity with
                // a splat of randomniz
                particle.velocity.y += Math.random() * 0.1;

                // and the position
                // particle.x += particle.velocity.x;
                particle.y += 0.01;
                // particle.z += particle.velocity.z;
            }

            particleSystems[0].geometry.verticesNeedUpdate = true;
        }
    }

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

                    scope.previewInfo["window"] = {
                        name: "Lab's Window",
                        desc: "Click if you want to take a closer look at the city."
                    };

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

        // Load labware models
        scope.labwares.init();
        loadAnimations();
    }

    // Internals
    var scope = this;

    var workAreaCoord = {
        x: -34,
        y: 19.75,
        z: -27.5
    }

    var miscMesh = [];

    var anims = {}, enabledAnims = [], animReady = true;

    var particleSystems = [];

    function repositionLabwares(width, containers) {
        for (var i = 0; i < containers.length; i++) {
            containers[i].position.z -= width / 2;
        }

        for (var i = 0; i < miscMesh.length; i++) {
            miscMesh[i].position.z -= width / 2;
        }
    }

    function loadAnimations() {
        // Flame animation
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');

        canvas.width = 528;
        canvas.height = 528;

        var texture = new THREE.Texture(canvas);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        var material = new THREE.MeshBasicMaterial({
            map: texture,
            overdraw: 0.5,
            side: THREE.DoubleSide,
            transparent: true
        });

        var anim = new THREE.Mesh(
            new THREE.PlaneGeometry(1, 1), 
            material
        );

        var data = {
            src: "/anim/flame/",
            canvas: canvas,
            ctx: ctx,
            texture: texture,
            frame: 1,
            maxFrame: 6,
            format: '.png'
        }
        anim.rotation.y = Math.PI / 2;

        anim.data = data;
        anims["flame"] = anim;
    }
}
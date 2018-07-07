Animation = function(labGuide) {

    this.labGuide = labGuide;

    this.scene = labGuide.labScene.scene;
    
    this.camera = labGuide.labScene.camera;

    this.controls = labGuide.labScene.controls;

    this.labwares = labGuide.labScene.labwares;

    this.init = function() {
        loadAnimation();
    }

    this.getParticleSystem = function(name, object) {
        var boundingBox = new THREE.Box3().setFromObject(object);
        var center = boundingBox.getCenter();

        var scale = 1;
        switch (object.container) {
            case 'test-tube': {
                scale = 0.7;

                break;
            }
            case 'flask': {
                scale = 0.5;

                break;
            }
            case 'beaker': {
                scale = 0.4;

                break;
            }
            case 'retort': {
                scale = 0.7;

                break;
            }
            default: break;
        }

        var maxX = (boundingBox.max.x - center.x) * scale;
        var minX = (boundingBox.min.x - center.x) * scale;
        var maxY = (boundingBox.max.y - center.y) * scale;
        var minY = (boundingBox.min.y - center.y) * scale;
        var maxZ = (boundingBox.max.z - center.z) * scale;
        var minZ = (boundingBox.min.z - center.z) * scale;
        
        switch (name) {
            case 'verticle-bubble': {
                new THREE.TextureLoader()
                .load("/textures/chemical/bubble.png", function(texture) {
                    // Test bubble effect (boiling?)
                    // create the particle variables
                    var particleCount = 50,
                    particles = new THREE.Geometry(),
                    pMaterial = new THREE.PointCloudMaterial({
                        map: texture,
                        size: (boundingBox.max.x - boundingBox.min.x) * 0.25 * scale,
                        transparent: true,
                        // depthWrite: false
                    });

                    // now create the individual particles
                    for (var p = 0; p < particleCount; p++) {
                        // create a particle with random position
                        var pX = Math.random() * (maxX - minX) + minX,
                            pY = Math.random() * (maxY - minY) + minY,
                            pZ = Math.random() * (maxZ - minZ) + minZ,
                            particle = new THREE.Vector3(pX, pY, pZ);

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
                    particleSystem.particleCount = particleCount;
                    particleSystem.position.set(
                        center.x,
                        center.y -= (boundingBox.max.y - boundingBox.min.y) / 2,
                        center.z
                    );

                    particleSystem.updateFunc = function(pSystem) {
                        var pCount = pSystem.particleCount;
                        while (pCount--) {
                            // get the particle
                            var particle = pSystem.geometry.vertices[pCount];
            
                            // check if we need to reset
                            if (particle.y > pSystem.boundingBox.max.y) {
                                particle.y = pSystem.boundingBox.min.y;
                                // particle.y = 0;
                            }
            

                            // and the position
                            particle.y += 0.01;
                        }
            
                        pSystem.geometry.verticesNeedUpdate = true;
                    }

                    // add it to the scene
                    scope.scene.add(particleSystem);
                    particleSystems.push(particleSystem);
                })
            
                break;
            }
            case 'exo-bubble': {
                var cubeBoundingBox = new THREE.Box3().setFromObject(object.cube);
                var cubeCenter = cubeBoundingBox.getCenter();

                new THREE.TextureLoader()
                .load("/textures/chemical/bubble.png", function(texture) {
                    var particleCount = 100,
                    particles = new THREE.Geometry(),
                    pMaterial = new THREE.PointCloudMaterial({
                        map: texture,
                        size: (boundingBox.max.x - boundingBox.min.x) * 0.2 * scale,
                        transparent: true,
                        // depthWrite: false
                        depthTest: false
                    });

                    for (var p = 0; p < particleCount; p++) {
                        var pX = 0,
                            pY = 0,
                            pZ = 0,
                            particle = new THREE.Vector3(pX, pY, pZ);

                        particle.velocity = {
                            x: (Math.random() - 0.5) / 20,
                            y: ((Math.random() - 1) / 2) / 20,
                            z: (Math.random() - 0.5) / 20
                        }

                        particles.vertices.push(particle);
                    }

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

                    particleSystem.particleCount = particleCount;
                    particleSystem.position.set(
                        cubeCenter.x,
                        cubeCenter.y,
                        cubeCenter.z
                    );

                    particleSystem.updateFunc = function(pSystem) {
                        var pCount = pSystem.particleCount;
                        while (pCount--) {
                            var particle = pSystem.geometry.vertices[pCount];
            
                            if (particle.x > pSystem.boundingBox.max.x || particle.x < pSystem.boundingBox.min.x) {
                                particle.x = 0;
                                particle.y = 0;
                                particle.z = 0;
                            }

                            if (particle.y > pSystem.boundingBox.max.y || particle.y < pSystem.boundingBox.min.y + 0.2) {
                                particle.x = 0;
                                particle.y = 0;
                                particle.z = 0;
                            }

                            if (particle.z > pSystem.boundingBox.max.z || particle.z < pSystem.boundingBox.min.z) {
                                particle.x = 0;
                                particle.y = 0;
                                particle.z = 0;
                            }

                            particle.x += particle.velocity.x;
                            particle.y += particle.velocity.y;
                            particle.z += particle.velocity.z;
                        }
            
                        pSystem.geometry.verticesNeedUpdate = true;
                    }

                    // add it to the scene
                    scope.scene.add(particleSystem);
                    particleSystems.push(particleSystem);      
                });
                
                break;
            }
            case "smoke": {
                new THREE.TextureLoader()
                .load("/textures/chemical/smoke.png", function(texture) {
                    var particleCount = 200,
                    particles = new THREE.Geometry(),
                    pMaterial = new THREE.PointCloudMaterial({
                        map: texture,
                        size: 2,
                        transparent: true,
                        depthWrite: false,
                        // depthTest: false
                    });

                    for (var p = 0; p < particleCount; p++) {
                        var pX = 0,
                            pY = 0,
                            pZ = 0,
                            particle = new THREE.Vector3(pX, pY, pZ);

                        particle.velocity = {
                            x: (Math.random() - 0.5) / 100,
                            y: (Math.random() - 0.5) / 20,
                            z: (Math.random() - 0.5) / 100
                        }

                        particles.vertices.push(particle);
                    }

                    var particleSystem = new THREE.PointCloud(
                        particles,
                        pMaterial
                    );

                    particleSystem.boundingBox = {
                        max: {
                            x: maxX * 5,
                            y: maxY * 25,
                            z: maxZ * 5
                        },
                        min: {
                            x: minX * 5,
                            y: minY,
                            z: minZ * 5
                        }
                    };

                    particleSystem.particleCount = particleCount;
                    particleSystem.position.set(
                        center.x,
                        center.y,
                        center.z
                    );

                    particleSystem.updateFunc = function(pSystem) {
                        var pCount = pSystem.particleCount;
                        while (pCount--) {
                            var particle = pSystem.geometry.vertices[pCount];

                            if ((particle.x > maxX || particle.x < minX) && particle.y < maxY) {
                                particle.x = 0;
                                particle.y = 0;
                                particle.z = 0;
                            }

                            if ((particle.z > maxZ || particle.z < minZ) && particle.y < maxY) {
                                particle.x = 0;
                                particle.y = 0;
                                particle.z = 0;
                            }
            
                            if (particle.x > pSystem.boundingBox.max.x || particle.x < pSystem.boundingBox.min.x) {
                                particle.x = 0;
                                particle.y = 0;
                                particle.z = 0;
                            }

                            if (particle.y > pSystem.boundingBox.max.y || particle.y < pSystem.boundingBox.min.y) {
                                particle.x = 0;
                                particle.y = 0;
                                particle.z = 0;
                            }

                            if (particle.z > pSystem.boundingBox.max.z || particle.z < pSystem.boundingBox.min.z) {
                                particle.x = 0;
                                particle.y = 0;
                                particle.z = 0;
                            }

                            particle.x += particle.velocity.x;
                            particle.y += particle.velocity.y;
                            particle.z += particle.velocity.z;
                        }
            
                        pSystem.geometry.verticesNeedUpdate = true;
                    }

                    // add it to the scene
                    scope.scene.add(particleSystem);
                    particleSystems.push(particleSystem);
                });

                break;
            }
            case "flare": {
                if (!object.cube) {
                    break;
                }

                // Flame
                object.cube.boundingBox = new THREE.Box3().setFromObject(object.cube);
                object.cube.scaleMultiplier = object.scaleMultiplier * 2;
                var cubeBoundingBox = object.cube.boundingBox;
                var cubeCenter = cubeBoundingBox.getCenter();

                scope.getEffectAnimation(object.cube, 'flame', object.cube.boundingBox.getCenter());

                // Light
                var light = new THREE.PointLight(0xE25822, 1.5, 2.5);
                light.position.set(
                    cubeCenter.x,
                    cubeCenter.y + (cubeBoundingBox.max.y - cubeBoundingBox.min.y),
                    cubeCenter.z
                );
                scope.scene.add(light);
                flameLights.push(light);

                // Flare
                var flareTexture;
                new THREE.TextureLoader()
                .load("/textures/chemical/red-flare.png", function(texture) {
                    flareTexture = texture;

                    var particleCount = 50,
                    particles = new THREE.Geometry(),
                    pMaterial = new THREE.PointCloudMaterial({
                        map: texture,
                        size: (boundingBox.max.x - boundingBox.min.x) * 0.5 * scale,
                        transparent: true,
                        // depthWrite: false
                    });

                    for (var p = 0; p < particleCount; p++) {
                        var pX = 0,
                            pY = 0,
                            pZ = 0,
                            particle = new THREE.Vector3(pX, pY, pZ);

                        particle.velocity = {
                            x: (Math.random() - 0.5) / 10,
                            y: (Math.random() - 0.5) / 10,
                            z: (Math.random() - 0.5) / 10
                        }

                        particles.vertices.push(particle);
                    }

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

                    particleSystem.particleCount = particleCount;
                    particleSystem.position.set(
                        cubeCenter.x,
                        cubeCenter.y,
                        cubeCenter.z
                    );

                    particleSystem.updateFunc = function(pSystem) {
                        var pCount = pSystem.particleCount;
                        while (pCount--) {
                            var particle = pSystem.geometry.vertices[pCount];
            
                            if (particle.x > pSystem.boundingBox.max.x || particle.x < pSystem.boundingBox.min.x) {
                                particle.x = 0;
                                particle.y = 0;
                                particle.z = 0;
                            }

                            if (particle.y > pSystem.boundingBox.max.y || particle.y < pSystem.boundingBox.min.y) {
                                particle.x = 0;
                                particle.y = 0;
                                particle.z = 0;
                            }

                            if (particle.z > pSystem.boundingBox.max.z || particle.z < pSystem.boundingBox.min.z) {
                                particle.x = 0;
                                particle.y = 0;
                                particle.z = 0;
                            }

                            particle.x += particle.velocity.x;
                            particle.y += particle.velocity.y;
                            particle.z += particle.velocity.z;
                        }
            
                        pSystem.geometry.verticesNeedUpdate = true;
                    }

                    // add it to the scene
                    setTimeout(function() {
                        scope.scene.add(particleSystem);
                        particleSystems.push(particleSystem);      
                    }, 2000);

                    // Lensflare
                    var lensflare = new THREE.Lensflare();
                    lensflare.addElement(new THREE.LensflareElement(flareTexture, 256, 0));
                    light.add(lensflare);
                });
                
                break;
            }
            default: break;
        }
    }

    this.getEffectAnimation = function(object, name, position) {
        var anim = anims[name].clone();
        anim.data = anims[name].data;

        var height = (object.boundingBox.max.y - object.boundingBox.min.y) * object.scaleMultiplier;
        var width = (object.boundingBox.max.z - object.boundingBox.min.z) * object.scaleMultiplier;

        scope.scene.add(anim);
        anim.scale.set(width, width, width);
        anim.boundingBox = new THREE.Box3().setFromObject(anim);
        anim.position.set(
            position.x,
            position.y + height / 2 + (anim.boundingBox.max.y - anim.boundingBox.min.y) / 6,
            position.z
        );
        enabledAnims.push(anim);

        return anim;
    }

    this.getInteractiveAnimation = function(name, object) {
        var hand = camera.children[1];

        switch (name) {
            case 'pick-up': {
                pickUp(hand, object);
                break;
            }
            case 'drop': {
                drop(hand, object);
                break;
            }
            case 'pour': {
                pour(hand, object);             
                break;
            }
            case "clean": {
                clean(hand, object);
                break;
            }
            case "light-burner": {
                lightBurner(hand, object);
                break;
            }
            case "use-tongs": {
                useTongs(hand, object);
                break;
            }
            default: break;
        }
    }

    this.reset = function() {
        for (var i = enabledAnims.length - 1; i >= 0; i--) {
            scope.labGuide.labScene.destroy(enabledAnims[i]);
        }
        enabledAnims = [];

        for (var i = particleSystems.length - 1; i >= 0; i--) {
            scope.labGuide.labScene.destroy(particleSystems[i]);
        }
        particleSystems = [];

        for (var i = flameLights.length - 1; i >= 0; i--) {
            if (flameLights[i].children[flameLights[i].children.length - 1] instanceof THREE.Lensflare) {
                flameLights[i].children[flameLights[i].children.length - 1].dispose();
            }

            if (flameLights[i].shadow && flameLights[i].shadow.map) {
				flameLights[i].shadow.map.dispose();
            }
            
            scope.labGuide.labScene.remove(flameLights[i]);
        }
        flameLights = [];
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

        for (var i = 0; i < particleSystems.length; i++) {
            particleSystems[i].updateFunc(particleSystems[i]);
        }

        for (var i = 0; i < flameLights.length; i++) {
            var value = (Math.sin(new Date().getTime() * 0.01) + 1) / 2 + 0.5;
            flameLights[i].intensity = value;
        }
    }

    // Internals

    var scope = this;
    
    var anims = {}, enabledAnims = [], animReady = true;

    var particleSystems = [];

    var flameLights = [];

    function loadAnimation() {
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
            transparent: true,
            depthWrite: false,
            depthTest: false
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

    function pickUp(hand, object) {
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

        THREE.SceneUtils.detach(hand, camera, scene);
        hand.rotation.x = -2.1;
        hand.rotation.y = -0.35;

        var pickUpPos = {
            x: object.position.x,
            y: object.position.y,
            z: object.position.z
        }
        new TWEEN.Tween(hand.position)
        .to({x: pickUpPos.x, y: pickUpPos.y, z: pickUpPos.z}, 400)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onComplete(function() {
            THREE.SceneUtils.attach(object, scene, hand);
            THREE.SceneUtils.attach(hand, scene, camera);

            object.position.x -= 0.05;
            object.position.y += 0.05;

            new TWEEN.Tween(hand.position)
            .to({x: oldPos.x, y: oldPos.y, z: oldPos.z}, 400)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();

            new TWEEN.Tween(hand.rotation)
            .to({x: -1.7, y: 0.7, z: oldRotation.z}, 400)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onComplete(function() {
                scope.labGuide.nextInteractiveStep();
            })
            .start();
        })
        .start();
    }

    function drop(hand, object) {
        var tool = hand.children[1];

        var objBoundingBox = new THREE.Box3().setFromObject(object);

        var oldPos = {
            x: hand.position.x,
            y: hand.position.y,
            z: hand.position.z
        };

        var objPos = {
            x: object.position.x + (objBoundingBox.max.x - objBoundingBox.min.x) / 3 ,
            y: object.position.y + (objBoundingBox.max.y - objBoundingBox.min.y) / 2 + 2,
            z: object.position.z - (objBoundingBox.max.z - objBoundingBox.min.z) / 1.5,
        }

        THREE.SceneUtils.detach(hand, scope.camera, scope.scene);
        hand.rotation.set(-1.9, 0.16, 2.2);

        new TWEEN.Tween(hand.position)
        .to({x: objPos.x, y: objPos.y, z: objPos.z}, 400)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onComplete(function() {
            new TWEEN.Tween(hand.position)
            .to({y: objPos.y - 3}, 400)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onComplete(function() {
                if (tool) {
                    if (tool.name == "tongs") {
                        var chemical = tool.children[tool.children.length - 1];
                        if (chemical) {
                            THREE.SceneUtils.detach(chemical, tool, scope.scene);
                            chemical.position.y = objBoundingBox.min.y + 0.4;
                            THREE.SceneUtils.attach(chemical, scope.scene, object);
                        }
                    }
                };

                new TWEEN.Tween(hand.position)
                .to({y: objPos.y}, 400)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onComplete(function() {
                    if (tool) {
                        hand.remove(tool);
                        scope.labGuide.labScene.destroy(tool);
                    }

                    THREE.SceneUtils.attach(hand, scope.scene, scope.camera);                  

                    new TWEEN.Tween(hand.position)
                    .to({x: oldPos.x, y: oldPos.y, z: oldPos.z}, 400)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .onComplete(function() {
                        scope.labGuide.resetToEmptyHand();
                        scope.labGuide.nextInteractiveStep();
                    })
                    .start();
                })
                .start();
            })
            .start();
        })
        .start();
    }

    function pour(hand, object) {
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
            x: object.position.x,
            y: object.position.y + (object.boundingBox.max.y - object.boundingBox.min.y) * object.scaleMultiplier / 2 + 2,
            z: object.position.z - (hand.children[1].boundingBox.max.y - hand.children[1].boundingBox.min.y) / 2 - 0.5
        }

        THREE.SceneUtils.detach(hand, scope.camera, scope.scene);

        new TWEEN.Tween(hand.position)
        .to({x: pourPos.x, y: pourPos.y, z: pourPos.z}, 400)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onComplete(function() {
            new TWEEN.Tween(hand.rotation)
            .to({x: -0.9, y: 0.25, z: 1.8}, 400)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onComplete(function() {
                THREE.SceneUtils.attach(hand, scope.scene, scope.camera);

                new TWEEN.Tween(hand.position)
                .to({x: oldPos.x, y: oldPos.y, z: oldPos.z}, 400)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();

                new TWEEN.Tween(hand.rotation)
                .to({x: oldRotation.x, y: oldRotation.y, z: oldRotation.z}, 400)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onComplete(function() {
                    scope.labGuide.nextInteractiveStep();
                })
                .start();
            })
            .start();
        })
        .start();
    }

    function clean(hand, object) {
        object.boundingBox = object.boundingBox;
        object.scaleMultiplier = object.scaleMultiplier; 
        object.scale.set(object.scaleMultiplier / 2, object.scaleMultiplier / 2, object.scaleMultiplier / 2);
        var dustpan = scope.labwares.getUtils("dustpan");
        
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
        scope.scene.add(dustpan);
        
        scope.labGuide.resetToEmptyHand();
        var oldPos = {
            x: hand.position.x,
            y: hand.position.y,
            z: hand.position.z
        }
        THREE.SceneUtils.detach(hand, scope.camera, scope.scene);
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
            THREE.SceneUtils.attach(hand, scope.scene, brush);
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
                            THREE.SceneUtils.attach(object, scope.scene, dustpan);
                            object.position.x = 75;

                            THREE.SceneUtils.attach(dustpan, scope.scene, scope.camera);

                            new TWEEN.Tween(dustpan.position)
                            .to({
                                x: oldPos.x,
                                y: oldPos.y,
                                z: oldPos.z
                            }, 400)
                            .start();

                            new TWEEN.Tween(scope.controls.target)
                            .to({x: -24.995, y: 27.499, z: -27.01}, 700)
                            .onComplete(function() {
                                THREE.SceneUtils.detach(dustpan, scope.camera, scope.scene);
                                dustpan.rotation.y = 0.45;

                                new TWEEN.Tween(dustpan.position)
                                .to({
                                    x: -12.5,
                                    y: 15,
                                    z: -42.5
                                }, 400)
                                .onComplete(function() {
                                    THREE.SceneUtils.detach(hand, brush, scope.scene);
                                    THREE.SceneUtils.attach(hand, scope.scene, scope.camera);
                                    scope.labGuide.resetToEmptyHand();
                                    scope.labGuide.labScene.destroy(dustpan);

                                    new TWEEN.Tween(scope.controls.target)
                                    .to({x: -25.01, y: 27.5, z: -27}, 400)
                                    .start();

                                    scope.labGuide.nextInteractiveStep();
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
    }

    function lightBurner(hand, object) {
        var oldPos = {
            x: hand.position.x,
            y: hand.position.y,
            z: hand.position.z
        };

        THREE.SceneUtils.detach(hand, scope.camera, scope.scene);

        var objPos = {
            x: object.position.x,
            y: object.position.y,
            z: object.position.z
        }
        new TWEEN.Tween(hand.position)
        .to({x: objPos.x, y: objPos.y, z: objPos.z}, 400)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onComplete(function() {
            THREE.SceneUtils.attach(hand, scope.scene, scope.camera);

            scope.getEffectAnimation(object, "flame", object.position);

            new TWEEN.Tween(hand.position)
            .to({x: oldPos.x, y: oldPos.y, z: oldPos.z}, 400)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onComplete(function() {
                scope.labGuide.nextInteractiveStep();
            })
            .start();
        })
        .start();
    }

    function useTongs(hand, object) {
        var tongs = scope.labwares.getNonInteractiveLabware('tongs');
        hand.add(tongs);

        tongs.position.set(-0.03, 0.035, -0.007);
        tongs.rotation.set(0.7, -1.6, 0.8);
        tongs.scale.set(tongs.scaleMultiplier / hand.scaleMultiplier, tongs.scaleMultiplier / hand.scaleMultiplier, tongs.scaleMultiplier / hand.scaleMultiplier);

        var tongsBoundingBox = new THREE.Box3().setFromObject(object);
        var objBoundingBox = new THREE.Box3().setFromObject(object);

        var oldPos = {
            x: hand.position.x,
            y: hand.position.y,
            z: hand.position.z
        };

        var objPos = {
            x: object.position.x + (objBoundingBox.max.x - objBoundingBox.min.x) / 2 ,
            y: object.position.y + (objBoundingBox.max.y - objBoundingBox.min.y) / 2 + 2,
            z: object.position.z - (objBoundingBox.max.z - objBoundingBox.min.z) / 2,
        }

        THREE.SceneUtils.detach(hand, scope.camera, scope.scene);
        hand.rotation.set(-1.9, 0.16, 1);

        new TWEEN.Tween(hand.position)
        .to({x: objPos.x, y: objPos.y, z: objPos.z}, 400)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onComplete(function() {
            new TWEEN.Tween(hand.position)
            .to({y: objPos.y - 3}, 400)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onComplete(function() {
                var material = new THREE.MeshBasicMaterial();
                var fill = object.children[object.children.length - 1];
                if (fill.material.map) {
                    material.map = fill.material.map;
                }

                var cube = new THREE.Mesh(
                    new THREE.BoxGeometry(0.5, 0.5, 0.5),
                    material
                );

                hand.children[1].add(cube);
                cube.scale.set(1 / hand.scaleMultiplier, 1 / hand.scaleMultiplier, 1 / hand.scaleMultiplier);
                cube.position.x += (tongsBoundingBox.max.x - tongs.boundingBox.min.x) / (hand.scaleMultiplier * tongs.scaleMultiplier);

                new TWEEN.Tween(hand.position)
                .to({y: objPos.y}, 400)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onComplete(function() {
                    THREE.SceneUtils.attach(hand, scope.scene, scope.camera);
                    
                    new TWEEN.Tween(hand.rotation)
                    .to({x: -1, y: 0.18, z: -0.2}, 400)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .start();

                    new TWEEN.Tween(hand.position)
                    .to({x: oldPos.x, y: oldPos.y, z: oldPos.z}, 400)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .onComplete(function() {
                        scope.labGuide.nextInteractiveStep();
                    })
                    .start();
                })
                .start();
            })
            .start();
        })
        .start();
    }

    function useEyeDropper(hand, object) {
        var eyedropper = scope.labwares.getNonInteractiveLabware('eyedropper');
        hand.add(eyedropper);

        eyedropper.position.set(-0.03, 0.035, -0.007);
        eyedropper.rotation.set(-1.9, 0.15, -0.02);
        eyedropper.scale.set(eyedropper.scaleMultiplier / hand.scaleMultiplier, eyedropper.scaleMultiplier / hand.scaleMultiplier, eyedropper.scaleMultiplier / hand.scaleMultiplier);

        hand.rotation.set(-1.2, 0.11, 0);
    }

    function useStirringRod() {

    }
}
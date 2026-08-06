  function buildPillar(radius, height) {
    var group = new THREE.Group();

    var base = new THREE.Mesh(
      new THREE.BoxGeometry(radius * 3.2, 0.4, radius * 3.2),
      basaltMat,
    );
    base.position.y = 0.2;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    var basePlinth = new THREE.Mesh(
      new THREE.BoxGeometry(radius * 2.6, 0.3, radius * 2.6),
      basaltMat,
    );
    basePlinth.position.y = 0.55;
    basePlinth.castShadow = true;
    basePlinth.receiveShadow = true;
    group.add(basePlinth);

    var neckLow = new THREE.Mesh(
      new THREE.TorusGeometry(radius * 0.95, radius * 0.09, 5, 12),
      goldMat,
    );
    neckLow.rotation.x = Math.PI / 2;
    neckLow.position.y = 0.74;
    neckLow.castShadow = true;
    group.add(neckLow);

    var shaftGeo = flutedColumnGeometry(
      radius,
      radius * 0.82,
      height,
      8,
      12,
      8,
      radius * 0.16,
    );
    var shaft = new THREE.Mesh(shaftGeo, basaltMat);
    shaft.position.y = 0.9 + height / 2;
    shaft.castShadow = true;
    shaft.receiveShadow = true;
    group.add(shaft);

    var neckHigh = new THREE.Mesh(
      new THREE.TorusGeometry(radius * 0.82, radius * 0.09, 5, 12),
      goldMat,
    );
    neckHigh.rotation.x = Math.PI / 2;
    neckHigh.position.y = 0.9 + height + 0.05;
    neckHigh.castShadow = true;
    group.add(neckHigh);

    var capitalCore = new THREE.Mesh(
      new THREE.CylinderGeometry(radius * 1.4, radius * 0.82, 0.45, 10),
      goldMat,
    );
    capitalCore.position.y = 0.9 + height + 0.35;
    capitalCore.castShadow = true;
    capitalCore.receiveShadow = true;
    group.add(capitalCore);

    var abacus = new THREE.Mesh(
      new THREE.BoxGeometry(radius * 3.6, 0.34, radius * 3.6),
      basaltMat,
    );
    abacus.position.y = 0.9 + height + 0.75;
    abacus.castShadow = true;
    abacus.receiveShadow = true;
    group.add(abacus);

    var abacusTrim = wireMesh(
      new THREE.BoxGeometry(radius * 3.6, 0.34, radius * 3.6),
      GOLD,
      0.5,
    );
    abacusTrim.position.y = abacus.position.y;
    group.add(abacusTrim);

    var capRoof = new THREE.Mesh(
      new THREE.ConeGeometry(radius * 2.0, radius * 1.3, 4),
      goldMat,
    );
    capRoof.rotation.y = Math.PI / 4;
    capRoof.position.y = abacus.position.y + 0.17 + radius * 0.65;
    capRoof.castShadow = true;
    capRoof.receiveShadow = true;
    group.add(capRoof);

    var capRoofTrim = wireMesh(
      new THREE.ConeGeometry(radius * 2.0, radius * 1.3, 4),
      GOLD,
      0.55,
    );
    capRoofTrim.position.copy(capRoof.position);
    capRoofTrim.rotation.copy(capRoof.rotation);
    group.add(capRoofTrim);

    var capFinial = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 0.32, 6, 5),
      goldMat,
    );
    capFinial.position.y = capRoof.position.y + radius * 0.65 + radius * 0.28;
    capFinial.castShadow = true;
    group.add(capFinial);

    placeFoliageCluster(
      new THREE.Vector3(radius * 1.2, abacus.position.y - 0.1, radius * 1.2),
      group,
    );
    placeFoliageCluster(
      new THREE.Vector3(-radius * 1.2, abacus.position.y - 0.1, -radius * 1.2),
      group,
    );

    return group;
  }

  var forecourtY = -2.18;
  var forecourt = new THREE.Mesh(
    new THREE.BoxGeometry(13.6, 0.36, 5.2),
    basaltMat,
  );
  forecourt.position.set(0, forecourtY, 2.9);
  forecourt.castShadow = true;
  forecourt.receiveShadow = true;
  scene.add(forecourt);
  var forecourtTrim = wireMesh(
    new THREE.BoxGeometry(13.6, 0.36, 5.2),
    GOLD,
    0.3,
  );
  forecourtTrim.position.copy(forecourt.position);
  scene.add(forecourtTrim);

  var forecourtStandY = forecourtY + 0.18;
  var pillarGroundY = -5.0;
  var pillarHeight = 7.4;

  var pillarL = buildPillar(0.4, pillarHeight);
  pillarL.position.set(-5.6, pillarGroundY, 1.4);
  scene.add(pillarL);

  var pillarR = buildPillar(0.4, pillarHeight);
  pillarR.position.set(5.6, pillarGroundY, 1.4);
  scene.add(pillarR);

  function createPedestalAnchor(x, z) {
    var group = new THREE.Group();
    var baseTier = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.6, 2.4),
      basaltMat,
    );
    baseTier.position.set(0, 0.3, 0);
    baseTier.castShadow = true;
    baseTier.receiveShadow = true;
    group.add(baseTier);

    var midTier = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.5, 1.8),
      basaltMat,
    );
    midTier.position.set(0, 0.85, 0);
    midTier.castShadow = true;
    midTier.receiveShadow = true;
    group.add(midTier);

    var topCap = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.2, 1.4), goldMat);
    topCap.position.set(0, 1.2, 0);
    topCap.castShadow = true;
    group.add(topCap);

    group.position.set(x, pillarGroundY, z);
    return group;
  }

  scene.add(createPedestalAnchor(-5.6, 1.4));
  scene.add(createPedestalAnchor(5.6, 1.4));


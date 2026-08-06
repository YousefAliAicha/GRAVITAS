var animatedFoliage = [];

function placeFoliageCluster(anchorPos, parentGroup) {
  var cluster = new THREE.Group();
  cluster.position.copy(anchorPos);

  var count = IS_MOBILE
    ? 1 + Math.floor(Math.random() * 2)
    : 3 + Math.floor(Math.random() * 3);

  for (var i = 0; i < count; i++) {
    var vineGroup = new THREE.Group();

    var vineLen = 0.3 + Math.random() * 0.45;
    var mat =
      Math.random() < 0.22
        ? foliageMatGold
        : Math.random() < 0.5
          ? foliageMatA
          : foliageMatB;

    var stemGeo = new THREE.CylinderGeometry(0.008, 0.03, vineLen, 3);
    stemGeo.translate(0, -vineLen / 2, 0);
    var stem = new THREE.Mesh(stemGeo, mat);
    stem.castShadow = false;
    vineGroup.add(stem);

    var leafCount = IS_MOBILE ? 1 : 2;
    for (var l = 0; l < leafCount; l++) {
      var leafY = -vineLen * (0.25 + (l / leafCount) * 0.68);
      var leafSize = 0.07 + Math.random() * 0.08;
      var leafGeo = new THREE.IcosahedronGeometry(leafSize, 0);
      var leaf = new THREE.Mesh(leafGeo, mat);
      leaf.scale.set(1.0, 1.7, 0.35);
      leaf.position.set(
        (Math.random() - 0.5) * 0.06,
        leafY,
        (Math.random() - 0.5) * 0.06,
      );
      leaf.rotation.set(
        Math.random() * 0.4,
        Math.random() * Math.PI * 2,
        Math.random() * 0.4,
      );
      leaf.castShadow = false;
      vineGroup.add(leaf);
    }

    vineGroup.position.set(
      (Math.random() - 0.5) * 0.22,
      -(Math.random() * 0.04),
      (Math.random() - 0.5) * 0.12,
    );

    var initRotX = 0.12 + Math.random() * 0.2;
    var initRotZ = (Math.random() - 0.5) * 0.25;
    vineGroup.rotation.set(initRotX, Math.random() * Math.PI, initRotZ);

    cluster.add(vineGroup);

    animatedFoliage.push({
      group: vineGroup,
      baseRotX: initRotX,
      baseRotZ: initRotZ,
      phase: Math.random() * Math.PI * 2,
      speed: 1.1 + Math.random() * 1.4,
      ampX: 0.035 + Math.random() * 0.045,
      ampZ: 0.025 + Math.random() * 0.035,
    });
  }

  if (parentGroup) {
    parentGroup.add(cluster);
  } else {
    scene.add(cluster);
  }
  return cluster;
}

function tickFoliage(timeSec) {
  for (var i = 0; i < animatedFoliage.length; i++) {
    var f = animatedFoliage[i];
    f.group.rotation.x =
      f.baseRotX + Math.sin(timeSec * f.speed + f.phase) * f.ampX;
    f.group.rotation.z =
      f.baseRotZ + Math.cos(timeSec * f.speed * 0.85 + f.phase) * f.ampZ;
  }
}

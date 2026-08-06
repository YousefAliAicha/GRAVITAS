/**
 * GRAVITAS PORTAL MODELS ENGINE — PERFECTED CAD BLUEPRINTS & HOVER INSPECTION MODELS
 * Preserves original detailed gate models & adds extra project models for hover inspection
 */
(function () {
  if (typeof THREE === "undefined") return;

  // =========================================================================
  // SHARED BLUEPRINT MATERIALS
  // =========================================================================
  var matHull = new THREE.MeshStandardMaterial({
    color: 0x071626,
    roughness: 0.35,
    metalness: 0.65,
    transparent: true,
    opacity: 0.88,
  });

  var matPCB = new THREE.MeshStandardMaterial({
    color: 0x0a324d,
    roughness: 0.25,
    metalness: 0.5,
    transparent: true,
    opacity: 0.92,
  });

  var matGlowCyan = new THREE.MeshStandardMaterial({
    color: 0x00b4ff,
    emissive: 0x00d2ff,
    emissiveIntensity: 1.1,
    roughness: 0.2,
  });

  var matGlowTeal = new THREE.MeshStandardMaterial({
    color: 0x2bb8b0,
    emissive: 0x1ad1c7,
    emissiveIntensity: 1.2,
    roughness: 0.2,
  });

  var matGlowAmber = new THREE.MeshStandardMaterial({
    color: 0xffa044,
    emissive: 0xff8800,
    emissiveIntensity: 1.3,
    roughness: 0.2,
  });

  var matLCD = new THREE.MeshStandardMaterial({
    color: 0x011a10,
    emissive: 0x00ff88,
    emissiveIntensity: 0.85,
    roughness: 0.2,
  });

  var matGold = new THREE.MeshStandardMaterial({
    color: 0xd1a14c,
    roughness: 0.25,
    metalness: 0.9,
    emissive: 0x664400,
    emissiveIntensity: 0.25,
  });

  var matGlassCover = new THREE.MeshStandardMaterial({
    color: 0x0a2236,
    roughness: 0.12,
    metalness: 0.15,
    transparent: true,
    opacity: 0.45,
    emissive: 0x061018,
    emissiveIntensity: 0.2,
  });

  var edgeMatCache = {};
  var skipBlueprintEdges = false;

  function getEdgeMaterial(colorHex, opacity) {
    var c = colorHex || 0x38b6ff;
    var o = opacity || 0.65;
    var key = c + "_" + o;
    if (!edgeMatCache[key]) {
      edgeMatCache[key] = new THREE.LineBasicMaterial({
        color: c,
        transparent: true,
        opacity: o,
      });
    }
    return edgeMatCache[key];
  }

  function addBlueprintEdges(mesh, colorHex, opacity) {
    if (skipBlueprintEdges) return null;
    var edges = new THREE.EdgesGeometry(mesh.geometry, 18);
    var line = new THREE.LineSegments(
      edges,
      getEdgeMaterial(colorHex, opacity),
    );
    mesh.add(line);
    return line;
  }

  function createWire(p1, p2, p3, colorHex) {
    var curve = new THREE.CatmullRomCurve3([p1, p2, p3]);
    var geo = new THREE.TubeGeometry(curve, 8, 0.008, 4, false);
    return new THREE.Mesh(
      geo,
      new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.3 }),
    );
  }

  // =========================================================================
  // [1] GATE 1: SYSTEMS_ (AEGIS RADAR UNIT)
  // =========================================================================
  function buildAegisRadar() {
    var group = new THREE.Group();
    var parts = [];

    var auraLight = new THREE.PointLight(0x00b4ff, 0.4, 4.0);
    auraLight.position.set(0, 0.2, 0.1);
    group.add(auraLight);

    // Base Chassis
    var baseGroup = new THREE.Group();
    var tray = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.16, 0.82), matHull);
    baseGroup.add(tray);
    addBlueprintEdges(tray);

    var deck = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.04, 0.72), matPCB);
    deck.position.y = 0.09;
    baseGroup.add(deck);
    addBlueprintEdges(deck, 0x00ffff);

    [
      [-0.52, 0.08, -0.34, -0.78, -0.28, -0.52],
      [0.52, 0.08, -0.34, 0.78, -0.28, -0.52],
      [-0.52, 0.08, 0.34, -0.78, -0.28, 0.52],
      [0.52, 0.08, 0.34, 0.78, -0.28, 0.52],
    ].forEach(function (lp) {
      var start = new THREE.Vector3(lp[0], lp[1], lp[2]);
      var end = new THREE.Vector3(lp[3], lp[4], lp[5]);
      var dir = new THREE.Vector3().subVectors(end, start);
      var len = dir.length();
      var leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.028, 0.038, len, 8),
        matHull,
      );
      leg.position.copy(start).addScaledVector(dir, 0.5);
      leg.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        dir.clone().normalize(),
      );
      baseGroup.add(leg);
      addBlueprintEdges(leg);
    });

    parts.push({
      mesh: baseGroup,
      asmPos: new THREE.Vector3(0, -0.18, 0),
      expPos: new THREE.Vector3(0, -0.52, 0),
      floatSpeed: 1.1,
      floatAmp: 0.03,
      phase: 0.0,
    });

    // MCU PCB
    var mcuGroup = new THREE.Group();
    var mcuPCB = new THREE.Mesh(
      new THREE.BoxGeometry(0.44, 0.028, 0.3),
      matPCB,
    );
    mcuGroup.add(mcuPCB);
    addBlueprintEdges(mcuPCB, 0x00ffff);

    var espShield = new THREE.Mesh(
      new THREE.BoxGeometry(0.17, 0.035, 0.17),
      matHull,
    );
    espShield.position.set(-0.08, 0.025, 0);
    mcuGroup.add(espShield);
    addBlueprintEdges(espShield, 0xffffff);

    parts.push({
      mesh: mcuGroup,
      asmPos: new THREE.Vector3(-0.28, -0.04, 0.04),
      expPos: new THREE.Vector3(-0.68, 0.12, 0.35),
      floatSpeed: 1.6,
      floatAmp: 0.05,
      phase: 1.1,
    });

    // LCD Screen
    var lcdGroup = new THREE.Group();
    var lcdFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.62, 0.28, 0.04),
      matPCB,
    );
    lcdGroup.add(lcdFrame);
    addBlueprintEdges(lcdFrame);

    var lcdScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.14), matLCD);
    lcdScreen.position.z = 0.028;
    lcdGroup.add(lcdScreen);

    parts.push({
      mesh: lcdGroup,
      asmPos: new THREE.Vector3(0.26, 0.08, 0.32),
      expPos: new THREE.Vector3(0.72, 0.38, 0.62),
      asmRot: new THREE.Euler(-0.35, 0, 0),
      expRot: new THREE.Euler(-0.5, 0.3, 0.1),
      floatSpeed: 1.9,
      floatAmp: 0.05,
      phase: 2.3,
    });

    // Turret Riser & Servo
    var pedGroup = new THREE.Group();
    var pedFlange = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.22, 0.08, 16),
      matHull,
    );
    pedGroup.add(pedFlange);
    addBlueprintEdges(pedFlange);

    var pedStem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.14, 0.22, 16),
      matPCB,
    );
    pedStem.position.y = 0.14;
    pedGroup.add(pedStem);
    addBlueprintEdges(pedStem, 0x00ffff);

    parts.push({
      mesh: pedGroup,
      asmPos: new THREE.Vector3(0, 0.01, 0),
      expPos: new THREE.Vector3(0.0, 0.28, -0.42),
      floatSpeed: 1.5,
      floatAmp: 0.04,
      phase: 4.1,
    });

    var servoGroup = new THREE.Group();
    var servoBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.26, 0.12),
      matHull,
    );
    servoGroup.add(servoBody);
    addBlueprintEdges(servoBody, 0x00b4ff);

    parts.push({
      mesh: servoGroup,
      asmPos: new THREE.Vector3(0, 0.32, 0),
      expPos: new THREE.Vector3(0.42, 0.58, 0.22),
      floatSpeed: 2.0,
      floatAmp: 0.06,
      phase: 5.0,
    });

    // Sensor Head
    var headGroup = new THREE.Group();
    var hcPCB = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.17, 0.035), matPCB);
    headGroup.add(hcPCB);
    addBlueprintEdges(hcPCB, 0x00ffff);

    [-0.12, 0.12].forEach(function (tx) {
      var barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.07, 0.07, 0.15, 14),
        matHull,
      );
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(tx, 0, 0.08);
      headGroup.add(barrel);
      addBlueprintEdges(barrel, 0x00ffff);
    });

    parts.push({
      mesh: headGroup,
      asmPos: new THREE.Vector3(0, 0.58, 0.06),
      expPos: new THREE.Vector3(-0.2, 0.92, 0.12),
      floatSpeed: 1.7,
      floatAmp: 0.06,
      phase: 6.2,
      isHead: true,
    });

    parts.forEach(function (p) {
      p.mesh.position.copy(p.expPos);
      if (p.expRot) p.mesh.rotation.copy(p.expRot);
      group.add(p.mesh);
    });

    group.userData = {
      idleSpin: 0.0001,
      spinUpMs: 400,
      assembleProgress: 0.0,
      forceAssembled: false,
      parts: parts,
      auraLight: auraLight,

      tick: function (dtMs, isHovered) {
        if (this.bayMode) {
          if (this.bayPosed) return;
          this.assembleProgress = 1.0;
          group.rotation.x = 0;
          group.rotation.z = 0;
          this.auraLight.intensity = 1.0;
          this.parts.forEach(function (p) {
            p.mesh.position.copy(p.asmPos);
            if (p.asmRot) p.mesh.rotation.copy(p.asmRot);
            else p.mesh.rotation.set(0, 0, 0);
          });
          this.bayPosed = true;
          return;
        }

        var dt = dtMs * 0.001;
        var timeSec = Date.now() * 0.001;

        var targetProgress = isHovered || this.forceAssembled ? 1.0 : 0.0;
        this.assembleProgress +=
          (targetProgress - this.assembleProgress) * Math.min(1.0, dt * 6.0);
        var pFact = this.assembleProgress;

        this.auraLight.intensity = THREE.MathUtils.lerp(0.3, 1.2, pFact);

        var tumbleZ = Math.sin(timeSec * 0.85) * 0.15;
        var tumbleX = Math.cos(timeSec * 0.65) * 0.1;

        group.rotation.x = THREE.MathUtils.lerp(tumbleX, 0, pFact);
        group.rotation.z = THREE.MathUtils.lerp(tumbleZ, 0, pFact);

        if ((isHovered || this.forceAssembled) && !this.bayMode) {
          group.rotation.y = THREE.MathUtils.lerp(
            group.rotation.y,
            0,
            pFact * 0.1,
          );
        }

        this.parts.forEach(function (p) {
          var floatY =
            this.bayMode
              ? 0
              : Math.sin(timeSec * p.floatSpeed + p.phase) *
                p.floatAmp *
                (1.0 - pFact);

          p.mesh.position.x = THREE.MathUtils.lerp(
            p.expPos.x,
            p.asmPos.x,
            pFact,
          );
          p.mesh.position.y = THREE.MathUtils.lerp(
            p.expPos.y + floatY,
            p.asmPos.y,
            pFact,
          );
          p.mesh.position.z = THREE.MathUtils.lerp(
            p.expPos.z,
            p.asmPos.z,
            pFact,
          );

          var targetRotX = p.asmRot ? p.asmRot.x : 0;
          var targetRotY = p.asmRot ? p.asmRot.y : 0;
          var targetRotZ = p.asmRot ? p.asmRot.z : 0;

          var expRotX = p.expRot ? p.expRot.x : 0;
          var expRotY = p.expRot ? p.expRot.y : 0;
          var expRotZ = p.expRot
            ? p.expRot.z
            : (1.0 - pFact) * Math.sin(timeSec + p.phase) * 0.1;

          p.mesh.rotation.x = THREE.MathUtils.lerp(expRotX, targetRotX, pFact);
          p.mesh.rotation.y = THREE.MathUtils.lerp(expRotY, targetRotY, pFact);
          p.mesh.rotation.z = THREE.MathUtils.lerp(expRotZ, targetRotZ, pFact);

          if (p.isHead) {
            if (pFact > 0.82) {
              p.mesh.rotation.y = Math.sin(timeSec * 3.2) * 0.65;
            } else {
              p.mesh.rotation.y *= 0.85;
            }
          }
        }, this);
      },
    };

    return group;
  }

  // =========================================================================
  // [2] GATE 2: CREATIVE_TECH_ (SPLICE ENGINE)
  // =========================================================================
  function buildSpliceEngine() {
    var group = new THREE.Group();

    var auraLight = new THREE.PointLight(0x2bb8b0, 0.4, 4.2);
    auraLight.position.set(0, 0.1, 0.1);
    group.add(auraLight);

    [
      [-0.28, -0.28],
      [0.28, -0.28],
      [-0.28, 0.28],
      [0.28, 0.28],
    ].forEach(function (pos) {
      var col = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.018, 0.98, 8),
        matGold,
      );
      col.position.set(pos[0], 0, pos[1]);
      group.add(col);
      addBlueprintEdges(col, 0xffd175, 0.8);
    });

    function createFilmReel(radius, height) {
      var reelGroup = new THREE.Group();

      var mainDisc = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius, height, 20),
        matHull,
      );
      reelGroup.add(mainDisc);
      addBlueprintEdges(mainDisc, 0x2bb8b0, 0.85);

      var tape = new THREE.Mesh(
        new THREE.CylinderGeometry(
          radius + 0.01,
          radius + 0.01,
          height * 0.6,
          20,
          1,
          true,
        ),
        new THREE.MeshStandardMaterial({
          color: 0x050f1a,
          roughness: 0.2,
          metalness: 0.8,
        }),
      );
      reelGroup.add(tape);

      for (var k = 0; k < 5; k++) {
        var sang = (k / 5) * Math.PI * 2;
        var spoke = new THREE.Mesh(
          new THREE.CylinderGeometry(
            radius * 0.22,
            radius * 0.22,
            height + 0.02,
            10,
          ),
          matPCB,
        );
        spoke.position.set(
          Math.cos(sang) * (radius * 0.55),
          0,
          Math.sin(sang) * (radius * 0.55),
        );
        reelGroup.add(spoke);
        addBlueprintEdges(spoke, 0x2bb8b0, 0.5);
      }

      var rim = new THREE.Mesh(
        new THREE.TorusGeometry(radius + 0.025, 0.012, 8, 24),
        matGlowTeal,
      );
      rim.rotation.x = Math.PI / 2;
      rim.position.y = height / 2;
      reelGroup.add(rim);

      return { group: reelGroup, rimMat: rim.material };
    }

    var tierDefs = [
      { name: "ColdStart", y: -0.32, r: 0.48, h: 0.16 },
      { name: "KNN", y: 0.0, r: 0.42, h: 0.16 },
      { name: "Ensemble", y: 0.32, r: 0.36, h: 0.16 },
    ];

    var tiers = [];
    tierDefs.forEach(function (td) {
      var reelObj = createFilmReel(td.r, td.h);
      reelObj.group.position.y = td.y;
      group.add(reelObj.group);
      tiers.push(reelObj);
    });

    var cardGroup = new THREE.Group();
    var cardMeshes = [];
    for (var c = 0; c < 4; c++) {
      var cardMat = new THREE.MeshStandardMaterial({
        color: 0x0a2d42,
        emissive: 0x1ad1c7,
        emissiveIntensity: 0.4,
        roughness: 0.3,
        transparent: true,
        opacity: 0.85,
      });
      var card = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.26), cardMat);
      var cang = (c / 4) * Math.PI * 2;
      card.position.set(Math.cos(cang) * 0.62, 0, Math.sin(cang) * 0.62);
      card.rotation.y = -cang + Math.PI / 2;
      addBlueprintEdges(card, 0x2bb8b0, 0.9);
      cardGroup.add(card);
      cardMeshes.push(card);
    }
    group.add(cardGroup);

    var coreGlass = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 0.98, 16),
      new THREE.MeshStandardMaterial({
        color: 0x2bb8b0,
        emissive: 0x1ad1c7,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.5,
      }),
    );
    group.add(coreGlass);

    var particleCount = 20;
    var pGeo = new THREE.BufferGeometry();
    var pPos = new Float32Array(particleCount * 3);

    for (var i = 0; i < particleCount; i++) {
      var ang = Math.random() * Math.PI * 2;
      var rad = 0.08 + Math.random() * 0.28;
      pPos[i * 3] = Math.cos(ang) * rad;
      pPos[i * 3 + 1] = -0.45 + Math.random() * 0.9;
      pPos[i * 3 + 2] = Math.sin(ang) * rad;
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));

    var particleSystem = new THREE.Points(
      pGeo,
      new THREE.PointsMaterial({
        color: 0x70ffff,
        size: 0.038,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
      }),
    );
    group.add(particleSystem);

    group.userData = {
      idleSpin: 0.00008,
      spinUpMs: 350,
      hoverProgress: 0.0,
      forceAssembled: false,
      tiers: tiers,
      cardGroup: cardGroup,
      particleSystem: particleSystem,
      auraLight: auraLight,

      tick: function (dtMs, isHovered) {
        if (this.bayMode) {
          var tBay = Date.now() * 0.001;
          group.rotation.x = 0;
          group.rotation.z = 0;
          this.auraLight.intensity = 1.0;
          this.hoverProgress = 1.0;
          this.tiers[0].group.rotation.y = tBay * 0.2;
          this.tiers[1].group.rotation.y = -tBay * 0.25;
          this.tiers[2].group.rotation.y = tBay * 0.3;
          this.cardGroup.rotation.y = -tBay * 0.35;
          return;
        }

        var dt = dtMs * 0.001;
        var timeSec = Date.now() * 0.001;

        var targetProgress = isHovered || this.forceAssembled ? 1.0 : 0.0;
        this.hoverProgress +=
          (targetProgress - this.hoverProgress) * Math.min(1.0, dt * 6.0);
        var hFact = this.hoverProgress;

        this.auraLight.intensity = THREE.MathUtils.lerp(0.4, 1.3, hFact);

        var wobbleZ = Math.sin(timeSec * 0.75) * 0.1;
        var wobbleX = Math.cos(timeSec * 0.55) * 0.06;

        group.rotation.x = THREE.MathUtils.lerp(wobbleX, 0, hFact);
        group.rotation.z = THREE.MathUtils.lerp(wobbleZ, 0, hFact);

        this.tiers[0].group.rotation.y = timeSec * (0.08 + hFact * 0.12);
        this.tiers[1].group.rotation.y = -timeSec * (0.1 + hFact * 0.15);
        this.tiers[2].group.rotation.y = timeSec * (0.12 + hFact * 0.18);

        this.cardGroup.rotation.y = -timeSec * (0.15 + hFact * 0.2);

        this.tiers.forEach(function (t) {
          t.rimMat.emissiveIntensity = THREE.MathUtils.lerp(0.8, 2.0, hFact);
        });

        var speedMult = THREE.MathUtils.lerp(0.2, 0.7, hFact);
        var positions = this.particleSystem.geometry.attributes.position.array;

        for (var i = 0; i < particleCount; i++) {
          positions[i * 3 + 1] += dt * speedMult;
          if (positions[i * 3 + 1] > 0.48) {
            positions[i * 3 + 1] = -0.48;
          }
        }
        this.particleSystem.geometry.attributes.position.needsUpdate = true;
      },
    };

    return group;
  }

  // =========================================================================
  // [3] GATE 3: STARTUP_ (SENTINEL CONTROLLER)
  // =========================================================================
  function buildSentinelController() {
    var group = new THREE.Group();
    var parts = [];

    var auraLight = new THREE.PointLight(0xffa044, 0.4, 4.0);
    auraLight.position.set(0, 0.1, 0.1);
    group.add(auraLight);

    var baseGroup = new THREE.Group();
    var baseTray = new THREE.Mesh(
      new THREE.BoxGeometry(1.18, 0.12, 0.78),
      matHull,
    );
    baseGroup.add(baseTray);
    addBlueprintEdges(baseTray);

    [
      [-0.52, -0.32],
      [0.52, -0.32],
      [-0.52, 0.32],
      [0.52, 0.32],
    ].forEach(function (sp) {
      var standoff = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.12, 8),
        matGold,
      );
      standoff.position.set(sp[0], 0.06, sp[1]);
      baseGroup.add(standoff);
    });

    parts.push({
      mesh: baseGroup,
      asmPos: new THREE.Vector3(0, -0.15, 0),
      expPos: new THREE.Vector3(0, -0.52, 0),
      floatSpeed: 1.1,
      floatAmp: 0.03,
      phase: 0.0,
    });

    var mcuGroup = new THREE.Group();
    var mainPCB = new THREE.Mesh(
      new THREE.BoxGeometry(0.96, 0.04, 0.6),
      matPCB,
    );
    mcuGroup.add(mainPCB);
    addBlueprintEdges(mainPCB, 0x00ff88);

    var usbJack = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.12, 0.16),
      matHull,
    );
    usbJack.position.set(-0.38, 0.08, -0.18);
    mcuGroup.add(usbJack);
    addBlueprintEdges(usbJack, 0xffffff);

    var mcuChip = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.035, 0.2),
      matHull,
    );
    mcuChip.position.set(-0.12, 0.038, 0);
    mcuGroup.add(mcuChip);
    addBlueprintEdges(mcuChip, 0xffffff);

    parts.push({
      mesh: mcuGroup,
      asmPos: new THREE.Vector3(0, -0.04, 0),
      expPos: new THREE.Vector3(-0.45, 0.08, 0.25),
      floatSpeed: 1.6,
      floatAmp: 0.05,
      phase: 1.2,
    });

    var segGroup = new THREE.Group();
    var segDisplay = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, 0.15, 0.12),
      matHull,
    );
    segGroup.add(segDisplay);
    addBlueprintEdges(segDisplay, 0x00ff88);

    var segScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.11), matLCD);
    segScreen.position.set(0, 0.076, 0);
    segScreen.rotation.x = -Math.PI / 2;
    segGroup.add(segScreen);

    parts.push({
      mesh: segGroup,
      asmPos: new THREE.Vector3(0.22, 0.09, -0.12),
      expPos: new THREE.Vector3(0.68, 0.35, -0.42),
      floatSpeed: 1.9,
      floatAmp: 0.05,
      phase: 2.4,
    });

    var ledGroup = new THREE.Group();
    var ledColors = [0xff3344, 0xffbb00, 0x00ff88];
    var leds = [];

    [-0.06, 0.02, 0.1].forEach(function (lx, li) {
      var ledTower = new THREE.Mesh(
        new THREE.CylinderGeometry(0.032, 0.038, 0.08, 12),
        matHull,
      );
      ledTower.position.set(lx, 0.04, 0);
      ledGroup.add(ledTower);
      addBlueprintEdges(ledTower, 0xffa044);

      var ledLens = new THREE.Mesh(
        new THREE.SphereGeometry(0.03, 12, 12),
        new THREE.MeshStandardMaterial({
          color: ledColors[li],
          emissive: ledColors[li],
          emissiveIntensity: li === 0 ? 0.9 : 0.1,
          roughness: 0.2,
        }),
      );
      ledLens.position.set(lx, 0.08, 0);
      ledGroup.add(ledLens);
      leds.push(ledLens);
    });

    parts.push({
      mesh: ledGroup,
      asmPos: new THREE.Vector3(0.08, 0.06, 0.22),
      expPos: new THREE.Vector3(0.72, 0.42, 0.52),
      floatSpeed: 1.4,
      floatAmp: 0.04,
      phase: 3.5,
    });

    var sonarGroup = new THREE.Group();
    var hcPCB = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.14, 0.03), matPCB);
    sonarGroup.add(hcPCB);

    [-0.08, 0.08].forEach(function (tx) {
      var barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 0.1, 14),
        matHull,
      );
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(tx, 0, 0.05);
      sonarGroup.add(barrel);
      addBlueprintEdges(barrel, 0xffbb00);
    });

    var pingRingGeo = new THREE.RingGeometry(0.04, 0.065, 24);
    var pingRingMat = new THREE.MeshBasicMaterial({
      color: 0xffbb00,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    var pingRing = new THREE.Mesh(pingRingGeo, pingRingMat);
    pingRing.position.set(0, 0, 0.12);
    sonarGroup.add(pingRing);

    parts.push({
      mesh: sonarGroup,
      asmPos: new THREE.Vector3(-0.28, 0.08, 0.22),
      expPos: new THREE.Vector3(-0.75, 0.52, 0.52),
      floatSpeed: 1.7,
      floatAmp: 0.06,
      phase: 4.8,
      isSonar: true,
    });

    var chipGroup = new THREE.Group();
    var shiftIC = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.03, 0.1),
      matHull,
    );
    chipGroup.add(shiftIC);
    addBlueprintEdges(shiftIC, 0xffffff);

    parts.push({
      mesh: chipGroup,
      asmPos: new THREE.Vector3(0.18, 0.038, 0.18),
      expPos: new THREE.Vector3(-0.58, -0.15, 0.62),
      floatSpeed: 2.1,
      floatAmp: 0.05,
      phase: 5.5,
    });

    var wireGroup = new THREE.Group();
    wireGroup.add(
      createWire(
        new THREE.Vector3(-0.12, 0.04, -0.08),
        new THREE.Vector3(-0.08, 0.1, 0.05),
        new THREE.Vector3(-0.06, 0.08, 0.22),
        0xff3344,
      ),
    );
    wireGroup.add(
      createWire(
        new THREE.Vector3(-0.1, 0.04, -0.08),
        new THREE.Vector3(-0.02, 0.1, 0.05),
        new THREE.Vector3(0.02, 0.08, 0.22),
        0xffbb00,
      ),
    );
    wireGroup.add(
      createWire(
        new THREE.Vector3(-0.08, 0.04, -0.08),
        new THREE.Vector3(0.02, 0.1, 0.05),
        new THREE.Vector3(0.1, 0.08, 0.22),
        0x00ff88,
      ),
    );

    parts.push({
      mesh: wireGroup,
      asmPos: new THREE.Vector3(0, 0, 0),
      expPos: new THREE.Vector3(0, 0.32, 0),
      floatSpeed: 1.2,
      floatAmp: 0.03,
      phase: 0.5,
    });

    var encGroup = new THREE.Group();
    var cover = new THREE.Mesh(
      new THREE.BoxGeometry(1.08, 0.26, 0.72),
      matGlassCover,
    );
    encGroup.add(cover);
    addBlueprintEdges(cover, 0xffa044, 0.85);

    parts.push({
      mesh: encGroup,
      asmPos: new THREE.Vector3(0, 0.12, 0),
      expPos: new THREE.Vector3(0, 0.85, -0.2),
      floatSpeed: 1.3,
      floatAmp: 0.04,
      phase: 6.0,
      isCover: true,
    });

    parts.forEach(function (p) {
      p.mesh.position.copy(p.expPos);
      group.add(p.mesh);
    });

    group.userData = {
      idleSpin: 0.0001,
      spinUpMs: 350,
      assembleProgress: 0.0,
      forceAssembled: false,
      parts: parts,
      leds: leds,
      pingRing: pingRing,
      auraLight: auraLight,

      tick: function (dtMs, isHovered) {
        var dt = dtMs * 0.001;
        var timeSec = Date.now() * 0.001;

        // Scan bay: lock assembled pose once, then no-op (parent group still spins)
        if (this.bayMode) {
          if (this.bayPosed) return;
          this.assembleProgress = 1.0;
          group.rotation.x = 0;
          group.rotation.z = 0;
          this.auraLight.intensity = 1.0;

          this.parts.forEach(function (p) {
            p.mesh.position.copy(p.asmPos);
            if (p.asmRot) p.mesh.rotation.copy(p.asmRot);
            else p.mesh.rotation.set(0, 0, 0);
            p.mesh.visible = !p.isCover;
          });

          this.leds[0].material.emissiveIntensity = 0.9;
          this.leds[1].material.emissiveIntensity = 0.55;
          this.leds[2].material.emissiveIntensity = 0.55;
          this.pingRing.visible = false;
          this.bayPosed = true;
          return;
        }

        var targetProgress = isHovered || this.forceAssembled ? 1.0 : 0.0;
        this.assembleProgress +=
          (targetProgress - this.assembleProgress) * Math.min(1.0, dt * 6.0);
        var pFact = this.assembleProgress;

        this.auraLight.intensity = THREE.MathUtils.lerp(0.3, 1.3, pFact);

        var tumbleZ = Math.sin(timeSec * 0.8) * 0.15;
        var tumbleX = Math.cos(timeSec * 0.6) * 0.1;

        group.rotation.x = THREE.MathUtils.lerp(tumbleX, 0, pFact);
        group.rotation.z = THREE.MathUtils.lerp(tumbleZ, 0, pFact);

        if ((isHovered || this.forceAssembled) && !this.bayMode) {
          group.rotation.y = THREE.MathUtils.lerp(
            group.rotation.y,
            0,
            pFact * 0.1,
          );
        }

        this.parts.forEach(function (p) {
          var floatY =
            this.bayMode
              ? 0
              : Math.sin(timeSec * p.floatSpeed + p.phase) *
                p.floatAmp *
                (1.0 - pFact);

          p.mesh.position.x = THREE.MathUtils.lerp(
            p.expPos.x,
            p.asmPos.x,
            pFact,
          );
          p.mesh.position.y = THREE.MathUtils.lerp(
            p.expPos.y + floatY,
            p.asmPos.y,
            pFact,
          );
          p.mesh.position.z = THREE.MathUtils.lerp(
            p.expPos.z,
            p.asmPos.z,
            pFact,
          );

          var targetRotX = p.asmRot ? p.asmRot.x : 0;
          var targetRotY = p.asmRot ? p.asmRot.y : 0;
          var targetRotZ = p.asmRot ? p.asmRot.z : 0;

          var expRotX = p.expRot ? p.expRot.x : 0;
          var expRotY = p.expRot ? p.expRot.y : 0;
          var expRotZ = p.expRot
            ? p.expRot.z
            : (1.0 - pFact) * Math.sin(timeSec + p.phase) * 0.1;

          p.mesh.rotation.x = THREE.MathUtils.lerp(expRotX, targetRotX, pFact);
          p.mesh.rotation.y = THREE.MathUtils.lerp(expRotY, targetRotY, pFact);
          p.mesh.rotation.z = THREE.MathUtils.lerp(expRotZ, targetRotZ, pFact);
        }, this);

        var blinkRate = isHovered || this.forceAssembled ? 16.0 : 2.5;
        var blinkState = (Math.sin(timeSec * blinkRate) + 1) * 0.5;
        this.leds[0].material.emissiveIntensity = 0.3 + blinkState * 1.5;

        var pingPhase =
          (timeSec * (isHovered || this.forceAssembled ? 2.8 : 1.0)) % 1.0;
        this.pingRing.scale.setScalar(1.0 + pingPhase * 4.0);
        this.pingRing.material.opacity =
          (1.0 - pingPhase) * (0.3 + pFact * 0.6);
      },
    };

    return group;
  }

  // =========================================================================
  // EXTRA PROJECT-SPECIFIC HOVER MODELS FOR SCAN BAY INSPECTION
  // =========================================================================

  function addHoverAura(group, colorHex, intensity) {
    var light = new THREE.PointLight(colorHex || 0x00b4ff, intensity || 0.35, 3.8);
    light.position.set(0, 0.35, 0.15);
    group.add(light);
    return light;
  }

  // BALLISTA — Monte Carlo ballistic simulator
  // Roman torsion ballista frame + bolt + fan of stochastic trajectories
  function buildBallista() {
    var group = new THREE.Group();
    var auraLight = addHoverAura(group, 0xffa044, 0.45);

    var frameGroup = new THREE.Group();

    // Base sled
    var sled = new THREE.Mesh(
      new THREE.BoxGeometry(1.05, 0.1, 0.42),
      matHull,
    );
    sled.position.y = 0.05;
    frameGroup.add(sled);
    addBlueprintEdges(sled, 0xffa044);

    // Upright stanchions
    [-0.38, 0.38].forEach(function (sx) {
      var post = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.52, 0.08),
        matPCB,
      );
      post.position.set(sx, 0.31, 0);
      frameGroup.add(post);
      addBlueprintEdges(post, 0xffa044);
    });

    // Torsion spring bundles (the "ballista" arms)
    [-1, 1].forEach(function (side) {
      var armGroup = new THREE.Group();
      var spring = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.09, 0.22, 10),
        matGold,
      );
      spring.rotation.z = Math.PI / 2;
      armGroup.add(spring);

      var arm = new THREE.Mesh(
        new THREE.BoxGeometry(0.48, 0.05, 0.05),
        matHull,
      );
      arm.position.set(side * 0.28, 0.08, 0);
      arm.rotation.z = side * 0.55;
      armGroup.add(arm);
      addBlueprintEdges(arm, 0xffa044);

      armGroup.position.set(side * 0.38, 0.52, 0);
      frameGroup.add(armGroup);
    });

    // Launch rail + bolt
    var rail = new THREE.Mesh(
      new THREE.BoxGeometry(0.72, 0.04, 0.06),
      matPCB,
    );
    rail.position.set(0, 0.58, 0);
    frameGroup.add(rail);

    var bolt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.62, 8),
      matGold,
    );
    bolt.rotation.z = Math.PI / 2;
    bolt.position.set(0.08, 0.62, 0);
    frameGroup.add(bolt);
    addBlueprintEdges(bolt, 0xffd175);

    var boltTip = new THREE.Mesh(
      new THREE.ConeGeometry(0.04, 0.1, 8),
      matGlowAmber,
    );
    boltTip.rotation.z = -Math.PI / 2;
    boltTip.position.set(0.42, 0.62, 0);
    frameGroup.add(boltTip);

    group.add(frameGroup);

    // Monte Carlo dispersion arcs — the spread, not the single shot
    var arcGroup = new THREE.Group();
    var arcMeshes = [];
    for (var a = 0; a < 9; a++) {
      var spread = (a - 4) * 0.11;
      var arcMat = new THREE.MeshBasicMaterial({
        color: 0xffa044,
        transparent: true,
        opacity: 0.12 + Math.abs(spread) * 0.08,
        wireframe: true,
      });
      var arc = new THREE.Mesh(
        new THREE.TorusGeometry(0.55 + Math.abs(spread) * 0.35, 0.008, 4, 28, Math.PI * 0.55),
        arcMat,
      );
      arc.rotation.x = Math.PI / 2.8 + spread * 0.35;
      arc.rotation.y = spread * 0.4;
      arc.position.set(0.55, 0.62, spread * 0.15);
      arcGroup.add(arc);
      arcMeshes.push(arc);
    }
    group.add(arcGroup);

    // Impact scatter on ground plane (Monte Carlo landing zone)
    var scatterGroup = new THREE.Group();
    var scatterPositions = [
      [0.92, -0.18], [1.05, 0.08], [1.18, -0.05], [1.28, 0.22],
      [1.08, 0.28], [1.22, -0.22], [0.98, 0.15], [1.32, 0.05],
      [1.15, -0.28], [1.25, 0.18], [1.02, -0.08], [1.2, 0.12],
      [1.1, -0.12], [1.3, -0.02],
    ];
    scatterPositions.forEach(function (sp, si) {
      var dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.016 + (si % 3) * 0.006, 6, 6),
        new THREE.MeshStandardMaterial({
          color: 0xff8800,
          emissive: 0xff6600,
          emissiveIntensity: 0.6,
          transparent: true,
          opacity: 0.55,
        }),
      );
      dot.position.set(sp[0], 0.02, sp[1]);
      scatterGroup.add(dot);
    });

    var landingZone = new THREE.Mesh(
      new THREE.RingGeometry(0.18, 0.42, 24),
      new THREE.MeshBasicMaterial({
        color: 0xffa044,
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide,
      }),
    );
    landingZone.rotation.x = -Math.PI / 2;
    landingZone.position.set(1.12, 0.01, 0);
    scatterGroup.add(landingZone);
    group.add(scatterGroup);

    group.userData = {
      auraLight: auraLight,
      arcGroup: arcGroup,
      arcMeshes: arcMeshes,
      tick: function (dtMs, isHovered) {
        var timeSec = Date.now() * 0.001;
        arcGroup.rotation.y = Math.sin(timeSec * 0.6) * 0.08;
        this.auraLight.intensity = isHovered ? 0.7 : 0.4;
        this.arcMeshes.forEach(function (arc, i) {
          arc.material.opacity =
            0.1 + Math.abs(Math.sin(timeSec * 1.4 + i * 0.35)) * 0.25;
        });
      },
    };
    return group;
  }

  function addForceArrow(origin, dir, length, colorHex, headScale) {
    var arrow = new THREE.Group();
    var shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, length * 0.78, 6),
      new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: 0.8,
      }),
    );
    shaft.position.y = length * 0.39;
    arrow.add(shaft);
    var head = new THREE.Mesh(
      new THREE.ConeGeometry(0.022 * (headScale || 1), 0.06 * (headScale || 1), 8),
      new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: 1.0,
      }),
    );
    head.position.y = length * 0.78 + 0.03;
    arrow.add(head);
    arrow.position.copy(origin);
    arrow.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.clone().normalize(),
    );
    return arrow;
  }

  // RAYBORN — JavaScript raycaster (FOV rays + CRT viewport)
  function buildRaybornTerminal() {
    var group = new THREE.Group();
    var auraLight = addHoverAura(group, 0x2bb8b0, 0.45);

    var monitorGroup = new THREE.Group();
    var monitor = new THREE.Mesh(
      new THREE.BoxGeometry(0.88, 0.62, 0.52),
      matHull,
    );
    monitorGroup.add(monitor);
    addBlueprintEdges(monitor, 0x2bb8b0);

    var screenMat = new THREE.MeshStandardMaterial({
      color: 0x011a12,
      emissive: 0x00ff88,
      emissiveIntensity: 0.75,
      roughness: 0.3,
    });
    var screen = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.44), screenMat);
    screen.position.set(0, 0, 0.265);
    monitorGroup.add(screen);

    // Top-down maze grid rendered on the CRT (raycaster viewport)
    var mazeGroup = new THREE.Group();
    for (var mx = 0; mx < 5; mx++) {
      for (var mz = 0; mz < 5; mz++) {
        if ((mx + mz) % 2 === 0) continue;
        var wall = new THREE.Mesh(
          new THREE.BoxGeometry(0.09, 0.09, 0.004),
          new THREE.MeshStandardMaterial({
            color: 0x0a4030,
            emissive: 0x00aa66,
            emissiveIntensity: 0.5,
          }),
        );
        wall.position.set(-0.18 + mx * 0.09, -0.12 + mz * 0.09, 0.002);
        mazeGroup.add(wall);
      }
    }
    screen.add(mazeGroup);

    // Player dot on maze
    var playerDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.018, 8, 8),
      matGlowTeal,
    );
    playerDot.position.set(-0.09, -0.03, 0.01);
    screen.add(playerDot);

    monitorGroup.position.y = 0.36;
    group.add(monitorGroup);

    // Ray fan emanating from viewport (core raycasting metaphor)
    var rayGroup = new THREE.Group();
    var rayLines = [];
    for (var ri = 0; ri < 11; ri++) {
      var spread = (ri - 5) * 0.09;
      var rayLen = 0.72;
      var rayMat = new THREE.MeshStandardMaterial({
        color: 0x00ff88,
        emissive: 0x00ff88,
        emissiveIntensity: 0.35 + Math.abs(spread) * 0.08,
        transparent: true,
        opacity: 0.45,
      });
      var ray = new THREE.Mesh(
        new THREE.CylinderGeometry(0.004, 0.001, rayLen, 4),
        rayMat,
      );
      ray.position.set(spread * 0.18, 0.36, 0.28 + rayLen * 0.5);
      ray.rotation.x = Math.PI / 2 + spread * 0.15;
      rayGroup.add(ray);
      rayLines.push(ray);
    }
    group.add(rayGroup);

    // Camera origin marker
    var camBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.08, 0.1),
      matPCB,
    );
    camBody.position.set(0, 0.36, 0.18);
    group.add(camBody);
    addBlueprintEdges(camBody, 0x2bb8b0);

    var kb = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.07, 0.36), matPCB);
    kb.position.set(0, 0.04, 0.22);
    group.add(kb);
    addBlueprintEdges(kb, 0x2bb8b0);

    var stand = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.18, 0.1),
      matHull,
    );
    stand.position.set(0, 0.09, 0);
    group.add(stand);

    group.userData = {
      auraLight: auraLight,
      rayLines: rayLines,
      playerDot: playerDot,
      screenMat: screenMat,
      tick: function (dtMs, isHovered) {
        var timeSec = Date.now() * 0.001;
        this.rayLines.forEach(function (ray, i) {
          ray.material.emissiveIntensity =
            0.25 + Math.abs(Math.sin(timeSec * 2.8 + i * 0.35)) * 0.55;
          ray.material.opacity =
            0.25 + Math.abs(Math.sin(timeSec * 2.2 + i * 0.28)) * 0.35;
        });
        this.playerDot.position.x = -0.09 + Math.sin(timeSec * 1.4) * 0.12;
        this.playerDot.position.y = -0.03 + Math.cos(timeSec * 1.1) * 0.08;
        this.screenMat.emissiveIntensity =
          0.55 + Math.sin(timeSec * 4.5) * 0.18;
        this.auraLight.intensity = isHovered ? 0.75 : 0.4;
      },
    };

    return group;
  }

  // GENESIS — SDL2 engine from scratch (window / render loop / input stack)
  function buildGenesisEngine() {
    var group = new THREE.Group();
    var auraLight = addHoverAura(group, 0x2bb8b0, 0.5);

    // SDL window frame
    var winGroup = new THREE.Group();
    var bezel = new THREE.Mesh(
      new THREE.BoxGeometry(0.92, 0.68, 0.08),
      matHull,
    );
    winGroup.add(bezel);
    addBlueprintEdges(bezel, 0x2bb8b0);

    var titleBar = new THREE.Mesh(
      new THREE.BoxGeometry(0.88, 0.07, 0.02),
      matPCB,
    );
    titleBar.position.set(0, 0.305, 0.05);
    winGroup.add(titleBar);

    // Render target / back-buffer screen
    var screen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.78, 0.48),
      new THREE.MeshStandardMaterial({
        color: 0x021820,
        emissive: 0x00ccaa,
        emissiveIntensity: 0.55,
        roughness: 0.25,
      }),
    );
    screen.position.set(0, 0.02, 0.05);
    winGroup.add(screen);

    // Pixel grid on screen (SDL render surface)
    var gridLines = new THREE.Group();
    for (var gx = -3; gx <= 3; gx++) {
      var vLine = new THREE.Mesh(
        new THREE.BoxGeometry(0.004, 0.42, 0.002),
        matGlowTeal,
      );
      vLine.position.set(gx * 0.1, 0.02, 0.06);
      gridLines.add(vLine);
    }
    for (var gy = -2; gy <= 2; gy++) {
      var hLine = new THREE.Mesh(
        new THREE.BoxGeometry(0.72, 0.004, 0.002),
        matGlowTeal,
      );
      hLine.position.set(0, gy * 0.1, 0.06);
      gridLines.add(hLine);
    }
    winGroup.add(gridLines);

    winGroup.position.y = 0.38;
    group.add(winGroup);

    // Game-loop ring (Init → Poll → Update → Render)
    var loopRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.58, 0.012, 8, 36),
      matGlowTeal,
    );
    loopRing.rotation.x = Math.PI / 2;
    loopRing.position.y = 0.38;
    group.add(loopRing);

    var loopLabels = ["INIT", "POLL", "UPDATE", "RENDER"];
    var loopNodes = [];
    loopLabels.forEach(function (label, li) {
      var ang = (li / 4) * Math.PI * 2;
      var node = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.06, 0.04),
        matPCB,
      );
      node.position.set(Math.cos(ang) * 0.58, 0.38, Math.sin(ang) * 0.58);
      node.lookAt(0, 0.38, 0);
      group.add(node);
      addBlueprintEdges(node, 0x2bb8b0, 0.7);
      loopNodes.push(node);
    });

    // Input layer — keyboard wedge beneath window
    var kb = new THREE.Mesh(
      new THREE.BoxGeometry(0.62, 0.06, 0.28),
      matHull,
    );
    kb.position.set(0, 0.03, 0.12);
    group.add(kb);
    addBlueprintEdges(kb, 0x2bb8b0);

    for (var ki = 0; ki < 6; ki++) {
      var key = new THREE.Mesh(
        new THREE.BoxGeometry(0.07, 0.02, 0.07),
        matGlowTeal,
      );
      key.position.set(-0.22 + (ki % 3) * 0.11, 0.07, 0.04 + Math.floor(ki / 3) * 0.1);
      group.add(key);
    }

    // Engine foundation block
    var foundation = new THREE.Mesh(
      new THREE.BoxGeometry(1.0, 0.08, 0.72),
      matPCB,
    );
    foundation.position.y = -0.04;
    group.add(foundation);
    addBlueprintEdges(foundation, 0x00ffff, 0.5);

    group.userData = {
      auraLight: auraLight,
      loopRing: loopRing,
      loopNodes: loopNodes,
      gridLines: gridLines,
      tick: function (dtMs, isHovered) {
        var timeSec = Date.now() * 0.001;
        this.loopRing.rotation.z = timeSec * (isHovered ? 0.55 : 0.25);
        this.loopNodes.forEach(function (node, i) {
          node.material.emissiveIntensity =
            0.3 + Math.abs(Math.sin(timeSec * 2.2 + i * 1.4)) * 0.7;
        });
        this.gridLines.children.forEach(function (line, i) {
          line.material.emissiveIntensity =
            0.5 + Math.sin(timeSec * 3 + i * 0.4) * 0.4;
        });
        this.auraLight.intensity = isHovered ? 0.85 : 0.45;
      },
    };
    return group;
  }

  // NOORMAP — real-time Syria disaster/weather map (NASA EONET + FIRMS feeds)
  function buildNoormap() {
    var group = new THREE.Group();
    var auraLight = addHoverAura(group, 0x0088bb, 0.5);

    // Curved map tile (Leaflet-style)
    var mapCurve = new THREE.Group();
    var mapSurface = new THREE.Mesh(
      new THREE.PlaneGeometry(0.95, 0.72, 12, 8),
      new THREE.MeshStandardMaterial({
        color: 0x082232,
        emissive: 0x004466,
        emissiveIntensity: 0.35,
        roughness: 0.55,
        side: THREE.DoubleSide,
      }),
    );
    mapSurface.rotation.x = -Math.PI / 2.2;
    mapSurface.position.y = 0.18;

    // Bend the map plane slightly for globe feel
    var mapPos = mapSurface.geometry.attributes.position;
    for (var vi = 0; vi < mapPos.count; vi++) {
      var px = mapPos.getX(vi);
      var py = mapPos.getY(vi);
      mapPos.setZ(vi, -Math.pow(Math.abs(px), 2) * 0.18 - Math.pow(Math.abs(py), 2) * 0.08);
    }
    mapSurface.geometry.computeVertexNormals();
    mapCurve.add(mapSurface);

    // Grid overlay
    var gridOverlay = new THREE.Mesh(
      new THREE.PlaneGeometry(0.95, 0.72, 10, 7),
      new THREE.MeshBasicMaterial({
        color: 0x2bb8b0,
        wireframe: true,
        transparent: true,
        opacity: 0.22,
      }),
    );
    gridOverlay.rotation.x = -Math.PI / 2.2;
    gridOverlay.position.y = 0.19;
    mapCurve.add(gridOverlay);

    // Syria region highlight (simplified bounding polygon)
    var regionShape = new THREE.Shape();
    regionShape.moveTo(-0.12, -0.08);
    regionShape.lineTo(0.18, -0.1);
    regionShape.lineTo(0.22, 0.12);
    regionShape.lineTo(0.02, 0.2);
    regionShape.lineTo(-0.15, 0.14);
    regionShape.lineTo(-0.12, -0.08);
    var regionGeo = new THREE.ShapeGeometry(regionShape);
    var regionMesh = new THREE.Mesh(
      regionGeo,
      new THREE.MeshStandardMaterial({
        color: 0x105ba3,
        emissive: 0x2088cc,
        emissiveIntensity: 0.45,
        transparent: true,
        opacity: 0.55,
        side: THREE.DoubleSide,
      }),
    );
    regionMesh.rotation.x = -Math.PI / 2.2;
    regionMesh.position.y = 0.2;
    mapCurve.add(regionMesh);

    group.add(mapCurve);

    // FIRMS wildfire hotspots (orange pulsing dots)
    var fireMarkers = [];
    var firePositions = [
      [0.05, 0.08],
      [-0.04, 0.14],
      [0.14, -0.02],
      [-0.08, -0.04],
    ];
    firePositions.forEach(function (fp) {
      var fire = new THREE.Mesh(
        new THREE.SphereGeometry(0.028, 8, 8),
        new THREE.MeshStandardMaterial({
          color: 0xff6600,
          emissive: 0xff4400,
          emissiveIntensity: 1.2,
        }),
      );
      fire.position.set(fp[0], 0.24, fp[1]);
      group.add(fire);
      fireMarkers.push(fire);

      var ring = new THREE.Mesh(
        new THREE.RingGeometry(0.03, 0.05, 16),
        new THREE.MeshBasicMaterial({
          color: 0xff8800,
          transparent: true,
          opacity: 0.4,
          side: THREE.DoubleSide,
        }),
      );
      ring.rotation.x = -Math.PI / 2.2;
      ring.position.set(fp[0], 0.23, fp[1]);
      group.add(ring);
      fireMarkers.push(ring);
    });

    // EONET disaster event pins (triangular alert markers)
    var eonetMarkers = [];
    [
      [-0.1, 0.06],
      [0.12, 0.16],
    ].forEach(function (ep) {
      var pin = new THREE.Mesh(
        new THREE.ConeGeometry(0.035, 0.08, 4),
        new THREE.MeshStandardMaterial({
          color: 0xff3344,
          emissive: 0xff1122,
          emissiveIntensity: 0.9,
        }),
      );
      pin.position.set(ep[0], 0.28, ep[1]);
      group.add(pin);
      eonetMarkers.push(pin);
    });

    // Satellite dish receiving live feeds
    var dishGroup = new THREE.Group();
    var dishStem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.035, 0.32, 8),
      matHull,
    );
    dishStem.position.y = 0.16;
    dishGroup.add(dishStem);

    var dishBowl = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      matPCB,
    );
    dishBowl.rotation.x = Math.PI;
    dishBowl.position.y = 0.32;
    dishGroup.add(dishBowl);
    addBlueprintEdges(dishBowl, 0x00b4ff);

    var dishLnb = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.04, 0.06),
      matGlowCyan,
    );
    dishLnb.position.set(0, 0.26, 0.06);
    dishGroup.add(dishLnb);

    dishGroup.position.set(-0.52, 0, -0.18);
    dishGroup.rotation.y = 0.45;
    group.add(dishGroup);

    // Data uplink beam
    var beam = new THREE.Mesh(
      new THREE.ConeGeometry(0.06, 0.35, 8, 1, true),
      new THREE.MeshStandardMaterial({
        color: 0x00b4ff,
        emissive: 0x00d2ff,
        emissiveIntensity: 0.6,
        transparent: true,
        opacity: 0.25,
        side: THREE.DoubleSide,
      }),
    );
    beam.rotation.x = -Math.PI / 2.8;
    beam.position.set(-0.38, 0.42, 0.02);
    group.add(beam);

    group.userData = {
      auraLight: auraLight,
      fireMarkers: fireMarkers,
      eonetMarkers: eonetMarkers,
      beam: beam,
      tick: function (dtMs, isHovered) {
        var timeSec = Date.now() * 0.001;
        this.fireMarkers.forEach(function (m, i) {
          if (m.geometry.type === "SphereGeometry") {
            m.material.emissiveIntensity =
              0.8 + Math.sin(timeSec * 3.5 + i) * 0.6;
            m.scale.setScalar(1 + Math.sin(timeSec * 4 + i) * 0.15);
          } else {
            m.material.opacity =
              0.15 + Math.abs(Math.sin(timeSec * 2.8 + i)) * 0.35;
            m.scale.setScalar(1 + (timeSec * 0.8 + i) % 1 * 0.8);
          }
        });
        this.beam.material.opacity =
          0.15 + Math.sin(timeSec * 2.2) * 0.12 + (isHovered ? 0.15 : 0);
        this.auraLight.intensity = isHovered ? 0.85 : 0.45;
      },
    };
    return group;
  }

  // PRINCIPIA — classical mechanics sandbox (pendulum, incline, forces, orbit)
  function buildPrincipiaPhysics() {
    var group = new THREE.Group();
    var auraLight = addHoverAura(group, 0xffa044, 0.45);

    // Lab base plate
    var base = new THREE.Mesh(
      new THREE.BoxGeometry(1.05, 0.06, 0.72),
      matPCB,
    );
    base.position.y = 0.03;
    group.add(base);
    addBlueprintEdges(base, 0xffa044, 0.5);

    // Pendulum frame + bob
    var pendFrame = new THREE.Group();
    var pLeft = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.62, 0.05),
      matHull,
    );
    pLeft.position.set(-0.22, 0.34, 0);
    pendFrame.add(pLeft);
    var pRight = pLeft.clone();
    pRight.position.x = 0.22;
    pendFrame.add(pRight);
    var pBar = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.04, 0.04),
      matGold,
    );
    pBar.position.y = 0.62;
    pendFrame.add(pBar);

    var pendPivot = new THREE.Group();
    pendPivot.position.set(0, 0.6, 0);
    var pendRod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, 0.38, 6),
      matGold,
    );
    pendRod.position.y = -0.19;
    pendPivot.add(pendRod);
    var pendBob = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 12, 12),
      matGlowAmber,
    );
    pendBob.position.y = -0.38;
    pendPivot.add(pendBob);
    pendFrame.add(pendPivot);
    pendFrame.position.set(-0.28, 0.06, 0.12);
    group.add(pendFrame);

    // Inclined plane + sliding block
    var inclineGroup = new THREE.Group();
    var ramp = new THREE.Mesh(
      new THREE.BoxGeometry(0.52, 0.04, 0.32),
      matHull,
    );
    ramp.rotation.z = 0.42;
    ramp.position.set(0.08, 0.14, 0);
    inclineGroup.add(ramp);
    addBlueprintEdges(ramp, 0xffa044);

    var block = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.12, 0.12),
      matGlowCyan,
    );
    block.position.set(-0.04, 0.24, 0);
    inclineGroup.add(block);
    inclineGroup.position.set(0.22, 0.06, -0.14);
    group.add(inclineGroup);

    // Force vectors on the block (weight, normal, friction)
    group.add(
      addForceArrow(
        new THREE.Vector3(0.18, 0.28, -0.14),
        new THREE.Vector3(0, -1, 0),
        0.22,
        0xff3344,
        1.1,
      ),
    );
    group.add(
      addForceArrow(
        new THREE.Vector3(0.18, 0.28, -0.14),
        new THREE.Vector3(0.35, 0.55, 0),
        0.18,
        0x00ff88,
        0.9,
      ),
    );
    group.add(
      addForceArrow(
        new THREE.Vector3(0.18, 0.28, -0.14),
        new THREE.Vector3(-0.45, 0.15, 0),
        0.14,
        0xffa044,
        0.85,
      ),
    );

    // Orbital demo — sun + planet (Newtonian gravitation)
    var orbitGroup = new THREE.Group();
    var sun = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 12, 12),
      matGlowAmber,
    );
    orbitGroup.add(sun);
    var orbitPath = new THREE.Mesh(
      new THREE.TorusGeometry(0.28, 0.006, 6, 32),
      new THREE.MeshBasicMaterial({
        color: 0xffa044,
        transparent: true,
        opacity: 0.35,
      }),
    );
    orbitPath.rotation.x = Math.PI / 2;
    orbitGroup.add(orbitPath);
    var planetPivot = new THREE.Group();
    var planet = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 10, 10),
      matGlowCyan,
    );
    planet.position.x = 0.28;
    planetPivot.add(planet);
    orbitGroup.add(planetPivot);
    orbitGroup.position.set(0.02, 0.48, 0.18);
    group.add(orbitGroup);

    group.userData = {
      auraLight: auraLight,
      pendPivot: pendPivot,
      block: block,
      planetPivot: planetPivot,
      tick: function (dtMs, isHovered) {
        var timeSec = Date.now() * 0.001;
        this.pendPivot.rotation.z = Math.sin(timeSec * 2.2) * 0.55;
        this.block.position.x = -0.04 + Math.sin(timeSec * 1.6) * 0.14;
        this.block.position.y = 0.24 + Math.sin(timeSec * 1.6) * 0.04;
        this.planetPivot.rotation.y = timeSec * (isHovered ? 1.1 : 0.65);
        this.auraLight.intensity = isHovered ? 0.8 : 0.42;
      },
    };
    return group;
  }

  // NULLSHELL — C++ POSIX shell (terminal + pipeline + hollow core)
  function buildNullshell() {
    var group = new THREE.Group();
    var auraLight = addHoverAura(group, 0x00ff88, 0.45);

    // Terminal chassis
    var termGroup = new THREE.Group();
    var bezel = new THREE.Mesh(
      new THREE.BoxGeometry(0.92, 0.58, 0.1),
      matHull,
    );
    termGroup.add(bezel);
    addBlueprintEdges(bezel, 0x00ff88);

    var termScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.8, 0.44),
      new THREE.MeshStandardMaterial({
        color: 0x010a08,
        emissive: 0x00ff88,
        emissiveIntensity: 0.55,
        roughness: 0.25,
      }),
    );
    termScreen.position.z = 0.055;
    termGroup.add(termScreen);

    // Prompt lines
    var promptMat = new THREE.MeshStandardMaterial({
      color: 0x00ff88,
      emissive: 0x00ff88,
      emissiveIntensity: 0.9,
    });
    [
      { y: 0.12, w: 0.52 },
      { y: 0.04, w: 0.38 },
      { y: -0.04, w: 0.62 },
      { y: -0.12, w: 0.28 },
    ].forEach(function (line) {
      var row = new THREE.Mesh(
        new THREE.BoxGeometry(line.w, 0.012, 0.002),
        promptMat,
      );
      row.position.set(-0.12, line.y, 0.06);
      termScreen.add(row);
    });

    // Blinking cursor
    var cursor = new THREE.Mesh(
      new THREE.BoxGeometry(0.018, 0.022, 0.003),
      matGlowTeal,
    );
    cursor.position.set(0.18, -0.12, 0.01);
    termScreen.add(cursor);

    termGroup.position.y = 0.34;
    group.add(termGroup);

    // Process pipeline: [grep] | [awk] | [sort]
    var pipeGroup = new THREE.Group();
    var procNames = ["grep", "awk", "sort"];
    var procBoxes = [];
    procNames.forEach(function (name, pi) {
      var proc = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.1, 0.08),
        matPCB,
      );
      proc.position.set(-0.28 + pi * 0.28, 0.08, 0.18);
      pipeGroup.add(proc);
      addBlueprintEdges(proc, 0x00ff88, 0.7);
      procBoxes.push(proc);

      if (pi < procNames.length - 1) {
        var pipe = new THREE.Mesh(
          new THREE.CylinderGeometry(0.018, 0.018, 0.06, 8),
          matGlowTeal,
        );
        pipe.rotation.z = Math.PI / 2;
        pipe.position.set(-0.14 + pi * 0.28, 0.08, 0.18);
        pipeGroup.add(pipe);
      }
    });
    group.add(pipeGroup);

    // Hollow wireframe cube — the "null" shell around the process
    var shellCube = new THREE.Mesh(
      new THREE.BoxGeometry(0.72, 0.72, 0.72),
      new THREE.MeshStandardMaterial({
        color: 0x021810,
        emissive: 0x00ff88,
        emissiveIntensity: 0.35,
        transparent: true,
        opacity: 0.18,
        wireframe: true,
      }),
    );
    shellCube.position.y = 0.38;
    group.add(shellCube);

    var innerVoid = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.38, 0.38),
      new THREE.MeshStandardMaterial({
        color: 0x000000,
        emissive: 0x004422,
        emissiveIntensity: 0.25,
        transparent: true,
        opacity: 0.6,
      }),
    );
    innerVoid.position.y = 0.38;
    group.add(innerVoid);

    group.userData = {
      auraLight: auraLight,
      cursor: cursor,
      procBoxes: procBoxes,
      shellCube: shellCube,
      tick: function (dtMs, isHovered) {
        var timeSec = Date.now() * 0.001;
        this.cursor.material.emissiveIntensity =
          Math.sin(timeSec * 5.5) > 0 ? 1.2 : 0.05;
        this.procBoxes.forEach(function (box, i) {
          box.material.emissiveIntensity =
            0.2 + Math.abs(Math.sin(timeSec * 2.4 + i * 1.2)) * 0.6;
        });
        this.shellCube.rotation.y = timeSec * 0.35;
        this.shellCube.rotation.x = Math.sin(timeSec * 0.5) * 0.12;
        this.auraLight.intensity = isHovered ? 0.8 : 0.42;
      },
    };
    return group;
  }

  var extraProjectFactories = {
    AEGIS: buildAegisRadar,
    SENTINEL: buildSentinelController,
    BALLISTA: buildBallista,

    RAYBORN: buildRaybornTerminal,
    GENESIS: buildGenesisEngine,
    SPLICE: buildSpliceEngine,
    "SPLICE ENGINE": buildSpliceEngine,
    "SPLICE-ENGINE": buildSpliceEngine,

    NOORMAP: buildNoormap,
    PRINCIPIA: buildPrincipiaPhysics,
    NULLSHELL: buildNullshell,
  };

  // =========================================================================
  // GLOBAL FACTORY REGISTRATION
  // =========================================================================
  window.Gravitas = window.Gravitas || {};
  window.Gravitas.PortalModels = {
    // 1. ORIGINAL DETAILED GATE BUILDER
    build: function (track, opts) {
      skipBlueprintEdges = !!(opts && opts.bayMode);
      try {
        if (track === "systems") {
          return buildAegisRadar();
        } else if (track === "creative") {
          return buildSpliceEngine();
        } else if (track === "startup") {
          return buildSentinelController();
        }
        return buildAegisRadar();
      } catch (e) {
        console.error("GravitasPortalModels Error:", e);
        return new THREE.Group();
      } finally {
        skipBlueprintEdges = false;
      }
    },

    // 2. EXTRA PROJECT INSPECTION BUILDER (scan bay only — skip edges)
    buildProjectModel: function (projectName) {
      skipBlueprintEdges = true;
      try {
        if (!projectName) return buildAegisRadar();
        var key = String(projectName).toUpperCase().trim();
        var factory = extraProjectFactories[key];
        if (factory) return factory();

        if (key.indexOf("SENTINEL") !== -1) return buildSentinelController();
        if (key.indexOf("RAYBORN") !== -1) return buildRaybornTerminal();
        if (key.indexOf("SPLICE") !== -1) return buildSpliceEngine();
        if (key.indexOf("AEGIS") !== -1) return buildAegisRadar();

        return buildAegisRadar();
      } finally {
        skipBlueprintEdges = false;
      }
    },
  };
})();

function createGoldNoiseTexture(size) {
  size = size || 128;
  var canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  var ctx = canvas.getContext("2d");

  var imgData = ctx.createImageData(size, size);
  var data = imgData.data;
  for (var i = 0; i < data.length; i += 4) {
    var val = Math.floor(180 + Math.random() * 60);
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
    data[i + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);

  ctx.strokeStyle = "rgba(160, 160, 160, 0.35)";
  ctx.lineWidth = 0.5;
  for (var s = 0; s < 60; s++) {
    var x = Math.random() * size;
    var y = Math.random() * size;
    var len = 4 + Math.random() * 10;
    var angle = Math.random() * Math.PI;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
    ctx.stroke();
  }

  var texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  return texture;
}

var sharedGoldNoiseTex = null;

function getSharedGoldNoiseTexture() {
  if (!sharedGoldNoiseTex) {
    sharedGoldNoiseTex = createGoldNoiseTexture(128);
  }
  return sharedGoldNoiseTex;
}

function disposeHierarchy(node, disposeTextures) {
  if (!node) return;
  if (disposeTextures === undefined) disposeTextures = true;

  node.traverse(function (child) {
    if (child.geometry) {
      child.geometry.dispose();
    }
    if (child.material) {
      var materials = Array.isArray(child.material)
        ? child.material
        : [child.material];
      materials.forEach(function (mat) {
        if (disposeTextures) {
          for (var key in mat) {
            if (
              mat[key] &&
              typeof mat[key] === "object" &&
              mat[key] !== null &&
              mat[key].isTexture
            ) {
              mat[key].dispose();
            }
          }
        }
        mat.dispose();
      });
    }
  });
}

function createUmayyadStarMesh() {
  var group = new THREE.Group();
  var noiseTex = getSharedGoldNoiseTexture();

  var goldMat = new THREE.MeshStandardMaterial({
    color: 0xffd275,
    roughness: 0.2,
    metalness: 0.9,
    emissive: 0x523d10,
    emissiveIntensity: 0.45,
    roughnessMap: noiseTex,
    bumpMap: noiseTex,
    bumpScale: 0.015,
  });

  var tealMat = new THREE.MeshStandardMaterial({
    color: 0x3df0e6,
    metalness: 0.5,
    roughness: 0.15,
    emissive: 0x2bb8b0,
    emissiveIntensity: 1.35,
  });

  var depth = 0.22;
  var sqSize = 2.1;
  var wallThick = 0.16;

  function createSquareFrame(rotationAngle) {
    var frameGroup = new THREE.Group();
    var half = sqSize / 2;
    var sideGeo = new THREE.BoxGeometry(sqSize, wallThick, depth);

    var top = new THREE.Mesh(sideGeo, goldMat);
    top.position.set(0, half - wallThick / 2, 0);
    frameGroup.add(top);

    var bottom = new THREE.Mesh(sideGeo, goldMat);
    bottom.position.set(0, -half + wallThick / 2, 0);
    frameGroup.add(bottom);

    var sideVertGeo = new THREE.BoxGeometry(
      wallThick,
      sqSize - wallThick * 2,
      depth,
    );
    var left = new THREE.Mesh(sideVertGeo, goldMat);
    left.position.set(-half + wallThick / 2, 0, 0);
    frameGroup.add(left);

    var right = new THREE.Mesh(sideVertGeo, goldMat);
    right.position.set(half - wallThick / 2, 0, 0);
    frameGroup.add(right);

    frameGroup.rotation.z = rotationAngle;
    return frameGroup;
  }

  group.add(createSquareFrame(0));
  group.add(createSquareFrame(Math.PI / 4));

  var ringGeo = new THREE.TorusGeometry(0.56, 0.08, 12, 24);
  var ringMesh = new THREE.Mesh(ringGeo, tealMat);
  group.add(ringMesh);

  var coreGeo = new THREE.CylinderGeometry(0.24, 0.24, depth * 1.1, 12);
  var coreMat = new THREE.MeshStandardMaterial({
    color: 0x66ffff,
    metalness: 0.1,
    roughness: 0.05,
    emissive: 0x2bb8b0,
    emissiveIntensity: 2.2,
  });
  var core = new THREE.Mesh(coreGeo, coreMat);
  core.rotation.x = Math.PI / 2;
  group.add(core);

  return group;
}

function mountStarLogo(container) {
  if (!container)
    return {
      resize: function () {},
      pause: function () {},
      resume: function () {},
      destroy: function () {},
    };

  var w = container.clientWidth || 40,
    h = container.clientHeight || 40;
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 20);
  camera.position.set(0, 0, 4.2);

  var renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
  renderer.setSize(w, h);
  container.appendChild(renderer.domElement);

  var starMesh = createUmayyadStarMesh();
  scene.add(starMesh);

  scene.add(new THREE.AmbientLight(0x806848, 2.2));

  var teal = new THREE.PointLight(0x36ffd9, 3.5, 15);
  teal.position.set(2, 1.5, 3);
  scene.add(teal);

  var ochre = new THREE.PointLight(0xffc552, 3.0, 15);
  ochre.position.set(-2, -1, 2);
  scene.add(ochre);

  var centerGlow = new THREE.PointLight(0x2bb8b0, 2.8, 6);
  centerGlow.position.set(0, 0, 1);
  scene.add(centerGlow);

  var isRunning = false;
  var animFrameId = null;

  function resize() {
    var nw = container.clientWidth || w,
      nh = container.clientHeight || h;
    if (nw === 0 || nh === 0) return;
    camera.aspect = nw / nh;
    camera.updateProjectionMatrix();
    renderer.setSize(nw, nh);
  }

  function tick() {
    if (!isRunning) return;
    animFrameId = requestAnimationFrame(tick);
    starMesh.rotation.y += 0.012;
    starMesh.rotation.x = Math.sin(Date.now() * 0.0006) * 0.18;
    renderer.render(scene, camera);
  }

  function resume() {
    if (isRunning) return;
    isRunning = true;
    tick();
  }

  function pause() {
    isRunning = false;
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
  }

  function destroy() {
    pause();
    if (starMesh) {
      scene.remove(starMesh);
      disposeHierarchy(starMesh, false);
    }
    if (renderer) {
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    }
  }

  resume();

  return { resize: resize, pause: pause, resume: resume, destroy: destroy };
}

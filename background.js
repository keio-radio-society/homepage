let scene, camera, renderer, starGeo, starField, shaderMaterial;
let startTime = Date.now();

function initBackground() {
  // シーンとカメラの設定
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.z = 1;
  camera.rotation.x = Math.PI / 2;

  // レンダラーの作成
  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById("container").appendChild(renderer.domElement);

  // 星空用の BufferGeometry を作成
  starGeo = new THREE.BufferGeometry();
  const starCount = 30000;
  const positions = [];
  const colors = [];
  const blinkOffsets = [];

  for (let i = 0; i < starCount; i++) {
    positions.push(
      Math.random() * 600 - 300,
      Math.random() * 600 - 300,
      Math.random() * 600 - 300
    );
    const col = new THREE.Color();
    col.setHSL(
      Math.random(),
      0.4 + 0.3 * Math.random(),
      0.8 + 0.2 * Math.random()
    );
    colors.push(col.r, col.g, col.b);
    blinkOffsets.push(Math.random() * Math.PI * 2);
  }

  starGeo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  starGeo.setAttribute("customColor", new THREE.Float32BufferAttribute(colors, 3));
  starGeo.setAttribute("blinkOffset", new THREE.Float32BufferAttribute(blinkOffsets, 1));

  // カスタムシェーダーの定義
  const vertexShader = `
    attribute float blinkOffset;
    attribute vec3 customColor;
    varying vec3 vColor;
    varying float vBlink;
    uniform float time;
    uniform float baseSize;
    void main() {
      vColor = customColor;
      float blink = abs(sin(time + blinkOffset));
      vBlink = blink;
      gl_PointSize = baseSize * (0.9 + 0.1 * blink);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;
  const fragmentShader = `
    uniform sampler2D pointTexture;
    varying vec3 vColor;
    varying float vBlink;
    void main() {
      vec4 textureColor = texture2D(pointTexture, gl_PointCoord);
      gl_FragColor = vec4(vColor * textureColor.rgb, textureColor.a * vBlink);
    }
  `;

  shaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      baseSize: { value: 5.0 },
      pointTexture: { value: new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/disc.png') }
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
    vertexColors: true,
    blending: THREE.AdditiveBlending
  });

  // パーティクル群の作成とシーンへの追加
  starField = new THREE.Points(starGeo, shaderMaterial);
  scene.add(starField);

  window.addEventListener("resize", onWindowResize, false);
  animateBackground();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animateBackground() {
  // パーティクルの Y 軸方向の移動
  const positions = starGeo.attributes.position.array;
  for (let i = 1; i < positions.length; i += 3) {
    positions[i] -= 0.2;
    if (positions[i] < -200) {
      positions[i] = 200;
    }
  }
  starGeo.attributes.position.needsUpdate = true;

  // シェーダー用時間の更新
  shaderMaterial.uniforms.time.value = (Date.now() - startTime) * 0.002;

  renderer.render(scene, camera);
  requestAnimationFrame(animateBackground);
}

// 初期化
initBackground();

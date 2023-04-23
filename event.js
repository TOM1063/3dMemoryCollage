window.addEventListener("resize", () => {
  (size.width = window.innerWidth), (size.height = window.innerHeight);
  camera.aspect = size.width / size.height;
  camera.updateProjectionMatrix();
  renderer.setSize(size.width, size.height);

  fbx_model.traverse((child) => {
    if (child.isMesh) {
      child.material.uWindowSizeX = size.width;
      child.material.uWindowSizeY = size.height;
    }
  });
});

// 画面が読み込まれたらすぐに動かしたい場合の記述
$(window).on("load", function () {
  TypingInit(); //初期設定
  TypingAnime(); /* アニメーション用の関数を呼ぶ*/
}); // ここまで画面が読み込まれたらすぐに動かしたい場合の記述

window.addEventListener("mousemove", function (e) {
  mouse_prev = mouse;
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
});

window.addEventListener(
  "keydown",
  function (e) {
    console.log("key_down : " + String(e.code));
    switch (e.code) {
      case "KeyW": // w
        console.log("move forwerd");
        key_state.moveForward = true;
        break;
      case "KeyD": // a
        key_state.moveLeft = true;
        break;
      case "KeyS": // s
        key_state.moveBackward = true;
        break;
      case "KeyA": // d
        key_state.moveRight = true;
        break;
    }
  },
  false
);

window.addEventListener(
  "keyup",
  function (e) {
    switch (e.code) {
      case "KeyW": // w
        key_state.moveForward = false;
        break;
      case "KeyD": // a
        key_state.moveLeft = false;
        break;
      case "KeyS": // s
        key_state.moveBackward = false;
        break;
      case "KeyA": // d
        key_state.moveRight = false;
        break;
    }
  },
  false
);

import * as THREE from "https://unpkg.com/three@0.130.1/build/three.module.js";

export const update_freeCamera = (target_camera, util, mouse, key_state) => {
  const view_arround_factor = 3.14 / 2;
  let yaw = mouse.x * view_arround_factor * 1.2;
  let pitch = mouse.y * (-3.14 / 2);
  let yaw_thresh = 3.14 / 2 - 0.1;
  if (Math.abs(yaw) < yaw_thresh) {
    util.head_rot.x = yaw;
  } else if (yaw < -yaw_thresh) {
    util.body_rot.x -= 0.01;
  } else if (yaw > yaw_thresh) {
    util.body_rot.x += 0.01;
  }
  util.rot.x = util.head_rot.x + util.body_rot.x;
  util.rot.y = pitch;

  util.dir.x = Math.sin(-util.rot.x) * Math.cos(util.rot.y);
  util.dir.z = Math.cos(util.rot.x) * Math.cos(util.rot.y);
  util.dir.y = Math.sin(util.rot.y);

  let forward_vel = util.dir;
  let right_vel = new THREE.Vector3(
    Math.cos(util.rot.x),
    0,
    Math.sin(util.rot.x)
  );
  let vel_x =
    forward_vel.x * Number(key_state.moveForward) -
    forward_vel.x * Number(key_state.moveBackward) +
    right_vel.x * Number(key_state.moveRight) -
    right_vel.x * Number(key_state.moveLeft);
  let vel_z =
    forward_vel.z * Number(key_state.moveForward) -
    forward_vel.z * Number(key_state.moveBackward) +
    right_vel.z * Number(key_state.moveRight) -
    right_vel.z * Number(key_state.moveLeft);
  let vel_y =
    forward_vel.y * Number(key_state.moveForward) -
    forward_vel.y * Number(key_state.moveBackward) +
    right_vel.y * Number(key_state.moveRight) -
    right_vel.y * Number(key_state.moveLeft);
  //let vel2 = (right_vel * Number(moveRight)).sub(right_vel * Number(moveLeft));
  //let vel = vel1.add(vel2) * speed;
  const motion_factor = 0.5;
  let speed = motion_factor;

  util.pos.x += vel_x * speed;
  util.pos.y += vel_y * speed;
  util.pos.z += vel_z * speed;

  target_camera.position.set(util.pos.x, util.pos.y, util.pos.z);
  const direction_factor = 1;
  util.look.x = util.pos.x + util.dir.x * direction_factor;
  util.look.y = util.pos.y + util.dir.y * direction_factor;
  util.look.z = util.pos.z + util.dir.z * direction_factor;
  target_camera.lookAt(util.look.x, util.look.y, util.look.z);
};

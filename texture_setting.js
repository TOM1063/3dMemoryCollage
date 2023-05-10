//set links here!

export const setting_db = {
  buildings: [
    { name: "structure", model: "structure_mesh.fbx" },
    { name: "pointcloud", model: "memory.fbx" },
  ],
  building_tex: [
    { class_name: "steel", texture: "test0.jpg" },
    { class_name: "concrete", texture: "test1.jpg" },
    { class_name: "tesuri", texture: "test3.jpg" },
    { class_name: "panel", texture: "test4.jpg" },
    { class_name: "roof", texture: "test2.jpg" },
    { class_name: "Aluminum", texture: "test3.jpg" },
  ],
  memories_tex: [
    {
      class_name: "欠けた壁",
      video: "欠けた壁.mp4",
      texture: ["欠けた壁1.jpg", "欠けた壁2.jpg", "欠けた壁3.jpg"],
    },
    {
      class_name: "敷かれたブルーシートとブロック",
      video: "道路の方が高いらしい.mp4",
      texture: ["屋上1.jpg", "屋上2.jpg", "屋上3.jpg"],
    },
    {
      class_name: "穴の開いた壁_南",
      video: "切られたブロック塀.mp4",
      texture: ["hole_s_1_2.jpg", "hole_s_2_2.jpg", "hole_w_2_2.jpg"],
    },
    {
      class_name: "穴の開いた壁_西",
      video: "さびの跡.mp4",
      texture: ["hole_w_1.jpg", "hole_w_2.jpg", "hole_w_2.jpg"],
    },
    {
      class_name: "歪んだ庇",
      video: "歪んだ庇.mp4",
      texture: ["歪んだ庇1.jpg", "歪んだ庇2.jpg", "歪んだ庇3.jpg"],
    },
    {
      class_name: "くぼんだ地面",
      video: "どこへ続く管.mp4",
      texture: ["小さな橋3.jpg", "小さな橋1.jpg", "小さな橋2.jpg"],
    },
  ],
};

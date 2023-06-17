# 3dMemoryCollage(ENG)

This is an experiment on how to visualize memories using 3D web technology.
It allows for organizing and presenting information using 3D models as a framework.

# How it works

To create a 3D object-oriented memory index, this web program requires three materials:

- 3D Model -- .fbx format
- Photos and videos
- Documents

Once you upload and configure these elements correctly, the program will compose them and generate 3D scenes, acting just like "glue".

# Preparing models

The program loads .fbx models located in the root/fbx/ directory. There should be two models with different names: one for memory-related objects and the other for normal building objects (pointcloud_2.fbx and building.fbx in the provided example).

Memory-related objects should have a "name" property assigned to them. The program will use these names as keys to establish memory relations. The example files were exported from Rhinoceros, and the fbx name properties were directly converted from Rhino layer names, making it simple!

You also need to configure the "buildings" in the texture_setting.js file to ensure the program recognizes these models.

```js
export const setting_db = {
buildings: [
{ name: "structure", model: "building.fbx" },
{ name: "pointcloud", model: "pointcloud_2.fbx" },
],
...
```

# Preparing images

The program loads pictures and movies located in the root/shader/imgs/memories/ directory.

One notable feature of this memory collage system is the seamless navigation through the images. To achieve this, all images are loaded at once. Therefore, image sizes should be small (around 100kb for images and low-resolution movies at 10fps, as shown in the example).

After placing the images, configure the "memories_tex" in the texture_setting.js file.

```js
...
memories_tex: [
{
class_name: "欠けた壁",
video: "5_clucked_wall.mp4",
texture: ["5_1.jpg", "5_2.jpg", "5_3.jpg"],
},
{
class_name: "敷かれたブルーシートとブロック",
video: "15_bluesheet.mp4",
texture: ["15_1.jpg", "15_2.jpg", "14_2.jpg"],
},
...
```

You can also define building textures for "non-memory-related objects" based on their respective names.

```js
...
building_tex: [
{ class_name: "steel", texture: "test0.jpg" },
{ class_name: "concrete", texture: "test1.jpg" },
{ class_name: "tesuri", texture: "test3.jpg" },
{ class_name: "panel", texture: "test4.jpg" },
{ class_name: "roof", texture: "test2.jpg" },
{ class_name: "Aluminum", texture: "test3.jpg" },
],
...
```

# Documents

You can add documents for each memory-related object in...

```js
...
memories_tex: [
{
class_name: "欠けた壁",
video: "5_clucked_wall.mp4",
texture: ["5_1.jpg", "5_2.jpg", "5_3.jpg"],
},
{
class_name: "敷かれたブルーシートとブロック",
video: "15_bluesheet.mp4",
texture: ["15_1.jpg", "15_2.jpg", "14_2.jpg"],
},
{
class_name: "穴の開いた壁_南",
video: "4_east_neighbor.mp4",
texture: ["3_1.jpg", "3_2.jpg", "3_2.jpg"],
},
...
```

That's it!

Deploy and enjoy!

# 3dMemoryCollage（日本語）

これは、3D ウェブを使用して記憶を視覚化する方法を試す実験です。

3D モデルを骨格とした記憶の索引化と可視化が可能です。

# 動作原理

このウェブプログラムでは、3 つの素材が必要です。

- 3D モデル - .fbx 形式
- 写真と動画
- ドキュメント
  これらすべてをアップロードし、適切に設定した後、プログラムはそれらを組み合わせ、3D シーンを生成します。これにより、まるで「接着剤」のような役割を果たします。

# モデルの準備

このプログラムは、root/fbx/ディレクトリに配置された fbx モデルを読み込みます。異なる名前の 2 つのモデルが必要であり、それぞれは記憶に関連するオブジェクトと通常の建物オブジェクトです（例では pointcloud_2.fbx と building.fbx です）。

記憶に関連するオブジェクトには「name」プロパティが必要です。プログラムはこれらの名前をキーとして使用し、記憶の関係を構築します。例のファイルは Rhinoceros からエクスポートされたものです。fbx の名前プロパティは、おそらく Rhino のレイヤー名から直接変換されているようです。非常に簡単です！

次に、texture_setting.js の「buildings」を設定して、プログラムがこれらのモデルを認識するようにします。

```js
export const setting_db = {
buildings: [
{ name: "structure", model: "building.fbx" },
{ name: "pointcloud", model: "pointcloud_2.fbx" },
],
...

```

# 画像の準備

このプログラムは、root/shader/imgs/memories/ディレクトリに配置された写真と動画を読み込みます。

このメモリコラージュシステムには、シームレスに画像を移動できる素晴らしい機能があります。これを可能にするために、最初にすべての画像を読み込みます。ただし、コンピュータのメモリを多く必要とします。そのため、画像サイズは小さくする必要があります（例では約 100kb の画像、10fps の低解像度の動画です）。

画像を配置した後、texture_setting.js の「memories_tex」を設定します。

```js
...
memories_tex: [
{
class_name: "欠けた壁",
video: "5_clucked_wall.mp4",
texture: ["5_1.jpg", "5_2.jpg", "5_3.jpg"],
},
{
class_name: "敷かれたブルーシートとブロック",
video: "15_bluesheet.mp4",
texture: ["15_1.jpg", "15_2.jpg", "14_2.jpg"],
},
...
```

また、各オブジェクトの名前ごとに「記憶に関連しないオブジェクト」のための通常の建物のテクスチャを定義することもできます。

```js
...
building_tex: [
{ class_name: "steel", texture: "test0.jpg" },
{ class_name: "concrete", texture: "test1.jpg" },
{ class_name: "tesuri", texture: "test3.jpg" },
{ class_name: "panel", texture: "test4.jpg" },
{ class_name: "roof", texture: "test2.jpg" },
{ class_name: "Aluminum", texture: "test3.jpg" },
],
...
```

# ドキュメント

記憶に関連する各オブジェクトごとにドキュメントを追加できます

```js
...
memories_tex: [
{
class_name: "欠けた壁",
video: "5_clucked_wall.mp4",
texture: ["5_1.jpg", "5_2.jpg", "5_3.jpg"],
},
{
class_name: "敷かれたブルーシートとブロック",
video: "15_bluesheet.mp4",
texture: ["15_1.jpg", "15_2.jpg", "14_2.jpg"],
},
{
class_name: "穴の開いた壁_南",
video: "4_east_neighbor.mp4",
texture: ["3_1.jpg", "3_2.jpg", "3_2.jpg"],
},
...
```

以上です。

デプロイしてお楽しみください！

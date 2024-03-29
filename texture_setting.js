//set links here!

export const setting_db = {
  buildings: [
    { name: "structure", model: "building.fbx" },
    { name: "pointcloud", model: "pointcloud_2.fbx" },
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
    {
      class_name: "穴の開いた壁_西",
      video: "4_east_neighbor2.mp4",
      texture: ["4_1.jpg", "4_2.jpg", "4-1_2.jpg"],
    },
    {
      class_name: "歪んだ庇",
      video: "6_wounded_loof.mp4",
      texture: ["6_1.jpg", "6_2.jpg", "6_3.jpg"],
    },
    {
      class_name: "くぼんだ地面",
      video: "13_small_bridge.mp4",
      texture: ["13_1.jpg", "13_2.jpg", "13_3.jpg"],
    },
    {
      class_name: "西側道路",
      video: "12_west_load.mp4",
      texture: ["12_1_2.jpg", "12_2_2.jpg", "12_3_2.jpg"],
    },
    {
      class_name: "境界標",
      video: "11_boundary_sign.mp4",
      texture: ["11_1.jpg", "11_2.jpg", "11_3.jpg"],
    },
    {
      class_name: "水道管",
      video: "8_water_duct.mp4",
      texture: ["8_1.jpg", "8_2.jpg", "8_3.jpg"],
    },
    {
      class_name: "倉庫が一番古い",
      video: "0_oldest_warehouse.mp4",
      texture: ["0_1.jpg", "0_2.jpg", "0_2.jpg"],
    },
    {
      class_name: "西側境界",
      video: "9_no_wall.mp4",
      texture: ["9_1.jpg", "9_2.jpg", "9_1.jpg"],
    },
    {
      class_name: "区画整理",
      video: "16_kukakuseiri.mp4",
      texture: ["16_1.jpg", "16_2.jpg", "16_3.jpg"],
    },
    {
      class_name: "手入れ",
      video: "0_maintenance.mp4",
      texture: ["0_1.jpg", "0_2.jpg", "0_1.jpg"],
    },
    {
      class_name: "錆びた壁",
      video: "7_rust_wall.mp4",
      texture: ["7_1.jpg", "7_2.jpg", "7_3.jpg"],
    },
    {
      class_name: "東隣の敷地",
      video: "4_east_neighbor3.mp4",
      texture: ["4_1.jpg", "4_2.jpg", "4-1_4.jpg"],
    },
    {
      class_name: "ガタガタの縁",
      video: "14_edge.mp4",
      texture: ["14_1.jpg", "14_2.jpg", "14_1.jpg"],
    },
    {
      class_name: "塀",
      video: "10_cutted.mp4",
      texture: ["10_1.jpg", "10_4.jpg", "10_5.jpg"],
    },
  ],

  memories_doc: [
    {
      class_name: "欠けた壁",
      document:
        "壁の両端下部が欠けている。昔飼っていた犬がリードを引っ掛け割ったらしい。コンセントの配線管をみるとリードのチェーンをつけていた跡が錆跡として残っている。",
    },
    {
      class_name: "敷かれたブルーシートとブロック",
      document:
        "天井をみると朱色の鉄骨が白く色づいているのがわかる。これが腐食のサインである。腐食部から雨漏りがするため、住民（男性）がシリコンシーラーで腐食部をシーリングしたそうだ。それでは雨漏りを防ぐだけで腐食は進んでしまう。腐食は屋上のコンクリートのひび割れから雨水が流れ込みその下のデッキプレートに接することで起こってしまう。ひび割れを防ぐために住民（女性）はいくつかの方法をとったという。最初は防水モルタルを施工した。しかし1、2年程度でまたひび割れてしまう。モルタルの施工は大変であったためか、その次は防水ペンキを試したそうだ。しかし、これも1年でダメになってしまう。最終的に彼女はブルーシートで屋上を覆うことにした。風で飛ばされないようにコンクリートブロックやナーセリーポットという植木の鉢を重しにしたため、現在のような様子が屋上に現れているそうだ。",
    },
    {
      class_name: "穴の開いた壁_南",
      document:
        "壁に空いた穴は約15年前（2010年頃）球技（サッカー・野球）をしていて開けたものである。ひらけた庭と屋根の高い倉庫は少年らが球技をするのにちょうどいい空間をつくっていた。敷地西部に建つ倉庫の屋根は西日を遮るため、毎週のように球技をしていたんだと。何度か壁にボールを当てているうちにひびが入り、壁が抜け落ちたのだ。",
    },
    {
      class_name: "穴の開いた壁_西",
      document:
        "壁に空いた穴は約15年前（2010年頃）球技（サッカー・野球）をしていて開けたものである。ひらけた庭と屋根の高い倉庫は少年らが球技をするのにちょうどいい空間をつくっていた。敷地西部に建つ倉庫は西日を遮るため、毎週のように球技をしていたんだと。何度か壁にボールを当てているうちにひびが入り、壁が抜け落ちたのだ。野球をする場合は日を避けるため、バッターは屋根の下に立ち、東を向き、バットを振るのがここのルールであった。気持ちよく当たったボールはよく東隣地へ塀を飛び越えて飛んでいった。",
    },
    {
      class_name: "歪んだ庇",
      document:
        "倉庫出入口の庇が凹み歪んでいる。これは植木を積み下ろししている際にクレーンを落として歪めたらしい。",
    },
    {
      class_name: "くぼんだ地面",
      document:
        "倉庫の出入口手前に橋が架けられている。よくみるとその下には溝のようなものが掘られている。これは倉庫内に雨水が流れ込まないように住民（女性）が施した対策だそうだ。溝の続く先に目をやると倉庫を囲うように掘られていることに気づく。溝の終わりまでゆくと堀が掘られている。そこは庭から倉庫に流れ込む雨水を溜める掘だった。雨水を溜める堀は道路側の堀だけでなく、敷地内に合計3つある。",
    },
    {
      class_name: "西側道路",
      document:
        "塀の基礎部分を見るとアスファルトの下に隠れていることがわかる。これはアスファルトが塀よりも後に施工されたことを示している。塀が建てられた頃（1975年頃）、道はまだ砂利だったという。車が通ると砂利をはじき轍をつくり、道路がボコボコになる。補修するたびに、砂利を敷き平らにするため、道路が目測で30㎝ほど高くなっていったのだという。現在、倉庫のフロアラインは道路より16cm低い。",
    },
    {
      class_name: "境界標",
      document:
        "塀から50㎝離れた位置に敷地境界標がさしてある。これは1960年代に迎えたモータリゼーションの影響の表れである。以前の道幅では車両が通ることができなくなり、手間のかかる行政手続きはせず、道路を通す公共性を優先し敷地を分け与えたのだと考えられる。",
    },
    {
      class_name: "水道管",
      document:
        "倉庫の内部を見渡すと1本、屋上へのびる管があることに気付く。これは水道管である。この倉庫は屋上に家を増築できるように計画されたため、水道管が通っているのだ。今は、凍結で壊れてしまい、水道は通っていない。",
    },
    {
      class_name: "倉庫が一番古い",
      document:
        " 100年以上前、開墾して先代が住み始めた。現存する物の中で一番古いのは倉庫と塀で約50年(1973年)だという。青い家や庭は約27年前(1996年)。ベージュの家は12年前(2011年)。最年長の倉庫に残る傷が敷地内の活動を記録しているともいえるのだ。",
    },
    {
      class_name: "西側境界",
      document:
        "西隣家からみると、敷地との境界線に塀がないことに気付く。境界が倉庫の外壁でつくられている。正確に言うと、敷地境界線は50㎝外側にあるはずなので、50㎝分は隣家に譲っていることになる。この倉庫は親戚家族の基礎屋さんを通して建設された。実は、その親戚が西隣家に住んでいるため、敷地境界は適当に扱っているそうだ。",
    },
    {
      class_name: "区画整理",
      document:
        "屋上に上りあたりを見回す。区画整理が完了した場所と未だ昔のままの場所が共存している様子を眺めながら話を聞く。倉庫が建てられた頃には既に区画整理事業の話が上がっていた。しかし、当時はまだ農家が多く、耕した畑が無くなってしまうことや面積が減ってしまうことなどの理由で反対者数が多かった。それから時が経ち25年前（2000年頃）、農家の高齢化による反対者数の減少に伴い、災害時の救急対応の不便等による理由で区画整理事業が再開した。50年前（1975年頃）に比べ住宅数は増加し、必要な費用が大きくなったことから区画整理は遅れを取っている。現在は1年に3軒が移動するスピードで事業は動いている。",
    },
    {
      class_name: "手入れ",
      document:
        "塀のフェンス。倉庫の手すりや鉄骨。屋上の防水対策。物を長持ちさせるというのは手入れをかかさないことである。",
    },
    {
      class_name: "錆びた壁",
      document:
        "外壁に長方形の白い跡と錆垂れた跡がついている。ここには消火器のケースを取り付けていたという。昔、観葉植物用のビニールハウスを建てていて、温室に温度をかけていた。設置義務として灯油用消火器が設置してあったのだ。",
    },
    {
      class_name: "東隣の敷地",
      document:
        " よくボールを隣の敷地へ飛ばしていた。そんな記憶から敷地の高低差の話へ広がっていく。同じ塀でもこちらからみると105cm、東隣地からみると190cmの高さになる。つまり、隣り合う敷地の高低差が85cmもあるのだ。元々砂利道だった頃は道路はもっと低かった。砂利の補修やアスファルト化を経て、道路の位置が高くなり、雨水が敷地に沼をつくるようになった。対策として盛り土をしていくことで隣家との高低差が生まれたんだという。",
    },
    {
      class_name: "ガタガタの縁",
      document:
        " 屋根の縁が鉄骨丸見えでコンクリート端部はガタガタとしている。言われてみれば、確かに未完成な様子を感じる。元々、コンクリートが屋根外周にまかれていたらしい。老朽化しひび割れ、落ちることがあり、危険なためすべて取り払ったのだという。",
    },
    {
      class_name: "塀",
      document:
        "塀の端が砕けたようである。以前はこの塀もフェンス一個分ほど長かった。ロングボディの4tトラックを使うようになってから、敷地出入口の拡張のために塀を壊したそうだ。今の敷地は道路にひらけた様子だが、以前は鉄の引戸門扉が敷かれていたのだと。その時のレールは地中に未だ埋まっているらしい。",
    },
  ],
};

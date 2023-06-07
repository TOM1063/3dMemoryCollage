var arr = [];

function TypingInit() {
  console.log("typing init");
  $(".js_typing").each(function (i) {
    //js_typingクラスを全て処理をおこなう
    arr[i] = new ShuffleText(this); //動作させるテキストを配列に格納
  });
  console.log(arr);
}
//スクロールした際のアニメーションの設定
function TypingAnime() {
  console.log("typing animate");
  console.log(arr);
  $(".js_typing").each(function (i) {
    //endAnimeのクラスがあるかチェック
    arr[i].start(); //配列で登録テキストのアニメーションをおこなう
    arr[i].duration = 500; //テキストが最終変化するまでの時間※規定値600
    //$(this).addClass("endAnime"); //１度アニメーションした場合はendAnimeクラスを追加
  });
}

// // 画面をスクロールをしたら動かしたい場合の記述
// $(window).scroll(function () {
//   TypingAnime();/* アニメーション用の関数を呼ぶ*/
// });// ここまで画面をスクロールをしたら動かしたい場合の記述

// // 画面が読み込まれたらすぐに動かしたい場合の記述
// $(window).on('load', function () {
//   TypingInit(); //初期設定
//   TypingAnime();/* アニメーション用の関数を呼ぶ*/
// });// ここまで画面が読み込まれたらすぐに動かしたい場合の記述

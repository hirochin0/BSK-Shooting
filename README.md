# 猫と女は蹴らねえ、あと友達もな

ブラウザで動作する2Dシューティングゲームです。

## 📥 ダウンロード方法

### 方法1: ZIPファイルとしてダウンロード（推奨）

1. GitHubリポジトリページにアクセス
2. 緑色の「Code」ボタンをクリック
3. 「Download ZIP」を選択
4. ダウンロードしたZIPファイルを解凍
5. `index.html`をブラウザで開く

### 方法2: Gitでクローン

```bash
git clone https://github.com/あなたのユーザー名/Gaiji.git
cd Gaiji
```

その後、`index.html`をブラウザで開いてください。

### 方法3: GitHub Pagesで直接プレイ

GitHub Pagesが有効な場合、以下のURLで直接プレイできます：

```
https://あなたのユーザー名.github.io/Gaiji/
```

## 🚀 セットアップ

このゲームは外部ライブラリを必要としません。以下の手順で実行できます：

1. ファイルをダウンロード/クローン
2. `index.html`をブラウザで開く
3. ゲーム開始！

**注意**: ローカルファイルを直接開く場合、一部のブラウザでCORSエラーが発生する可能性があります。その場合は、ローカルサーバーを起動してください：

```bash
# Python 3の場合
python3 -m http.server 8000

# Node.jsの場合（http-serverが必要）
npx http-server

# その後、ブラウザで http://localhost:8000 にアクセス
```

## ゲーム概要

キーボード操作でプレイヤーを動かし、敵を倒してボスを撃破するシューティングゲームです。

## 操作方法

- **移動**: [W] 上 / [A] 左 / [S] 下 / [D] 右
- **弾発射**: [J]

## ゲームルール

- 敵を倒すと10点獲得
- スコア150点でボスが出現
- ボスを倒すとゲームクリア
- クリアタイムがランキングに記録されます

## 技術スタック

- HTML5
- CSS3
- JavaScript (Vanilla)
- Canvas API
- localStorage

## ファイル構成

- `index.html` - メインHTMLファイル
- `style.css` - スタイルシート
- `script.js` - ゲームロジック
- `Hiroto.png` - プレイヤー画像
- `Ko.png` - 敵画像
- `Shoudai.png` - ボス画像

## ライセンス

このプロジェクトは個人利用のためのものです。


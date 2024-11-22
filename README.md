## gas_template

GoogleAppsScriptのテンプレート  
https://script.google.com/home

---

### 事前準備

* GoogleAppsScriptの設定から`GoogleAppsScriptAPI`をONにする
* Dockerをインストールする
  * ※Javascript実行環境がある場合は`clasp`のインストールのみでも可
  * ※ただし環境依存性の発生防止のため, Dockerの利用を強く推奨します
* .env.sampleをコピーし、envファイルを作成する
* .envファイルに下記を記入する
  * APPNAME: アプリケーション名
  * GIT_USERNAME: git用ユーザー名
  * GIT_EMAIL_ADDRESS: git用Emailアドレス
* `compose.yaml`のサービス名を任意のものに変更する (default:`gas_template`)

---

### 立ち上げ方

##### [VsCodeの場合]

1. `Dev Containers`拡張機能をインストールする

2. `ctrl+shift+p`でコマンドパレットを開く

3. `Dev Containers: Reopen in Container`を実行しコンテナに接続する

##### [コンソールの場合]

1. 下記コマンドを実行しコンテナを立ち上げる
   ```
   > docker compose up -d --build
   ```

2. 下記コマンドを実行しコンテナに接続する
   ```
   > docker compose exec <サービス名> /bin/bash
   ```

3. コンテナ内で作業ディレクトリに移動する
   ```
   > cd /workspace
   ```

---

#### GASへの接続方法

1. `init.sh`を実行する

2. 表示されるURLをブラウザで開き,googleアカウントの認証を行う

3. コンソール上で作成するScriptのフォーマットを選択する

---

#### GASへの登録方法

1. `push.sh`を実行する

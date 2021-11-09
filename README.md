# SenStick4

## SenStickチュートリアル

以下のSenStickチュートリアルを順に進めることで、SenStickの使い方を習得できます。

- [1. SenStickの接続と動作確認](./tutorial/tutorial-1.md)
- [2. SenStickのセンサデータ取得](./tutorial/tutorial-2.md)
- [3. mruby/cのプログラムの実行](./tutorial/tutorial-3.md)
- [4. mruby/cプログラムの作成](./tutorial/tutorial-4.md)


## SenStick サンプルアプリケーション

### senstick_app_sample

SenStick の動作を確認するための最も簡単なブラウザアプリ。
SenStickアプリを開発する際の参考にもなります。

[senstick_app_sampleを実行する](https://ruby-b-senstick.github.io/senstick_check/senstick_app_sample.html)


（旧Heroku版）[senstick_app_sampleを実行する](https://senstick-app.herokuapp.com/)


### senstick_app_sensor

SenStick からセンサデータを取得するサンプルアプリケーション。

[senstick_app_sensorを実行する](https://ruby-b-senstick.github.io/senstick_check/senstick_app_sensor.html)

### senstick_app_mrubyc

SenStick でmruby/cのプログラムを実行するためのアプリケーション。

[senstick_app_mrubycを実行する](https://ruby-b-senstick.github.io/senstick_check/senstick_app_mrubyc.html)

|サンプルプログラム(バイトコード）|説明|
|---|---|
|[led.mrb](https://ruby-b-senstick.github.io/senstick_check/mrubyc_sample/led.mrb)|LEDが点滅する|
|[sensor.mrb](https://ruby-b-senstick.github.io/senstick_check/mrubyc_sample/sensor.mrb)|温度センサを使う。温度が30℃を超えるとLEDが点灯する|
|[trigger.mrb](https://ruby-b-senstick.github.io/senstick_check/mrubyc_sample/trigger.mrb)|光センサを使う。明るさが変化するとLEDが点灯する|

### senstick_app_view

SenStick の応用アプリケーション例。センサデータをグラフで描画する。

[senstick_app_viewを実行する](https://ruby-b-senstick.github.io/senstick_check/senstick_app_view.html)

[senstick_app_view2を実行する](https://ruby-b-senstick.github.io/senstick_check/senstick_app_view2.html)



var ble = new BlueJelly()

// SenStick関連の設定
var SCAN_UUID            = '00000000-0000-0000-0000-000000000000'
var BATTERY_SERVICE_UUID = '0000180f-0000-1000-8000-00805f9b34fb'
var BATTERY_CHAR_UUID    = '00002a19-0000-1000-8000-00805f9b34fb'
var MRUBY_SERVICE_UUID   = 'f0001523-0451-4000-b000-000000000000'
var MRUBY_CHAR_UUID      = 'f0001525-0451-4000-b000-000000000000'



// ページを表示した際の設定などを行う
const page_load = () => {
    //UUIDの設定
    ble.setUUID("battery", BATTERY_SERVICE_UUID, BATTERY_CHAR_UUID) 
    ble.setUUID("mrubyc", MRUBY_SERVICE_UUID, MRUBY_CHAR_UUID)
}


// BLEスキャン時の onScan イベントハンドラ
//　選択したデバイス名を表示する
ble.onScan = (deviceName) => {
    document.getElementById('device_name').innerHTML = deviceName
    document.getElementById('device_status').innerHTML = 'Connecting...'
}


// [scan & connect] ボタン
// 接続がされると、onConnectGATT が呼ばれる
const scan_onclick = () => {
    ble.scan('mrubyc').then( () => {
        return ble.connectGATT('mrubyc')
    }).catch( error => {
        console.log('error in scan')
        this.onError(error)
    })
}

// GATT接続した
ble.onConnectGATT = (deviceName) => {
    document.getElementById('device_status').innerHTML = 'Connected'}


// [disconnect] ボタン
// 切断されると、onDisconnect が呼ばれる
const disconnect_onclick = () => {
    ble.reset()
}


//　切断処理
ble.onDisconnect = (deviceName) => {
    document.getElementById('device_status').innerHTML = 'Disconnected'
}


// [Get Sensor Data 1] ボタンが押されたときの処理
// mrubycサービスのコマンド 20 を使う
const getsensor1_onclick = () => {
    cmd = [0x20]
    // コマンドを使って値を取り出す
    ble.write("mrubyc", cmd).then( () => {
        return ble.read("mrubyc")
    }).then( (data) => {

	const ary = new Uint8Array(data.buffer)
        // 湿度
        var v = 125.0 * (ary[0] + ary[1] * 256.0) / 65536.0 - 6.0;
        document.getElementById('sensor_value_humidity_text').innerHTML = v.toFixed(2)
        // 温度
        var v = 175.72 * (ary[2] + ary[3] * 256.0) / 65536.0 - 46.85;
        document.getElementById('sensor_value_temperature_text').innerHTML = v.toFixed(2)
        // 照度
        var v = ary[4] + ary[5] * 256.0;
        document.getElementById('sensor_value_brightness_text').innerHTML = v.toFixed(2)
        // UV
        var v = ary[6] + ary[7] * 256.0;
        document.getElementById('sensor_value_uv_text').innerHTML = v.toFixed(2)
        // 気圧
        var v = (ary[8] + (ary[9] + ary[10] * 256.0) * 256.0) / 4096.0;
        document.getElementById('sensor_value_airpressure_text').innerHTML = v.toFixed(2)
    })
}




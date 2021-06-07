
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


// [Get Version] ボタンが押されたときの処理
// mrubycサービスのコマンド02を使う
const version_onclick = () => {
    cmd = [0x02]
    // コマンドを使って値を取り出す
    ble.write("mrubyc", cmd).then( () => {
        return ble.read("mrubyc")
    }).then( (data) => {
	// コマンドを送信後のデータ取得
        var ary = new Uint8Array(data.buffer)
        var i = 0
        var str = ""
        while( i<ary.length && ary[i] != 0 ){
            str += String.fromCharCode(ary[i])
            i++
        }
	// バージョン情報をブラウザに出力する
        document.getElementById('version_text').innerHTML = str
    })
}



// [LED Off] ボタン
// mrubycサービスのコマンド00を使う
const led_off_onclick = () => {
    cmd = [0x00]
    ble.write("mrubyc", cmd)
}

// [LED On] ボタン
// mrubycサービスのコマンド01を使う
const led_on_onclick = () => {
    cmd = [0x01]
    ble.write("mrubyc", cmd)
}




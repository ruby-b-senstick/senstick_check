
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
const scan_onclick = () => {
    ble.scan('mrubyc').then( () => {
        return ble.connectGATT('mrubyc')
    }).catch( error => {
        console.log('error in scan')
        this.onError(error)
    })
}


// [disconnect] ボタン
const disconnect_onclick = () => {
    ble.reset()
}





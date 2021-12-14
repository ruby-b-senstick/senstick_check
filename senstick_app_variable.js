
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

// SenStickからの返り値を値に変換する
const convert_from_senstick_value = (buffer) => {
    var src = new Uint8Array(buffer)
    var conv = new ArrayBuffer(8)
    var dst_uint8 = new Uint8Array(conv)
    for( i=0 ; i<8 ; i++ ) dst_uint8[i] = src[i+1]
    switch(src[0]){
    case 0:
    	return 'null'
	break;
    case 1:
	    var dst_int32 = new Int32Array(conv)
	    return dst_int32[0]
	break;
    case 2:
    	var dst_float64 = new Float64Array(conv)
	    return dst_float64[0]
	break;
        default:
	    return 'unknown'
	break;
    }
}

// SenStickへ送る値に変換する
// typeでデータ型を指定する
const convert_to_senstick_value = (value) => {
    // データ型チェック
    var num = Number(value)
    console.log(num)
    var datatype = null  // nil
    if( !Number.isNaN(num) ){
	if( value.indexOf('.') >= 0 ){
	    datatype = "float"
	} else {
	    datatype = "int"
	}
    }
    // データ型ごとの値設定
    var buffer = new ArrayBuffer(9)
    var conv = new ArrayBuffer(8)
    var dst_uint8 = new Uint8Array(conv)
    switch(datatype){
    case "int":  // int
	var dst_int32 = new Int32Array(conv)
	buffer[0] = 1
	dst_int32[0] = num
	break
    case "float":  // float
	var dst_float64 = new Float64Array(conv)
	buffer[0] = 2
	dst_float64[0] = num
	break
    default:
	buffer[0] = 0
	break
    }
    // データをコピー
    for( i=0 ; i<8 ; i++ ) buffer[i+1] = dst_uint8[i]
    return buffer
}


// [Read] ボタン
const variable_read_onclick = () => {
    var cmd = [0x10, 0x24]
    // 変数名を格納する
    var variable_name = document.getElementById('variable_name').value
    var len = variable_name.length
    if( len > 8 ) len = 8
    for( i=0 ; i<len ; i++ ){
	cmd.push( variable_name.charCodeAt(i) )
    }
    cmd.push( 0 )
    // 値を取得する
    ble.write("mrubyc", cmd).then( () => {
	return ble.read("mrubyc")
    }).then( (data) => {
	var value = convert_from_senstick_value(data.buffer)
	document.getElementById('variable_value_get').value = value	
    })
}

// [Write] ボタン
const variable_write_onclick = () => {
    var cmd = [0x11, 0x24]
    // 変数名を格納する
    var variable_name = document.getElementById('variable_name').value
    var len = variable_name.length
    if( len > 8 ) len = 8
    for( i=0 ; i<len ; i++ ){
	cmd.push( variable_name.charCodeAt(i) )
    }
    cmd.push( 0 )
    //
    buffer = convert_to_senstick_value(
	document.getElementById('variable_value_set').value
    )
    // 値を格納する
    for( i=0 ; i<9 ; i++ ){
	cmd.push( buffer[i] )
    }
    console.log(cmd)
    // 書き込み
    ble.write("mrubyc", cmd)
}


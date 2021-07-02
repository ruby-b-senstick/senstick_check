
var ble = new BlueJelly()

// SenStick関連の設定
var SCAN_UUID            = '00000000-0000-0000-0000-000000000000'
var BATTERY_SERVICE_UUID = '0000180f-0000-1000-8000-00805f9b34fb'
var BATTERY_CHAR_UUID    = '00002a19-0000-1000-8000-00805f9b34fb'
var MRUBY_SERVICE_UUID   = 'f0001523-0451-4000-b000-000000000000'
var MRUBY_CHAR_UUID      = 'f0001525-0451-4000-b000-000000000000'

var get_sensor_timer;

var sensor_data = []

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



// タイマー処理
var get_sensor = function(){

    // データ取得（センサデータ）
    cmd = [0x20]
    ble.write("mrubyc", cmd).then( () => {
        return ble.read("mrubyc")
    }).then( (data) => {
	const ary = new Uint8Array(data.buffer)
        // センサデータ
        var v = (ary[8] + (ary[9] + ary[10] * 256.0) * 256.0) / 4096.0;
	sensor_data.push([new Date(), v]);
    });
	    
    // グラフ描画
    var options = {
	chart: {
	    type: 'spline',
	    renderTo: 'container',　
	},
	title: {
	    text: 'SenStickデータ'
	},
	subtitle: {
	    text: 'センサデータ'
	},
	xAxis: {
	    type: 'datetime',
	    　　title: {
		text: '時刻',
	    }
	},
	yAxis: {
	    title: {
		text: '',
	    }
	},
	tooltip: {
	    series: {
		marker: {
		    enabled: true
		}
	    }
	},

	colors: ['#6CF', '#39F', '#06C', '#036', '#000'],
	
	series: [
	    {
		name: 'センサ値',
		data: sensor_data,
		
	    },
	]
    };
    var chart = new Highcharts.Chart(options);
};

// [Start] ボタン
const timer_start_onclick = () => {
    if( ble.bluetoothDevice == null ){
	alert('はじめにSenStickを接続してください');
    } else {
	get_sensor_timer = setInterval(get_sensor, 3000);
    }
}

// [Stop] ボタン
const timer_stop_onclick = () => {
    clearInterval(get_sensor_timer);
}




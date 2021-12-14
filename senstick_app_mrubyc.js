
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
    // ドラッグ＆ドロップイベント
    var dropFrame = document.getElementById('drop_area');
    dropFrame.addEventListener('dragover', handleDragOver, false);
    dropFrame.addEventListener('drop', handleFileSelect, false);
}

// 送信するバイト列を管理する
// bytecode: バイトコード列
// seq: 次に転送するシーケンス番号（seq>=0で転送中）
// num_seq: シーケンスの数
var transfer_data = { bytecode: null, seq: -1 , end_seq: -1 }

// 転送時のウェイト(ms)
var TRANSFER_WAIT_MS = 10

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

// 転送中のプログレス表示
const transferProgress = (val) => {
    document.getElementById('transfer_progress').innerHTML = val + ' %'
}

// ドラッグ中
const handleDragOver = (evt) => {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy';
}

// ドロップした
const handleFileSelect = (evt) => {
    evt.stopPropagation();
    evt.preventDefault();
    
    var files = evt.dataTransfer.files; 

    var file_name = ""
    mrb_files = [];
    for( file of files ){
	mrb_files.push(file)
	console.log(file)
	if( file_name != "" ) file_name += ", "
	file_name += file.name
    }

    var mrb_files_text  = document.getElementById('mrb_files_text');
    mrb_files_text.innerHTML = file_name
}


// mrbを分割して 16バイト分を転送する
// 転送完了時には、コマンド 0x07 で実行させる
const transfer_mrb16 = () => {
    seq = transfer_data['seq']
    if( seq < 0 ) return
    if( seq < transfer_data['end_seq'] ){
	// 転送途中
	cmd = [0x06,
	       seq/256|0, seq%256,
	       0, 0, 0, 0, 0, 0, 0, 0,
	       0, 0, 0, 0, 0, 0, 0, 0
	      ]
	transfer_data['seq'] = seq+1
	// バイトコードをコピー
	var bytecode = new Uint8Array(transfer_data['bytecode'])
	for( var i=0 ; i<16 ; i++ ){
	    if( seq*16+i < bytecode.byteLength ){
		cmd[i+3] = bytecode[seq * 16 + i]
	    }
	}
	console.log('seq=', seq)
	ble.write('mrubyc', cmd).then( () => {
	    transferProgress( 100*seq/transfer_data['end_seq'] | 0 )
	})
    } else {
	// 転送完了＆実行
	transfer_data['seq'] = -1
	cmd = [0x07]
	console.log('cmd 0x07')
	ble.write("mrubyc", cmd).then( () => {
	    transferProgress( 100 )
	})
    }
}


// BLE書き込み時の onWrite イベントハンドラ
// バイトコード転送の際には、書き込みが連続するので、
// 書き込み完了を確認する必要がある
ble.onWrite = (deviceName) => {
    if( deviceName == 'mrubyc' ){
	if( transfer_data['seq'] < 0 ) return
	//	transfer_mrb16()
	window.setTimeout(transfer_mrb16, TRANSFER_WAIT_MS);
    }
}


// BLEからデータを取り出す
ble.onRead = (data,deviceName) => {
}




// [Transfer] ボタン
const transfer_onclick = () => {
    var reader = new FileReader()
    if( mrb_files.length == 1 ){
		// 単一バイトコード
		// 転送バイト列は mrbファイルそのまま
		reader.onload = () => {
	    	transfer_data.bytecode = reader.result
	    	transfer_data.seq = 0
	    	transfer_data.end_seq = (reader.result.byteLength+15) / 16 | 0
	    	// onWriteイベント発生
	    	ble.write("mrubyc", [0x00])
		}
		reader.readAsArrayBuffer(mrb_files[0])
    } else {
		// 複数バイトコード
		//　転送バイト列は、ヘッダが付加される
		var seq = 0
		var bytecode_length = 0
		var bytecodes = []
		// 複数バイトコードの場合
		reader.onload = () => {
			bytecode_length += reader.result.byteLength
			bytecodes.push(reader.result)
			seq++
			if( seq < mrb_files.length ){
			// 次のファイルを読み込み開始する
			reader.readAsArrayBuffer(mrb_files[seq])
			} else {
			// 最後のファイルを読み終わった
			// 転送するデータ長＝バイトコード(bytecode_length)＋ヘッダ情報(8)
			var buffer = new ArrayBuffer(bytecode_length + 8)
			var dst = new Uint8Array(buffer)
			// ヘッダ情報を初期化
			var offset = 8
			for( i=0 ; i<4 ; i++ ){
				if( i >= mrb_files.length ){
				dst[i*2]   = 0
				dst[i*2+1] = 0
				continue
				}
				// ヘッダ情報
				dst[i*2]   = bytecodes[i].byteLength % 256
				dst[i*2+1] = bytecodes[i].byteLength / 256 | 0
				// バイトコードをコピーする
				var src = new Uint8Array(bytecodes[i])
				for( j=0 ; j<src.length ; j++ ){
				dst[offset+j] = src[j]
				}
				offset += bytecodes[i].byteLength
			}
			transfer_data.bytecode = buffer
			transfer_data.seq = 0
			transfer_data.end_seq = (buffer.byteLength+15) / 16 | 0
			// onWriteイベント発生
			ble.write("mrubyc", [0x00])
			}
		}
		// 最初のファイルを読み込み開始する
		reader.readAsArrayBuffer(mrb_files[seq])
	
	}
}

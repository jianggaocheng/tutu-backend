var socket;

// if there is no config, do not init ws function
if (tutu.config && tutu.config.wsPort) {
    tutu.ws = {
        connect: function() {
            try {
                socket = new WebSocket('ws://' + window.location.hostname + ':' + tutu.config.wsPort);
            } catch (e) {
                console.log('Error:', e);
                return;
            }
            socket.onopen = sOpen;
            socket.onerror = sError;
            socket.onmessage = sMessage;
            socket.onclose = sClose;
            if (tutu.ws.autoReconnect) {
                clearTimeout(tutu.ws.autoReconnect);
            }
        },
        close: function() {
            socket.close();
        },
        send: function(msg) {
            console.log('WS send:', msg);
            socket.send(JSON.stringify(msg));
        }
    };

    function sOpen() {
        console.log('WS open');
    }

    function sError(e) {
        console.log('WS error:', e);
        if (tutu.ws.autoReconnect) {
            return;
        }
        tutu.ws.autoReconnect = setTimeout(function() {
            tutu.ws.connect();
        }, 3000);
    }

    function sMessage(msg) {
        console.log('WS message:', msg);
        var msgData = JSON.parse(msg.data);
        if (msgData.topic) {
            $(document).trigger(msgData.topic, [msgData.payload]);
        }
    }

    function sClose(e) {
        // stop auto refresh table
        if (tutu.table && tutu.table.autoRefresh) {
            clearInterval(tutu.table.autoRefresh);
        }

        tutu.ws.connect();
        console.log('WS close:', e.code);
    }

    tutu.ws.connect();

    $(document).on('bind', function(e, data) {
        $.ajax({
            type: 'POST',
            data: {
                uuid: data.uuid
            },
            url: '/admin/bindWebsocketUUID',
            success: function(result) {
                if (result.code == 200) {
                    console.log('Websocket bind success');
                } else {
                    console.error('Websocket bind error');
                }
            }
        });
    });
}
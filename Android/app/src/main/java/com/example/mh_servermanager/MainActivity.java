package com.example.mh_servermanager;

import android.os.Bundle;
import android.util.Log;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.WebSocket;
import okhttp3.WebSocketListener;
import okio.ByteString;

public class MainActivity extends AppCompatActivity {

    private WebSocket webSocket;
    private TextView txtLog;
    private TextView txtStatus;
    private Button btnRestart;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        txtLog = findViewById(R.id.txtLog);
        txtStatus = findViewById(R.id.txtStatus);
        btnRestart = findViewById(R.id.btnRestart);

        // Initialize WebSocket
        OkHttpClient client = new OkHttpClient();
        Request request = new Request.Builder().url("ws://192.168.101.89:8080").build();
        webSocket = client.newWebSocket(request, new WebSocketListener() {
            @Override
            public void onOpen(WebSocket webSocket, Response response) {
                Log.d("WebSocket", "Connected");
            }

            @Override
            public void onMessage(WebSocket webSocket, String text) {
                runOnUiThread(() -> txtLog.setText(text));
                Log.d("WebSocket", "Received: " + text);
            }

            @Override
            public void onMessage(WebSocket webSocket, ByteString bytes) {
                Log.d("WebSocket", "Received bytes: " + bytes.hex());
            }

            @Override
            public void onClosing(WebSocket webSocket, int code, String reason) {
                webSocket.close(1000, null);
                Log.d("WebSocket", "Closing: " + code + " / " + reason);
            }

            @Override
            public void onFailure(WebSocket webSocket, Throwable t, Response response) {
                Log.d("WebSocket", "Error: " + t.getMessage());
            }
        });


        // Send message to WebSocket server
        btnRestart.setOnClickListener(v -> {
            webSocket.send("request restarting server");
        });
    }
}
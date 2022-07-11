package com.example.smartgarden;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.content.res.ColorStateList;
import android.graphics.Color;
import android.os.Bundle;
import android.util.Log;
import android.view.MotionEvent;
import android.view.View;
import android.webkit.ConsoleMessage;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.TextView;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;

public class MainActivity extends AppCompatActivity {

    private int state;
    private FirebaseAuth auth;

    @Override
    protected void onStart() {
        super.onStart();
        FirebaseUser currentUser = auth.getCurrentUser();
        if(currentUser == null){
            Intent intent = new Intent(MainActivity.this, LoginActivity.class);
            startActivity(intent);
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        getSupportActionBar().hide();

        auth = FirebaseAuth.getInstance();

        WebView webView = findViewById(R.id.Webview);
        webView.setWebViewClient(new WebViewClient());
        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setUseWideViewPort(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
                Log.d("WebView", consoleMessage.message());
                return true;
            }
        });
        webView.setOnTouchListener(new View.OnTouchListener() {
            @Override
            public boolean onTouch(View v, MotionEvent event) {
                return true;
            }
        });
        webView.loadUrl("https://setongeteslagi.herokuapp.com/chartonly");

        FirebaseDatabase database = FirebaseDatabase.getInstance();
        DatabaseReference plant1_ref= database.getReference("plant1/humidity1");
        DatabaseReference plant2_ref = database.getReference("plant2/humidity");
        DatabaseReference button_ref = database.getReference("Button");

        TextView value_1 = findViewById(R.id.value_1);
        TextView value_2 = findViewById(R.id.value_2);

        plant1_ref.addValueEventListener(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                Double value = dataSnapshot.getValue(Double.class);
                int angka = value.intValue();
                value_1.setText(angka + "");
            }
            @Override
            public void onCancelled(DatabaseError error) {
                value_1.setText("Error");
                Log.w("Firebase", "Failed to read value.", error.toException());
            }
        });

        plant2_ref.addValueEventListener(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                Double value = dataSnapshot.getValue(Double.class);
                int angka = value.intValue();
                value_2.setText(angka + "");
            }
            @Override
            public void onCancelled(DatabaseError error) {
                value_2.setText("Error");
                Log.w("Firebase", "Failed to read value.", error.toException());
            }
        });

        Button button = findViewById(R.id.Button);

        button_ref.addValueEventListener(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                Double value = dataSnapshot.getValue(Double.class);
                state = value.intValue();
                switch (state){
                    case 0:
                        button.setText("Turn On");
                        button.setBackgroundTintList(ColorStateList.valueOf(Color.rgb( 30, 215, 95)));
                        button.setTextColor((ColorStateList.valueOf(Color.rgb( 18, 18, 18))));
                        break;
                    case 1:
                        button.setText("Turn Off");
                        button.setBackgroundTintList(ColorStateList.valueOf(Color.rgb( 18, 18, 18)));
                        button.setTextColor((ColorStateList.valueOf(Color.rgb( 30, 215, 95))));
                        break;
                }
            }
            @Override
            public void onCancelled(DatabaseError error) {
                value_2.setText("Error");
                Log.w("Firebase", "Failed to read value.", error.toException());
            }
        });

        button.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                switch (state){
                    case 0:
                        button_ref.setValue(1);
                        button.setBackgroundTintList(ColorStateList.valueOf(Color.rgb( 18, 18, 18)));
                        button.setTextColor((ColorStateList.valueOf(Color.rgb( 30, 215, 95))));
                        break;
                    case 1:
                        button_ref.setValue(0);
                        button.setBackgroundTintList(ColorStateList.valueOf(Color.rgb( 30, 215, 95)));
                        button.setTextColor((ColorStateList.valueOf(Color.rgb( 18, 18, 18))));
                        break;
                }

            }
        });

        ImageButton button1 = findViewById(R.id.button_logout);
        button1.setOnClickListener(view -> {
            FirebaseAuth.getInstance().signOut();
            startActivity(new Intent(this, LoginActivity.class));
        });
    }
}
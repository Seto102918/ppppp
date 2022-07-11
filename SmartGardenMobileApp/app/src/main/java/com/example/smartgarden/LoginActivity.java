package com.example.smartgarden;

import static android.content.ContentValues.TAG;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.util.Log;
import android.view.View;
import android.widget.EditText;
import android.widget.RelativeLayout;
import android.widget.Toast;

import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.auth.AuthResult;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;

public class LoginActivity extends AppCompatActivity {

    private EditText edittextemail;
    private EditText edittextpass;
    private RelativeLayout layoutsignin;
    private FirebaseAuth auth;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getSupportActionBar().hide();
        setContentView(R.layout.activity_login);

        auth = FirebaseAuth.getInstance();

        edittextemail = findViewById(R.id.edit_email);
        edittextpass = findViewById(R.id.edit_pass);
        layoutsignin = findViewById(R.id.layout_sign_in);

        layoutsignin.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                loginUser();
            }
        });
    }
    private void loginUser(){
        String email = edittextemail.getText().toString();
        String pass = edittextpass.getText().toString();

        if(TextUtils.isEmpty(email)){
            edittextemail.setError("Please Insert Email Address");
            edittextemail.requestFocus();
        }else if (TextUtils.isEmpty(pass)){
            edittextpass.setError("Please insert Password");
            edittextpass.requestFocus();
        }else{
            auth.signInWithEmailAndPassword(email, pass)
                    .addOnCompleteListener(this, new OnCompleteListener<AuthResult>() {
                        @Override
                        public void onComplete(@NonNull Task<AuthResult> task) {
                            if (task.isSuccessful()) {
                                Log.d(TAG, "signInWithCredential:success");
                                FirebaseUser user = auth.getCurrentUser();
                                Intent intent = new Intent(LoginActivity.this ,
                                        MainActivity.class);
                                startActivity(intent);
                            } else {
                                Log.w(TAG, "signInWithCredential:failure", task.getException());
                                Toast.makeText(LoginActivity.this,
                                        "Authentication failed.",
                                        Toast.LENGTH_SHORT).show();
                            }
                        }
                    });
        }
    }
}
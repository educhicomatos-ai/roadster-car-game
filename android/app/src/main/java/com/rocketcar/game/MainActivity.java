package com.rocketcar.game;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {
    private static final String GAME_URL = "https://educhicomatos-ai.github.io/roadster-car-game/";
    private WebView web;
    private boolean fallback = false;
    private String pendingAuth = null;

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor("#0a0f2e"));
        setContentView(web);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(true);
        s.setLoadWithOverviewMode(true);
        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
                // O Google bloqueia login dentro de WebView: abre o navegador do sistema.
                String u = r.getUrl().toString();
                if (u.contains("/auth/v1/authorize")) {
                    try { startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(u))); } catch (Exception e) { }
                    return true;
                }
                return false;
            }

            @Override
            public void onPageFinished(WebView v, String url) {
                deliverAuth();
            }

            @Override
            public void onReceivedError(WebView v, WebResourceRequest r, WebResourceError e) {
                // Sem internet na primeira abertura: usa a cópia embutida no app.
                if (r.isForMainFrame() && !fallback) {
                    fallback = true;
                    v.loadUrl("file:///android_asset/index.html");
                }
            }
        });
        // Abre a versão mais recente publicada no GitHub Pages; o service worker do jogo guarda cópia para uso offline.
        web.loadUrl(GAME_URL);
        handleAuthIntent(getIntent());
        hideBars();
    }

    // Retorno do login: rocketcar://auth#access_token=...&refresh_token=...
    private void handleAuthIntent(Intent i) {
        if (i == null || i.getData() == null) return;
        Uri d = i.getData();
        if (!"rocketcar".equals(d.getScheme())) return;
        String frag = d.getEncodedFragment();
        if (frag == null || frag.isEmpty()) frag = d.getEncodedQuery();
        if (frag != null && !frag.isEmpty()) { pendingAuth = frag; deliverAuth(); }
    }

    private void deliverAuth() {
        if (pendingAuth == null || web == null) return;
        String js = "window.__authReturn && window.__authReturn(" + org.json.JSONObject.quote(pendingAuth) + ")";
        pendingAuth = null;
        web.evaluateJavascript(js, null);
    }

    @Override
    protected void onNewIntent(Intent i) {
        super.onNewIntent(i);
        setIntent(i);
        handleAuthIntent(i);
    }

    private void hideBars() {
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_LAYOUT_STABLE | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
    }

    @Override
    public void onWindowFocusChanged(boolean f) {
        super.onWindowFocusChanged(f);
        if (f) hideBars();
    }

    @Override protected void onPause() { super.onPause(); web.onPause(); }
    @Override protected void onResume() { super.onResume(); web.onResume(); hideBars(); }

    @Override
    protected void onDestroy() { web.destroy(); super.onDestroy(); }
}

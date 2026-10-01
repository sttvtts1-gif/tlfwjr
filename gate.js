/* 비밀번호 게이트: 암호화된 데이터(.enc.js)를 비밀번호로 복호화한 뒤 콜백 실행.
   사용: GS_GATE.open(window.GS_ENC_DATA, function(){ ...데이터 준비됨... }) */
window.GS_GATE = (function () {
  const KEY = "gs-pw";
  const b64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  async function decrypt(enc, pw) {
    const km = await crypto.subtle.importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, ["deriveKey"]);
    const key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt: b64(enc.salt), iterations: enc.iter, hash: "SHA-256" }, km, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
    const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64(enc.iv) }, key, b64(enc.ct));
    return new TextDecoder().decode(pt);
  }
  function run(js) { const s = document.createElement("script"); s.textContent = js; document.head.appendChild(s); }
  function saved() { try { return sessionStorage.getItem(KEY) || localStorage.getItem(KEY); } catch (e) { return null; } }
  function remember(pw, keep) { try { sessionStorage.setItem(KEY, pw); if (keep) localStorage.setItem(KEY, pw); } catch (e) {} }
  function logout() { try { sessionStorage.removeItem(KEY); localStorage.removeItem(KEY); } catch (e) {} location.reload(); }
  function ui(onSubmit) {
    const st = document.createElement("style");
    st.textContent = `#gs-gate{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:var(--bg,#f4f4f2);font-family:"Noto Sans KR",system-ui,sans-serif}
#gs-gate form{background:var(--surface,#fff);border:1px solid var(--border,#e3e2de);border-radius:14px;padding:28px 28px 22px;width:320px;max-width:calc(100vw - 32px);box-shadow:0 10px 40px rgba(0,0,0,.08)}
#gs-gate h2{margin:0 0 4px;font-size:17px;color:var(--text-1,#0b0b0b)}#gs-gate p{margin:0 0 16px;font-size:12px;color:var(--text-3,#8a8984)}
#gs-gate input[type=password]{width:100%;box-sizing:border-box;border:1px solid var(--border,#e3e2de);border-radius:8px;padding:10px 12px;font:inherit;font-size:15px;background:var(--surface,#fff);color:var(--text-1,#0b0b0b)}
#gs-gate label{display:flex;gap:6px;align-items:center;font-size:12px;color:var(--text-2,#52514e);margin:10px 0 14px}
#gs-gate button{width:100%;border:0;border-radius:8px;padding:10px;font:inherit;font-weight:500;background:var(--accent,#2a78d6);color:#fff;cursor:pointer}
#gs-gate .err{color:#c43c3b;font-size:12px;min-height:16px;margin-top:8px}`;
    document.head.appendChild(st);
    const d = document.createElement("div"); d.id = "gs-gate";
    d.innerHTML = `<form><h2>GRAND SUN 실적 대시보드</h2><p>비밀번호를 입력하세요</p><input type="password" autocomplete="current-password" autofocus><label><input type="checkbox" id="gs-keep">이 기기에서 로그인 유지</label><button type="submit">접속</button><div class="err"></div></form>`;
    document.body.appendChild(d);
    const f = d.querySelector("form"), inp = d.querySelector("input[type=password]"), err = d.querySelector(".err"), btn = d.querySelector("button");
    f.addEventListener("submit", async e => { e.preventDefault(); btn.disabled = true; err.textContent = ""; const ok = await onSubmit(inp.value, d.querySelector("#gs-keep").checked); if (ok) d.remove(); else { err.textContent = "비밀번호가 올바르지 않습니다."; btn.disabled = false; inp.select(); } });
    setTimeout(() => inp.focus(), 50);
  }
  async function open(enc, cb) {
    const main = document.querySelector(".app, main"); if (main) main.style.visibility = "hidden";
    const show = () => { if (main) main.style.visibility = ""; };
    const tryPw = async (pw, keep) => { try { const js = await decrypt(enc, pw); remember(pw, keep); run(js); show(); cb(); return true; } catch (e) { return false; } };
    const pw = saved();
    if (pw && await tryPw(pw, false)) return;
    ui(tryPw);
  }
  return { open, logout };
})();

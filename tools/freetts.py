#!/usr/bin/env python3
"""Озвучка через freetts.ru по плану voice_plan.json.
Использование: python3 tools/freetts.py src/co/voice_plan.json public/co_voice.wav [--bpm 96] [--bar-frames 75] [--fps 30]
Каждая реплика синтезируется отдельно, обрезается по тишине, обрабатывается и ставится на свой такт.
"""
import asyncio, json, os, subprocess, sys, tempfile, wave
import websockets

API = "wss://api.freetts.ru/generate"

async def synth(text: str, voice: str, out_path: str, tries: int = 3):
    for attempt in range(tries):
        try:
            async with websockets.connect(API, max_size=None, ping_interval=20) as ws:
                await ws.send(json.dumps({"action": "start", "text": text + "\u2063", "voiceId": voice}))
                chunks = []
                while True:
                    msg = await asyncio.wait_for(ws.recv(), timeout=180)
                    if isinstance(msg, bytes):
                        chunks.append(msg)
                        continue
                    try:
                        j = json.loads(msg)
                    except Exception:
                        continue
                    if j.get("status") in ("ready", "error"):
                        if j.get("status") == "error":
                            raise RuntimeError(j.get("message"))
                        break
                data = b"".join(chunks)
                if not data:
                    raise RuntimeError("пустой ответ")
                open(out_path, "wb").write(data)
                return
        except Exception as e:
            print(f"  попытка {attempt+1}: {type(e).__name__} {e}", flush=True)
            await asyncio.sleep(2)
    raise RuntimeError(f"не удалось синтезировать: {text[:40]}")

def dur(path):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path]).strip())

async def main():
    plan_path, out_path = sys.argv[1], sys.argv[2]
    bpm = 96; bar_frames = 75; fps = 30
    args = sys.argv[3:]
    for i in range(0, len(args) - 1, 2):
        if args[i] == "--bpm": bpm = float(args[i + 1])
        if args[i] == "--bar-frames": bar_frames = int(args[i + 1])
        if args[i] == "--fps": fps = int(args[i + 1])
    plan = json.load(open(plan_path, encoding="utf-8"))
    voice = plan["voice"]; post = plan.get("post", "")
    bar_sec = bar_frames / fps
    total = 38 * bar_sec
    sr = 44100
    buf = [0.0] * int(total * sr)
    tmp = os.environ.get("FREETTS_TMP") or tempfile.mkdtemp()
    os.makedirs(tmp, exist_ok=True)
    for i, line in enumerate(plan["lines"]):
        raw = os.path.join(tmp, f"l{i}.mp3")
        if not os.path.exists(raw):
            print(f"[{i+1}/{len(plan['lines'])}] такт {line['bar']}: {line['text'][:45]}…", flush=True)
            await synth(line["text"], voice, raw)
        clean = os.path.join(tmp, f"l{i}.wav")
        filt = "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.08"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af", filt, "-ar", str(sr), "-ac", "1", clean], check=True)
        if post:
            dressed = os.path.join(tmp, f"l{i}_p.wav")
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", clean, "-af", post, "-ar", str(sr), "-ac", "1", dressed], check=True)
            clean = dressed
        d = dur(clean)
        start = line["bar"] * bar_sec
        span = line.get("span", 1)
        limit = bar_sec * span - line.get("gap", 0.3)
        # 1) мягкое ускорение, не более 12 % — иначе слышно «смену голоса»
        if d > limit:
            tempo = min(1.12, d / limit)
            fitted = os.path.join(tmp, f"l{i}_f.wav")
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", clean, "-af", f"atempo={tempo:.3f}", "-ar", str(sr), "-ac", "1", fitted], check=True)
            clean = fitted; d = dur(clean)
        # 2) если всё равно не влезает — сдвигаем старт назад (реплика звучит «поверх» такта),
        #    но не раньше предыдущего такта и не позже начала своего
        if d > limit:
            start = max((line["bar"] - 1) * bar_sec + bar_sec * 0.5, start - (d - limit))
        # 3) центрируем короткие реплики, чтобы пауза делилась до и после, а не «висела» в конце
        if d < limit:
            start += min(0.25, (limit - d) * 0.25)
        # 4) плавные края: без щелчков и без «обрубания» реверба
        faded = os.path.join(tmp, f"l{i}_e.wav")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", clean, "-af",
                        f"afade=t=in:st=0:d=0.05,afade=t=out:st={max(0.0, d-0.18):.3f}:d=0.18",
                        "-ar", str(sr), "-ac", "1", faded], check=True)
        clean = faded
        print(f"   длит {d:.2f} с, окно {bar_sec*span:.2f} с, старт {start:.2f} с", flush=True)
        with wave.open(clean) as w:
            data = w.readframes(w.getnframes())
            import array as _arr
            a = _arr.array("h"); a.frombytes(data)
            off = int(start * sr)
            for k, v in enumerate(a):
                if off + k < len(buf):
                    buf[off + k] += v / 32768.0
    import array
    out = array.array("h", [max(-32768, min(32767, int(v * 32767))) for v in buf])
    with wave.open(out_path, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(out.tobytes())
    print("готово:", out_path, f"{dur(out_path):.1f} с")

asyncio.run(main())

import os
import shutil
import tempfile
import io
from typing import Dict, Any
from dotenv import load_dotenv
from groq import Groq
from gtts import gTTS

load_dotenv()

# Automatically configure static ffmpeg in PATH for Whisper on Windows
try:
    import imageio_ffmpeg
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    ffmpeg_dir = os.path.dirname(ffmpeg_exe)
    target_ffmpeg = os.path.join(ffmpeg_dir, "ffmpeg.exe")
    if not os.path.exists(target_ffmpeg):
        shutil.copyfile(ffmpeg_exe, target_ffmpeg)
    os.environ["PATH"] = ffmpeg_dir + os.pathsep + os.environ.get("PATH", "")
except Exception as e:
    print(f"[FFmpeg Setup Warning] {e}")

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()

groq_client = None
if GROQ_API_KEY and GROQ_API_KEY != "YOUR_GROQ_API_KEY":
    try:
        groq_client = Groq(api_key=GROQ_API_KEY)
        print("Groq API client initialized successfully.")
    except Exception as e:
        print(f"Groq Client Init Warning: {e}")

local_whisper_model = None

LANGUAGE_CODES = {
    "English": "en",
    "Hindi": "hi",
    "Marathi": "mr",
    "Tamil": "ta",
    "Telugu": "te",
    "Bengali": "bn",
    "Gujarati": "gu",
    "Kannada": "kn",
    "Malayalam": "ml",
    "Punjabi": "pa"
}

def get_local_whisper():
    global local_whisper_model
    if local_whisper_model is None:
        print("Loading local Whisper model ('base')...")
        import whisper
        local_whisper_model = whisper.load_model("base")
        print("Local Whisper model loaded successfully.")
    return local_whisper_model

def transcribe_audio_groq(file_bytes: bytes, filename: str = "audio.webm", language: str = "English") -> Dict[str, Any]:
    """Transcribes uploaded audio using Groq Whisper, with local Whisper fallback."""
    suffix = os.path.splitext(filename)[1] or ".webm"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(file_bytes)
        tmp_path = tmp.name

    lang_code = LANGUAGE_CODES.get(language, "en")

    try:
        # Try Groq API if client is initialized
        if groq_client:
            try:
                mime_sub = suffix.replace(".", "")
                if mime_sub == "webm":
                    mime_type = "audio/webm"
                elif mime_sub in ["mp4", "m4a"]:
                    mime_type = "audio/mp4"
                elif mime_sub == "wav":
                    mime_type = "audio/wav"
                else:
                    mime_type = "audio/webm"

                with open(tmp_path, "rb") as audio_file:
                    kwargs = {
                        "file": (filename, audio_file.read(), mime_type),
                        "model": "whisper-large-v3"
                    }
                    if lang_code and lang_code != "auto":
                        kwargs["language"] = lang_code

                    transcription = groq_client.audio.transcriptions.create(**kwargs)

                transcribed_text = transcription.text.strip()
                print(f"[Groq Whisper STT Output] ({language}): '{transcribed_text}'")

                return {
                    "text": transcribed_text,
                    "language": language
                }
            except Exception as groq_err:
                print(f"Groq STT failed ({groq_err}), falling back to local Whisper model...")

        # Fallback to local Whisper
        try:
            model = get_local_whisper()
            result = model.transcribe(
                tmp_path,
                task="transcribe",
                fp16=False,
                temperature=0
            )
            transcribed_text = result.get("text", "").strip()
            print(f"[Local Whisper STT Output] ({language}): '{transcribed_text}'")

            return {
                "text": transcribed_text,
                "language": language
            }
        except Exception as local_err:
            print(f"[Local Whisper STT Error]: {local_err}")
            raise RuntimeError(f"Transcription service unavailable: {local_err}")
    finally:
        if os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except Exception:
                pass

def translate_to_english(text: str, source_language: str) -> str:
    """Translates source language query to English for RAG vector search."""
    if not text.strip() or source_language.lower() in ["english", "en"]:
        return text
    
    prompt = f"""You are an expert multilingual medical translator.
Translate the following {source_language} query into English.
Rules:
1. Translate literally while preserving exact medical terms and context.
2. Do NOT explain or summarize.
3. Return ONLY the translated English sentence.

Query: {text}"""

    if groq_client:
        try:
            response = groq_client.chat.completions.create(
                model="llama3-8b-8192",
                messages=[{"role": "user", "content": prompt}],
                temperature=0
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"Translation to English error: {e}")
            return text
    return text

def translate_from_english(text: str, target_language: str) -> str:
    """Translates English RAG response to the target user language."""
    if not text.strip() or target_language.lower() in ["english", "en"]:
        return text

    prompt = f"""You are an expert multilingual medical translator.
Translate the following English healthcare response into {target_language}.
Rules:
1. Preserve exact medical meaning, clinical advice, and guidelines.
2. Retain markdown structure, headings (###), bold texts, and bullet points.
3. Do NOT explain or summarize.
4. Return ONLY the translated response.

Response: {text}"""

    if groq_client:
        try:
            response = groq_client.chat.completions.create(
                model="llama3-8b-8192",
                messages=[{"role": "user", "content": prompt}],
                temperature=0
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"Translation to target language error: {e}")
            return text
    return text

def generate_tts_audio(text: str, language: str) -> io.BytesIO:
    """Generates MP3 audio stream for response text using gTTS."""
    lang_code = LANGUAGE_CODES.get(language, "en")
    
    # Strip markdown headers/bold tags for cleaner speech
    clean_text = text.replace("#", "").replace("*", "").replace(">", "").strip()
    if not clean_text:
        clean_text = "No response text available."

    tts = gTTS(text=clean_text, lang=lang_code, slow=False)
    mp3_fp = io.BytesIO()
    tts.write_to_fp(mp3_fp)
    mp3_fp.seek(0)
    return mp3_fp

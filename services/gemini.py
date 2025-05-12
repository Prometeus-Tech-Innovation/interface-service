from flask import Flask, request, jsonify
import google.generativeai as genai
import re
import speech_recognition as sr
import pyttsx3

app = Flask(__name__)

genai.configure(api_key='AIzaSyDCFtmhAPjhj5EKLXqEbhihRl-MSTYIHp8')

model = genai.GenerativeModel(
  model_name="tunedModels/jano-v2-vzxrel0vrro8",
  generation_config=genai.GenerationConfig(
    response_mime_type="text/plain"
  )
)

chat = model.start_chat(history=[])

r = sr.Recognizer()

def SpeakText(command):
    engine = pyttsx3.init()
    engine.say(command)
    engine.runAndWait()

@app.route("/api/question", methods=["POST"])
def get_response():
    data = request.get_json()
    question = data.get("question") 

    if not question:
        return jsonify({"error": "No question provided"}), 400

    tuned_question = f"Responda em até 500 caracteres sem caracteres especiais e não retorne emoções em texto simples: {question}"
    answer = chat.send_message(tuned_question)

    pattern = r'[\\*&]'

    cleaned_text = re.sub(pattern, '', answer.text)

    cleaned_text = re.sub(r'\s+', ' ', cleaned_text).strip()

    return jsonify({"response": cleaned_text})


@app.route("/api/audio", methods=["POST"])
def get_audio_response():
    data = request.get_json()
    audio = data.get("audio")

    if not audio:
        return jsonify({"error": "No audio provided"}), 400

    answer = chat.send_message(audio)

    pattern = r'[\\*&]'

    cleaned_text = re.sub(pattern, '', answer.text)

    cleaned_text = re.sub(r'\s+', ' ', cleaned_text).strip()

    return jsonify({"response": cleaned_text})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5100)  # Executa a API na porta 5000

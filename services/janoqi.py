# -*- coding: utf-8 -*-
from flask import Flask, request, jsonify
import qi
import time

app = Flask(__name__)
session = None
qi_app = None

def get_session(robot_ip):
    global qi_app, session
    if session is None:  # Se ainda não existe uma sessão ativa, cria uma nova
        try:
            connection_url = f"tcp://{robot_ip}:9559"
            app_qi = qi.Application(["NaoQiApp", "--qi-url=" + connection_url])
            app_qi.start()
            session = app_qi.session
            print("Sessão com o robô iniciada.")
        except RuntimeError as e:
            print(f"Erro ao conectar ao robô: {e}")
            return None
    return session

@app.route('/ip', methods=['POST'])
def robot_connect():
    data = request.json
    
    robot_ip = data.get('robot_ip')
    if not robot_ip:
        return jsonify({'status': 'IP do robô não fornecido'}), 400
    
    session = get_session(robot_ip)
    if not session:
        return jsonify({'status': 'Falha na conexão com o robô'}), 500
    
    try:
        tts = session.service("ALTextToSpeech")
        tts.setLanguage("Brazilian")
        tts.setVolume(1)
        tts.say("Jano conectado!")
    except Exception as e:
        return jsonify({'status': f'Erro ao interagir com o robô: {e}'}), 500
    
    return jsonify({'status': 'Conexão estabelecida com o robô'}), 200

@app.route('/ask', methods=['POST'])
def ask_question():
    data = request.json
    resposta = data.get('response', "")
    robot_ip = data.get('robot_ip')
    
    if not robot_ip:
        return jsonify({'status': 'IP do robô não fornecido'}), 400
    
    session = get_session(robot_ip)
    if not session:
        return jsonify({'status': 'Falha na conexão com o robô'}), 500
    
    try:
        tts = session.service("ALTextToSpeech")
        aas = session.service("ALAnimatedSpeech")
        arp = session.service("ALRobotPosture")
        
        aas.setBodyLanguageMode(2)
        arp.goToPosture("Stand", 1)
        
        if not resposta:
            tts.say("Desculpe, não recebi uma pergunta.")
            return jsonify({'error': 'Pergunta não fornecida'}), 400
        
        aas.say(str(resposta))
        arp.goToPosture("Stand", 1)
    except Exception as e:
        return jsonify({'status': f'Erro ao interagir com o robô: {e}'}), 500
    
    return jsonify({'response': resposta, 'robot_ip': robot_ip}), 200

@app.route('/shutdown', methods=['POST'])
def shutdown():
    global qi_app, session
    if session:
        try:
            session.close()
            qi_app.stop()
            session = None
            qi_app = None
            return jsonify({'status': 'Sessão encerrada com sucesso'}), 200
        except Exception as e:
            return jsonify({'status': f'Erro ao encerrar a sessão: {e}'}), 500
    return jsonify({'status': 'Nenhuma sessão ativa'}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

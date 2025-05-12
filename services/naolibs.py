# -*- encoding: utf-8 -*-
#coding: utf-8

try:
    #from __future__ import print_function
    #from NAOLIBS import os, time, sys, uuid, AsyncThread, Audio, Bateria, Comportamento, Config, Led, Memoria, ModoAutonomo, Motor, Sensor, Sistema
    from NAOLIBS import *
    from flask import Flask, render_template, request, url_for
    from flask_cors import CORS
    from flask_socketio import SocketIO, emit
    from markupsafe import escape
except Exception as e:
    print("Erro ao importar bibliotecas no arquivo main.py", e)
    exit()

Audio.falar("Iniciando controle robô NAO")

nivel = -1

def monitor():
    global nivel
    while True:
        try:
            nivel = Bateria.nivel()
            if nivel >= 50:
                Led.botaoPeito(g = 255)
                time.sleep(0.5)
                Led.botaoPeito(b = 255)
                time.sleep(0.5)
                Led.botaoPeito(255, 255, 255)
                time.sleep(0.5)
            elif nivel < 50 and nivel > 35:
                Led.botaoPeito(255, 255)
            else:
                Led.botaoPeito(255)
            time.sleep(30)
        except Exception as e:
            print("Erro ao executar monitor no arquivo main.py", e)

AsyncThread.call(monitor)

def funcionalidade(val, emit = False):
    # Motor
    if val == "pararAndar":
        Motor.pararAndar()
        print("parando")
    elif val.find("andarFrente <= ") != -1:
        metros = float(val.replace("andarFrente <= ", ""))
        Motor.andarFrente(metros)
    elif val.find("andarTras <= ") != -1:
        metros = float(val.replace("andarTras <= ", ""))
        Motor.andarTras(metros)
    elif val.find("andarEsquerda <= ") != -1:
        metros = float(val.replace("andarEsquerda <= ", ""))
        Motor.andarEsquerda(metros)
    elif val.find("andarDireita <= ") != -1:
        metros = float(val.replace("andarDireita <= ", ""))
        Motor.andarDireita(metros)
    elif val.find("andarGirandoHorario <= ") != -1:
        graus = int(val.replace("andarGirandoHorario <= ", ""))
        Motor.andarGirandoHorario(graus)
    elif val.find("andarGirandoAntiHorario <= ") != -1:
        graus = int(val.replace("andarGirandoAntiHorario <= ", ""))
        Motor.andarGirandoAntiHorario(graus)
    elif val.find("cabecaCima <= ") != -1:
        graus = float(val.replace("cabecaCima <= ", ""))
        Motor.cabecaCima(graus)
    elif val.find("cabecaEsquerda <= ") != -1:
        graus = float(val.replace("cabecaEsquerda <= ", ""))
        Motor.cabecaEsquerda(graus)
    elif val.find("bracoEsquerdoAntebraco <= ") != -1:
        graus = float(val.replace("bracoEsquerdoAntebraco <= ", ""))
        Motor.bracoEsquerdo("antebraco", graus)
    elif val.find("bracoEsquerdoMao <= ") != -1:
        graus = float(val.replace("bracoEsquerdoMao <= ", ""))
        Motor.bracoEsquerdo("mao", graus)
    elif val.find("bracoEsquerdoCotovelo <= ") != -1:
        graus = float(val.replace("bracoEsquerdoCotovelo <= ", ""))
        Motor.bracoEsquerdo("cotovelo", graus)
    elif val.find("bracoEsquerdoOmbro <= ") != -1:
        graus = float(val.replace("bracoEsquerdoOmbro <= ", ""))
        Motor.bracoEsquerdo("ombro", graus)
    elif val.find("bracoDireitoAntebraco <= ") != -1:
        graus = float(val.replace("bracoDireitoAntebraco <= ", ""))
        Motor.bracoDireito("antebraco", graus)
    elif val.find("bracoDireitoMao <= ") != -1:
        graus = float(val.replace("bracoDireitoMao <= ", ""))
        Motor.bracoDireito("mao", graus)
    elif val.find("bracoDireitoCotovelo <= ") != -1:
        graus = float(val.replace("bracoDireitoCotovelo <= ", ""))
        Motor.bracoDireito("cotovelo", graus)
    elif val.find("bracoDireitoOmbro <= ") != -1:
        graus = float(val.replace("bracoDireitoOmbro <= ", ""))
        Motor.bracoDireito("ombro", graus)
    elif val.find("bracosAntebraco <= ") != -1:
        graus = float(val.replace("bracosAntebraco <= ", ""))
        Motor.bracos("antebraco", graus)
    elif val.find("bracosMao <= ") != -1:
        graus = float(val.replace("bracosMao <= ", ""))
        Motor.bracos("mao", graus)
    elif val.find("bracosCotovelo <= ") != -1:
        graus = float(val.replace("bracosCotovelo <= ", ""))
        Motor.bracos("cotovelo", graus)
    elif val.find("bracosOmbro <= ") != -1:
        graus = float(val.replace("bracosOmbro <= ", ""))
        Motor.bracos("ombro", graus)
    elif val.find("rigidezCorpo <= ") != -1:
        rigidez = val.replace("rigidezCorpo <= ", "")
        Motor.rigidezCorpo(rigidez)
    elif val.find("rigidezCabeca <= ") != -1:
        rigidez = val.replace("rigidezCabeca <= ", "")
        Motor.rigidezCabeca(rigidez)
    elif val.find("rigidezBracos <= ") != -1:
        rigidez = val.replace("rigidezBracos <= ", "")
        Motor.rigidezBracos(rigidez)
    elif val.find("rigidezPernas <= ") != -1:
        rigidez = val.replace("rigidezPernas <= ", "")
        Motor.rigidezPernas(rigidez)
    elif val.find("rigidezBracoEsquerdo <= ") != -1:
        rigidez = val.replace("rigidezBracoEsquerdo <= ", "")
        Motor.rigidezBracoEsquerdo(rigidez)
    elif val.find("rigidezBracoDireito <= ") != -1:
        rigidez = val.replace("rigidezBracoDireito <= ", "")
        Motor.rigidezBracoDireito(rigidez)
    elif val.find("rigidezPernaEsquerda <= ") != -1:
        rigidez = val.replace("rigidezPernaEsquerda <= ", "")
        Motor.rigidezPernaEsquerda(rigidez)
    elif val.find("rigidezPernaDireita <= ") != -1:
        rigidez = val.replace("rigidezPernaDireita <= ", "")
        Motor.rigidezPernaDireita(rigidez)
    elif val == "posturaStand":
        Motor.posturaStand()
    elif val == "posturaStandInit":
        Motor.posturaStandInit()
    elif val == "posturaStandZero":
        Motor.posturaStandZero()
    elif val == "posturaCrouch":
        Motor.posturaCrouch()
    elif val == "posturaSit":
        Motor.posturaSit()
    # Motor
    # Sistema
    elif val == "reiniciar":
        Sistema.reiniciar()
    elif val == "desligar":
        Sistema.desligar()
    elif val == "reiniciarNAOQI":
        Sistema.reiniciarNAOQI()
    elif val.find("robotName") != -1:
        name = val.replace("robotName", "").replace(" <= ", "")
        name = Sistema.robotName(name)
        if emit != False:
            emit('nome_do_robo', { "name" : name })
    elif val.find("comando <= ") != -1:
        cmd = val.replace("comando <= ", "")
        Sistema.comando(cmd)
    # Sistema
    # Led
    elif val.find("ledCorpo <= ") != -1:
        colorHex = val.replace("ledCorpo <= ", "")
        Led.corpo(hex = colorHex)
    # Led
    # Falar
    elif val.find("texto <= ") != -1:
        texto = val.replace("texto <= ", "")
        print(texto)
        Audio.falar(texto)
    elif val.find("volume <= ") != -1:
        vol = int(val.replace("volume <= ", ""))
        Audio.setVolume(vol)
        emit("volume", { "volume" : Audio.getVolume() })
    # Falar
    # Outros
    elif val == "pararComportamentos":
        Comportamento.pararTodos()
    elif val.find("proximaAcao <= ") != -1:
        valor = val.replace("proximaAcao <= ", "")
        print("onNext: " + valor)
        Memoria.escrever("onNext", valor)
        time.sleep(3)
        Memoria.escrever("onNext", "")
        print("onNext foi limpo")

ipserver = ""

def ServerSocketIO():
    app = Flask(__name__)
    CORS(app)
    app.config['SECRET_KEY'] = 'secret!'
    socketio = SocketIO(app, cors_allowed_origins="*")
    cliente_id = str(uuid.uuid4())[0:16]
    nome = Sistema.robotName()

    @app.route('/')
    def index():
        return "Software desenvolvido por: Matheus Johann Araujo" #render_template('index.html')

    @app.route('/ipserver/<data>')
    def ipserver(data = ""):
        global ipserver
        if ipserver != str(data):
            ipserver = str(data)
            Memoria.escrever("ipserver", ipserver)
            print("ipserver=" + ipserver)
            Audio.falar("O endereço IP do servidor é: " + ipserver, speed = 70)
        return "ok"

    @socketio.on('connect')
    def connect():
        print('connection established')
        auth()

    @socketio.on('autenticar')
    def autenticar(params):
        print('autenticar', params)
        auth()

    def auth():
        emit('autenticacao', { 'cliente_id': cliente_id, 'nome': nome, 'volume': Audio.getVolume() })

    @socketio.on('listar_comportamentos')
    def listar_Comportamento(params):
        print('listar_comportamentos', params)
        emit('lista_de_comportamentos', { 'cliente_id': cliente_id, 'nome': nome, 'cmps': Comportamento.listar() })

    @socketio.on('iniciar_comportamento')
    def iniciar_comportamento(params):
        print('iniciar_comportamento', params)
        emit('executando_comportamento', { 'cliente_id': cliente_id, 'nome': nome, 'cmp': params["cmp"] })
        Led.corpoAzul(255)
        time.sleep(3)
        Motor.posturaCrouch()
        time.sleep(1)
        Led.corpoVerde(255)
        val = str(params["cmp"])
        time.sleep(1)
        AsyncThread.call(lambda : Comportamento.iniciar(val))
        Led.corpo(255, 255, 255)

    @socketio.on('parar_comportamento')
    def parar_comportamento(params):
        print('parar_comportamento', params)
        emit('parando_comportamento', { 'cliente_id': cliente_id, 'nome': nome, 'cmp': params["cmp"] })
        val = str(params["cmp"])
        AsyncThread.call(lambda : Comportamento.parar(val))

    @socketio.on('executar_funcionalidade')
    def executar_funcionalidade(params):
        print('executar_funcionalidade', params)
        val = str(params["fun"])
        funcionalidade(val, emit)

    @socketio.on('_ping')
    def _ping(params):
        global nivel
        #print('_ping', params)
        emit('_pong', params)
        emit('bateria', { 'bateria' : nivel })

    @socketio.on('disconnect')
    def disconnect():
        print('disconnected from server')

    socketio.run(app, host = '0.0.0.0', port = 4321)

Motor.posturaCrouch()
ServerSocketIO()
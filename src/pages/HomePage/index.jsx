import { useState, useEffect, useRef } from 'react';
import { auth, db } from '../../../services/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  arrayUnion,
  getDoc,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import axios from 'axios';

export default function Home() {
  const [usuario, setUsuario] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [chatId, setChatId] = useState(null);
  const [chats, setChats] = useState([]);
  const chatRef = useRef(null);
  const [ipRobo, setIpRobo] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [carregando, setCarregando] = useState(false);
  const [dadosUsuario, setDadosUsuario] = useState(null);

  // Autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) return (window.location.href = '/login');
      setUsuario(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const carregarDadosUsuario = async () => {
      if (!usuario?.uid) return;
  
      const usuarioRef = doc(db, 'chats', usuario.uid);
      const usuarioSnapshot = await getDoc(usuarioRef);
  
      if (usuarioSnapshot.exists()) {
        const dados = usuarioSnapshot.data();
        console.log("Dados: ",dados);
        setDadosUsuario({
          nome: dados.nome || '',
          sobrenome: dados.sobrenome || '',
          cargo: dados.cargo || '',
          organizacao: dados.organizacao || '',
        });
      } else {
        console.warn('Documento do usuário não encontrado.');
      }
    };
  
    carregarDadosUsuario();
  }, [usuario]);

  // Carrega os chats do usuário
  useEffect(() => {
    const carregarChats = async () => {
      if (!usuario?.uid) return;

      const conversasRef = collection(db, 'chats', usuario.uid, 'conversas');
      const snapshot = await getDocs(conversasRef);
      const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      setChats(lista);

      if (lista.length === 0) {
        const novoChat = await addDoc(conversasRef, {
          nome: 'Novo Chat',
          criadoEm: new Date(),
          mensagens: [],
        });
        setChatId(novoChat.id);
      } else {
        setChatId(lista[0].id);
      }
    };

    carregarChats();
  }, [usuario]);

  // Carrega mensagens do chat atual
  useEffect(() => {
    const carregarMensagens = async () => {
      if (!usuario?.uid || !chatId) return;

      const chatRef = doc(db, 'chats', usuario.uid, 'conversas', chatId);
      const docSnap = await getDoc(chatRef);
      if (docSnap.exists()) {
        setMensagens(docSnap.data().mensagens || []);
      }
    };

    carregarMensagens();
  }, [chatId, usuario]);
  
  // Função para gerar a resposta da IA (você pode integrar uma API real aqui)
  const responderIA = async (mensagemUsuario) => {
    try {
      const res = await axios.get(`/gemini/?question=${mensagemUsuario}`);
      // console.log(res.data.resposta);
      return `${res.data.resposta}`;
    } catch (error) {
      console.error(error);
      console.log("Erro ao buscar a resposta. Tente novamente.");
    }
  };

  const enviarMensagem = async () => {
    if (novaMensagem.trim() === '') return;
  
    const nova = {
      autor: 'usuario',
      texto: novaMensagem,
      timestamp: new Date(),
    };
  
    const carregandoMensagem = {
      autor: 'ia',
      texto: 'Carregando...',
      timestamp: new Date(),
    };
  
    setMensagens((prev) => [...prev, nova, carregandoMensagem]); // Adiciona a mensagem e o "Carregando..."
    setNovaMensagem('');
    setCarregando(true);
  
    try {
      const respostaTexto = await responderIA(novaMensagem);
      const resposta = {
        autor: 'ia',
        texto: respostaTexto,
        timestamp: new Date(),
      };
  
      // Substitui a última mensagem (Carregando...) pela resposta real
      setMensagens((prev) => {
        const mensagensAtualizadas = [...prev];
        mensagensAtualizadas[mensagensAtualizadas.length - 1] = resposta;
        return mensagensAtualizadas;
      });
  
      const chatRefDb = doc(db, 'chats', usuario.uid, 'conversas', chatId);
      await updateDoc(chatRefDb, {
        mensagens: arrayUnion(nova, resposta),
      });
    } catch (err) {
      console.error("Erro ao responder:", err);
  
      const erroResposta = {
        autor: 'ia',
        texto: 'Erro ao obter resposta.',
        timestamp: new Date(),
      };
  
      setMensagens((prev) => {
        const mensagensAtualizadas = [...prev];
        mensagensAtualizadas[mensagensAtualizadas.length - 1] = erroResposta;
        return mensagensAtualizadas;
      });
    } finally {
      setCarregando(false);
    }
  };  

  const handleLogout = () => {
    signOut(auth);
    window.location.href = '/';
  };

  const novoChat = async () => {
    const conversasRef = collection(db, 'chats', usuario.uid, 'conversas');
    const novo = await addDoc(conversasRef, {
      nome: `Novo chat`,
      criadoEm: new Date(),
      mensagens: [],
    });
    setChats((prev) => [...prev, { id: novo.id, nome: `Chat ${chats.length + 1}` }]);
    setChatId(novo.id);
    setMensagens([]);
  };

  const fetchIP = async () => {
    try {
      const res = await axios.post(`/nao/ip`, { robot_ip: ipRobo });
      console.log(res.data)      
    } catch (e) {
      console.log(e);
    }
  }

  const renomearChat = async (chatId, novoNome) => {
    try {
      const chatRef = doc(db, 'chats', usuario.uid, 'conversas', chatId);
      await updateDoc(chatRef, { nome: novoNome });
      setChats(prev => prev.map(c => c.id === chatId ? { ...c, nome: novoNome } : c));
    } catch (error) {
      console.error('Erro ao renomear o chat:', error);
    }
  };
  
  const excluirChat = async (chatIdParaExcluir) => {
    try {
      const chatRef = doc(db, 'chats', usuario.uid, 'conversas', chatIdParaExcluir);
      await deleteDoc(chatRef);
      const novosChats = chats.filter(chat => chat.id !== chatIdParaExcluir);
      setChats(novosChats);
      if (chatId === chatIdParaExcluir && novosChats.length > 0) {
        setChatId(novosChats[0].id);
      } else if (novosChats.length === 0) {
        await novoChat();
      }
    } catch (error) {
      console.error('Erro ao excluir o chat:', error);
    }
  };

  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("API de reconhecimento de fala não suportada neste navegador.");
      return;
    }
  
    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
  
    recognition.start();
  
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setNovaMensagem(transcript + "?");
    };
  
    recognition.onerror = (event) => {
      console.error("Erro no reconhecimento de fala:", event);
      alert("Erro ao reconhecer a fala.");
    };
  
    recognition.onend = async () => {
      console.log("Reconhecimento de fala finalizado.");
    };
  };

  const fetchQuestion = async (q) => {
    try {
      // eslint-disable-next-line no-unused-vars
      const ttsResponse = await axios.post(`/nao/ask`, { response: q, robot_ip: ipRobo });
    } catch (error) {
      console.error(error);
    }
  };  

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [mensagens]);

  return (
    <div style={styles.layout}>
      {/* Menu lateral */}
      <div style={styles.sidebar}>
        {/* Campo de IP do robô */}
        <div style={styles.ipSection}>
          <input
            type="text"
            placeholder="IP do Robô"
            value={ipRobo}
            onChange={(e) => setIpRobo(e.target.value)}
            style={styles.ipInput}
          />
          <button onClick={fetchIP} style={styles.conectarBtn}>Conectar</button>
        </div>

        <button onClick={novoChat} style={styles.novoChat}>+ Novo Chat</button>
        <ul style={styles.chatList}>
          {chats.map((chat) => (
            <li
              key={chat.id}
              style={{
                ...styles.chatItem,
                backgroundColor: chat.id === chatId ? '#e0e0e0' : 'transparent',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span onClick={() => setChatId(chat.id)} style={{ flex: 1, cursor: 'pointer' }}>{chat.nome}</span>
                <button onClick={() => {
                  const novoNome = prompt('Novo nome do chat:', chat.nome);
                  if (novoNome) renomearChat(chat.id, novoNome);
                }} title="Renomear">✏️</button>
                <button onClick={() => {
                  if (confirm('Deseja realmente excluir este chat?')) excluirChat(chat.id);
                }} title="Excluir">🗑️</button>
              </div>
            </li>
          ))}
        </ul>
      </div>


      {/* Área principal */}
      <div style={styles.container}>
        <div style={styles.header}>
          {dadosUsuario ? (
            <h2><span style={{ textTransform: 'capitalize' }}>{dadosUsuario.nome} {dadosUsuario.sobrenome} - {dadosUsuario.cargo}</span> {dadosUsuario.organizacao}</h2>
          ) : (
            <h2>Carregando dados do usuário...</h2>
          )}
          <button onClick={handleLogout} style={styles.logout}>Sair</button>
        </div>

        <div ref={chatRef} style={styles.chatBox}>
          {mensagens.map((msg, i) => (
            <div
              key={i}
              style={{
                ...styles.mensagem,
                alignSelf: msg.autor === 'usuario' ? 'flex-end' : 'flex-start',
                backgroundColor: msg.autor === 'usuario' ? '#DCF8C6' : '#E3E3E3',
                fontStyle: msg.texto === 'Carregando...' ? 'italic' : 'normal',
                opacity: msg.texto === 'Carregando...' ? 0.6 : 1,
              }}
            >
              {msg.texto}<br />
              {msg.autor === 'ia' && msg.texto !== 'Carregando...' && (
                <button
                  className="resend-button"
                  onClick={() => fetchQuestion(msg.texto)}
                  title="Reenviar como pergunta"
                >
                  ▶️
                </button>
              )}
            </div>
          ))}
        </div>

        <div style={styles.inputBox}>
          <input
            type="text"
            value={novaMensagem}
            onChange={(e) => setNovaMensagem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && enviarMensagem()}
            placeholder="Digite sua mensagem..."
            style={styles.input}
          />
          <button onClick={startSpeechRecognition} style={styles.enviar}>🎙️</button>
          <button onClick={enviarMensagem} style={styles.enviar}>Enviar</button>
        </div>
      </div>
    </div>
  );
}

// Estilos
const styles = {
  layout: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
  },
  sidebar: {
    width: '200px',
    backgroundColor: '#f0f0f0',
    borderRight: '1px solid #ccc',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
  },
  novoChat: {
    marginBottom: '1rem',
    padding: '0.5rem',
    backgroundColor: '#3f51b5',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  chatList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  chatItem: {
    padding: '0.5rem',
    marginBottom: '0.5rem',
    cursor: 'pointer',
    borderRadius: '4px',
  },
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: '1rem',
    backgroundColor: '#3f51b5',
    color: 'white',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logout: {
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    borderRadius: '4px',
  },
  chatBox: {
    flex: 1,
    padding: '1rem',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  mensagem: {
    maxWidth: '80%',
    padding: '0.75rem 1rem',
    borderRadius: '12px',
  },
  inputBox: {
    display: 'flex',
    padding: '1rem',
    borderTop: '1px solid #ccc',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    padding: '0.5rem',
    borderRadius: '8px',
    border: '1px solid #ccc',
    marginRight: '0.5rem',
  },
  enviar: {
    padding: '0.5rem 1rem',
    backgroundColor: '#3f51b5',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    margin: '0 5px'
  },
  ipSection: {
    marginBottom: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  ipInput: {
    padding: '0.5rem',
    borderRadius: '6px',
    border: '1px solid #ccc',
  },
  conectarBtn: {
    padding: '0.5rem',
    backgroundColor: '#4caf50',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  
};

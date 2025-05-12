import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import './style.css';

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [org, setOrg] = useState('');
  const [cargo, setCargo] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const [organizacoes, setOrganizacoes] = useState([]);
  const [cargosDisponiveis, setCargosDisponiveis] = useState([]);

  useEffect(() => {
    const fetchOrganizacoes = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'organizacao'));
        const orgs = snapshot.docs.map(doc => ({
          id: doc.id,
          nome: doc.data().nome,
          cargos: doc.data().cargos || []
        }));
        setOrganizacoes(orgs);
      } catch (error) {
        console.error('Erro ao buscar organizações:', error);
      }
    };

    fetchOrganizacoes();
  }, []);

  useEffect(() => {
    const orgSelecionada = organizacoes.find(o => o.id === org);
    setCargosDisponiveis(orgSelecionada ? orgSelecionada.cargos : []);
    setCargo(''); // limpa o cargo ao mudar organização
  }, [org, organizacoes]);

  const gerarEmail = () => {
    const orgObj = organizacoes.find(o => o.id === org);
    if (!usuario || !cargo || !orgObj) return '';
    return `${usuario}@${cargo[0]}.${orgObj.nome.replace(/\s+/g, '').toLowerCase()}`;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    const email = gerarEmail();

    try {
      await signInWithEmailAndPassword(auth, email, senha);
      setSucesso('Login realizado com sucesso!');
      window.location.href = '/home';
    } catch (error) {
      setErro('Credenciais inválidas.');
      console.error(error);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div className="input-group">
          <input
            type="text"
            id="usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
            placeholder=" "
          />
          <label htmlFor="usuario">Nome de usuário</label>
        </div>

        <div className="input-group">
          <select
            id="org"
            value={org}
            onChange={(e) => setOrg(e.target.value)}
            required
          >
            <option value="">Selecione a organização</option>
            {organizacoes.map((o) => (
              <option key={o.id} value={o.id}>{o.nome}</option>
            ))}
          </select>
          <label htmlFor="org">Organização</label>
        </div>

        {cargosDisponiveis.length > 0 && (
          <div className="input-group">
            <select
              id="cargo"
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              required
            >
              <option value="">Selecione o cargo</option>
              {cargosDisponiveis.map((c, index) => (
                <option key={index} value={c}>{c}</option>
              ))}
            </select>
            <label htmlFor="cargo">Cargo</label>
          </div>
        )}

        <div className="input-group">
          <input
            type="password"
            id="senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            placeholder=" "
          />
          <label htmlFor="senha">Senha</label>
        </div>

        <button type="submit">Entrar</button>
      </form>

      {erro && <p className="erro">{erro}</p>}
      {sucesso && <p className="sucesso">{sucesso}</p>}
    </div>
  );
}

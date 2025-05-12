import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../services/firebase';

export default function SplashScreen() {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
      setCarregando(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!carregando) {
      if (usuario) {
        window.location.href = "/home";
      } else {
        window.location.href = "/login";
      }
    }
  }, [carregando, usuario]);

  return (
    <div style={styles.container}>
      <img src="/prometeus-logo.png" alt="Carregando" style={styles.image} />
    </div>
  );
}

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3f51b5',
  },
  image: {
    width: '100vw',
    height: '100vh',
    objectFit: 'cover',
  },
};
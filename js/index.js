// index.js

 import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
    import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

    const firebaseConfig = {
      apiKey: "AIzaSyDAG_nfsNFNk6ZnhTnC9Cci-N6L3Bui4PY",
      authDomain: "trancaeletronica-90835.firebaseapp.com",
      projectId: "trancaeletronica-90835",
      storageBucket: "trancaeletronica-90835.appspot.com",
      messagingSenderId: "566150115221",
      appId: "1:566150115221:web:1c6eaf30767894dbfd909c"
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    const loginForm = document.getElementById('loginForm');
    const loginMessage = document.getElementById('loginMessage');

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();

      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        loginMessage.style.color = 'green';
        loginMessage.textContent = 'Login realizado com sucesso!';
        setTimeout(() => {
          window.location.href = "home.html";
        }, 1000);
      } catch (error) {
        console.error("Erro ao fazer login:", error.message);
        loginMessage.style.color = 'red';
        loginMessage.textContent = "Email ou senha incorretos.";
      }
    });
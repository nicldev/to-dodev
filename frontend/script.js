// Configuração do Parse/Back4App
const PARSE_APP_ID = '4d5JAWOdyRrprbwJVlLqmTn1OHiLNep68lQrEfJL';
const PARSE_JS_KEY = 'oC3FJDJS99UeHfs3bEkSoFEK8N4ARAVdy5myU1rg';
const PARSE_SERVER_URL = 'https://parseapi.back4app.com';

// Inicialize o Parse SDK
Parse.initialize(PARSE_APP_ID, PARSE_JS_KEY);
Parse.serverURL = PARSE_SERVER_URL;

// Função de Registro
document.getElementById('register-btn').addEventListener('click', async function(e) {
    e.preventDefault();
    const username = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    const user = new Parse.User();
    user.set('username', username);
    user.set('email', email);
    user.set('password', password);

    try {
        await user.signUp();
        alert('Usuário registrado com sucesso!');
        container.classList.remove("right-panel-active");
    } catch (error) {
        alert(`Erro: ${error.message}`);
    }
});

// Função de Login
document.getElementById('login-btn').addEventListener('click', async function(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const user = await Parse.User.logIn(email, password);
        alert(`Bem-vindo, ${user.get('username')}!`);
        
        // Armazena a sessão
        localStorage.setItem('parseSession', JSON.stringify({
            id: user.id,
            sessionToken: user.get('sessionToken'),
            username: user.get('username'),
            email: user.get('email')
        }));
        
        // Redireciona para a dashboard
        window.location.href = 'dashboard.html';
    } catch (error) {
        alert(`Erro: ${error.message}`);
    }
});
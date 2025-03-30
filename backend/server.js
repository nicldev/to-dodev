require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Conexão com MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/auth_demo', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Modelo de Usuário
const User = mongoose.model('User', {
    name: String,
    email: { type: String, unique: true },
    password: String
});

// Middleware de autenticação
const authenticate = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).send('Acesso negado');

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).send('Token inválido');
    }
};

// Rotas
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Validações
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Preencha todos os campos' });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' });
        }

        // Verificar se usuário já existe
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ error: 'Email já cadastrado' });
        }

        // Hash da senha
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Criar usuário
        const user = new User({ name, email, password: hashedPassword });
        await user.save();

        // Criar token JWT
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET || 'secret123');
        
        res.json({ token, user: { _id: user._id, name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Verificar se usuário existe
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Email ou senha incorretos' });
        }

        // Verificar senha
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Email ou senha incorretos' });
        }

        // Criar token JWT
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET || 'secret123');
        
        res.json({ token, user: { _id: user._id, name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/user', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
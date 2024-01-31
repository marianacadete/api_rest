const express = require('express')
const { Pool } = require('pg')
require('dotenv').config()

const PORT = 3332

const pool = new Pool ({
    connectionString: 'postgres://efrbkzze:Kjddq0uUNrentoRCV88-k8sxoFIrdqQL@kesavan.db.elephantsql.com/efrbkzze'
})

const app = express()

app.use(express.json())

app.get('/',  (req,res) => {console.log(process.env)})
app.get('/users', async(req,res) => {
    try {
        const {rows} = await pool.query('select * from users')
        return res.status(200).send(rows)
        } catch (err) { 
        return res.status(400).send(err)
        }
})


app.post('/session', async (req, res) => {
    const { username, age, email } = req.body;
    try {  
        if (!username || !email) {
            return res.status(400).send("Os campos 'username' e 'email' são obrigatórios.");
        }
        // Verificar se já existe um usuário com o mesmo email
        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (existingUser.rows.length > 0) {
            return res.status(400).send("Já existe um usuário com o mesmo email.");
        }
        //Inserir novo user 
        const newSession = await pool.query('INSERT INTO users (name, age, email) VALUES ($1, $2, $3) RETURNING *', [username, age, email]);
        return res.status(200).send(newSession.rows);
    } catch (err) {
        return res.status(400).send(err);
    }
});






app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

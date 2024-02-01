const express = require('express')
const { Pool } = require('pg')
require('dotenv').config()

const PORT = 3332

const pool = new Pool ({
    connectionString: 'postgres://efrbkzze:Kjddq0uUNrentoRCV88-k8sxoFIrdqQL@kesavan.db.elephantsql.com/efrbkzze'
})

const app = express()

app.use(express.json())

//app.get('/',  (req,res) => {console.log(process.env)})

// consultar 'users' 
app.get('/users', async(req,res) => {
    try {
        const {rows} = await pool.query('select * from users')
        return res.status(200).send(rows)
        } catch (err) { 
        return res.status(400).send(err)
        }
})


// Inserir  'users' 
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


// Consultar 'todos'
app.get('/todo/:user_id?', async (req, res) => {
    try {
        // Se user_id for fornecido na URL, use-o; caso contrário, deixe user_id como undefined
        const user_id = req.params.user_id;

        let query;
        let queryParams;

        if (user_id) {
            // Se user_id foi fornecido, inclua na consulta SQL
            query = 'SELECT * FROM todos WHERE user_id = ($1)';
            queryParams = [user_id];
        } else {
            // Se user_id não foi fornecido, consulte todos os registros
            query = 'SELECT * FROM todos';
            queryParams = [];
        }
        
        const allTodos = await pool.query(query, queryParams);
        return res.status(200).send(allTodos.rows);
    } catch (err) {
        return res.status(400).send(err);
    }
});



// Inserir novo 'todo' 
app.post('/todo', async (req,res ) => {
    const {user_id, todo_description ,todo_done} = req.body
    try{
        //verificar se o user digitado existe na tabela
        const verifyUser = await pool.query('SELECT * FROM users WHERE id = $1', [user_id]);

        if (verifyUser.rows.length < 1) {
            return res.status(400).send("Não existe usuário com esse ID.");
        }

        //Inserir novo user 
        const inserirTodo = await pool.query('INSERT INTO todos (user_id, todo_description ,todo_done  ) VALUES  ($1, $2, $3) RETURNING *', [user_id, todo_description ,todo_done])
        return res.status(200).send(inserirTodo.rows)
    } catch (err) {
        return res.status(400).send(err)
    }
});







// Alterar  'todo' 
app.put('/todo/:todo_id', async (req,res) => {
    const {todo_id} = req.params
    const data = req.body
    try{
        const alterTodo = await pool.query( 'UPDATE todos SET todo_done = true where todo_id = ($1)  RETURNING *', [todo_id])
        return res.status(200).send(alterTodo.rows)
        } catch (err) {
            return res.status(400).send(err)
        }
} )




app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

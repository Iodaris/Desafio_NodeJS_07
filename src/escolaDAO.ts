const { Client } = require('pg');

class EscolaDao {
    client: any;
    constructor() {
        this.client = new Client({
            user: 'postgres',
            host: 'localhost',
            database: 'postgres',
            password: '5633123',
            port: 7000,
        });
    }

    async connect() {
        try {
            await this.client.connect();
            console.log('Conectado ao banco de dados com sucesso!');
        } catch (err) {
            console.error('Erro ao conectar ao banco de dados:', err);
            throw err;
        }
    }

    async disconnect() {
        try {
            await this.client.end();
            console.log('Conexão com o banco de dados encerrada.');
        } catch (err) {
            console.error('Erro ao encerrar a conexão com o banco de dados:', err);
        }
    }

    async inserirAluno(nome: any) {
        const query = 'INSERT INTO alunos (nome) VALUES ($1) RETURNING id';
        try {
            const res = await this.client.query(query, [nome]);
            const alunoId = res.rows[0].id;
            console.log(`ID retornado para o aluno '${nome}': ${alunoId}`);
            return alunoId;
        } catch (err) {
            console.error(`Erro ao adicionar o aluno '${nome}':`, err);
            throw err;
        }
    }
    
    async inserirCurso(nome: any, alunoId: any) {
        const query = 'INSERT INTO cursos (nome, aluno_id) VALUES ($1, $2)';
        try {
            await this.client.query(query, [nome, alunoId]);
            console.log(`Curso '${nome}' foi adicionado com sucesso para o aluno ID '${alunoId}'!`);
        } catch (err) {
            console.error(`Erro ao adicionar o curso '${nome}':`, err);
            throw err;
        }
    }
    
    async editarAluno(id: number, novoNome: string) {
        const query = 'UPDATE alunos SET nome = $1 WHERE id = $2';
        try {
            const res = await this.client.query(query, [novoNome, id]);
            if (res.rowCount > 0) {
                console.log(`Aluno com ID ${id} foi atualizado para o nome '${novoNome}'!`);
            } else {
                console.log(`Nenhum aluno encontrado com o ID ${id}.`);
            }
        } catch (err) {
            console.error(`Erro ao atualizar o aluno com ID ${id}:`, err);
            throw err;
        }
    }
    
}

module.exports = EscolaDao;
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

    async inserirAluno(nome: string, cpf: string) {
      const checkCpfQuery = 'SELECT COUNT(*) FROM alunos WHERE cpf = $1';
      const insertQuery = 'INSERT INTO alunos (nome, cpf) VALUES ($1, $2) RETURNING id';
  
      try {
          const cpfCheckRes = await this.client.query(checkCpfQuery, [cpf]);
          if (parseInt(cpfCheckRes.rows[0].count, 10) > 0) {
              throw new Error(`Erro: O CPF '${cpf}' já está cadastrado. Tente outro CPF.`);
          }
  
          const res = await this.client.query(insertQuery, [nome, cpf]);
          const alunoId = res.rows[0].id;
          console.log(`Aluno '${nome}' com CPF '${cpf}' foi adicionado com sucesso! ID: ${alunoId}`);
          return alunoId;
  
      } catch (err: any) {
          
          console.error('Erro ao adicionar aluno. Certifique-se de que as informações estão corretas e tente novamente.');
          
          console.log(err); 
          throw new Error('Erro: Não foi possível adicionar o aluno.');
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
    async editarCurso(id: number, novoNome: string) {
        const query = 'UPDATE cursos SET nome = $1 WHERE id = $2';
        try {
            const res = await this.client.query(query, [novoNome, id]);
            if (res.rowCount > 0) {
                console.log(`Curso com ID ${id} foi atualizado para o nome '${novoNome}'!`);
            } else {
                console.log(`Nenhum curso encontrado com o ID ${id}.`);
            }
        } catch (err) {
            console.error(`Erro ao atualizar o curso com ID ${id}:`, err);
            throw err;
        }
    }
    
}

module.exports = EscolaDao;
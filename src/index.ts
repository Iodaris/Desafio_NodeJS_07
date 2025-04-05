/**
 * Required External Modules
 */

import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";

dotenv.config();

/**
 * App Variables
 */

if (!process.env.PORT) {
  process.exit(1);
}

const PORT: number = parseInt(process.env.PORT as string, 10);

const app = express();

/**
 *  App Configuration
 */

app.use(helmet());
app.use(cors());
app.use(express.json());

/**
 * Server Activation
 */

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);

  const EscolaDao = require('./EscolaDao');
  const readline = require('readline');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  async function perguntar(mensagem: string): Promise<string> {
    return new Promise((resolve) => {
      rl.question(mensagem, (resposta: string) => {
        resolve(resposta.trim());
      });
    });
  }

  async function menuPrincipal() {
    const escolaDao = new EscolaDao();

    try {
      await escolaDao.connect();

      let continuar = true;
      while (continuar) {
        console.log('\nMenu Principal:');
        console.log('1 - Adicionar alunos e cursos');
        console.log('2 - Editar aluno');
        console.log('3 - Editar curso');
        console.log('4 - Sair');

        const opcao = await perguntar('Escolha uma opção: ');

        switch (opcao) {
          case '1':
            await adicionarAlunosECursos(escolaDao);
            break;
          case '2':
            await editarNomeAluno(escolaDao);
            break;
          case '3':
            await editarNomeCurso(escolaDao);
            break;
          case '4':
            console.log('Encerrando o programa...');
            continuar = false;
            break;
          default:
            console.log('Opção inválida. Por favor, tente novamente.');
        }

        if (continuar) {
          const respostaContinuar = await perguntar('Deseja realizar outra ação? (s/n): ');
          if (respostaContinuar.toLowerCase() !== 's') {
            continuar = false;
            console.log('Encerrando o programa...');
          }
        }
      }
    } catch (err: any) {
      console.error('Erro no menu principal:', err.message);
    } finally {
      rl.close();
      await escolaDao.disconnect();
    }
  }

  async function adicionarAlunosECursos(escolaDao: EscolaDao) {
    try {
      async function perguntarQuantidade(): Promise<number> {
        while (true) {
          try {
            const resposta = await perguntar('Quantos alunos deseja adicionar? ');
            const quantidade = Number(resposta.trim());
            if (isNaN(quantidade) || quantidade <= 0) {
              throw new Error('Erro: Entrada inválida. Digite um número maior que zero.');
            }
            return quantidade;
          } catch (err: any) {
            console.error(err.message);
          }
        }
      }

      const quantidade = await perguntarQuantidade();

      for (let i = 0; i < quantidade; i++) {
        const nomeAluno = await perguntar(`Digite o nome do aluno ${i + 1}: `);
        if (!nomeAluno) {
          console.error('Erro: Nome inválido. Por favor, tente novamente.');
          i--;
          continue;
        }

        const cpfAluno = await perguntar(`Digite o CPF do aluno ${i + 1}: `);
        if (!cpfAluno || cpfAluno.length !== 11 || isNaN(Number(cpfAluno))) {
          console.error('Erro: CPF inválido. Por favor, tente novamente.');
          i--;
          continue;
        }

        let alunoId;
        try {
          alunoId = await escolaDao.inserirAluno(nomeAluno, cpfAluno);
        } catch (error: any) {
          console.error('Erro: O CPF informado já está cadastrado. Tente novamente.');
          i--;
          continue;
        }

        const nomeCurso = await perguntar(`Digite o curso do aluno ${i + 1}: `);
        if (!nomeCurso) {
          console.error('Erro: Curso inválido. Por favor, tente novamente.');
          i--;
          continue;
        }

        try {
          await escolaDao.inserirCurso(nomeCurso, alunoId);
        } catch (error: any) {
          console.error('Erro: Erro ao cadastrar o curso. Tente novamente.');
          i--;
          continue;
        }

        console.log(`Aluno '${nomeAluno}' com CPF '${cpfAluno}' e curso '${nomeCurso}' adicionados com sucesso!`);
      }
    } catch (err: any) {
      console.error('Erro ao salvar no banco de dados:', err.message);
    }
  }

  async function editarNomeAluno(escolaDao: EscolaDao) {
    try {
      const id = Number(await perguntar('Digite o ID do aluno que deseja editar: '));
      if (isNaN(id) || id <= 0) {
        console.error('Erro: ID inválido.');
        return;
      }

      const novoNome = await perguntar('Digite o novo nome do aluno: ');
      if (!novoNome) {
        console.error('Erro: O nome não pode ser vazio.');
        return;
      }

      await escolaDao.editarAluno(id, novoNome);
      console.log(`Aluno com ID ${id} foi atualizado para '${novoNome}' com sucesso!`);
    } catch (err: any) {
      console.error('Erro ao editar o aluno:', err.message);
    }
  }

  async function editarNomeCurso(escolaDao: EscolaDao) {
    try {
      const id = Number(await perguntar('Digite o ID do curso que deseja editar: '));
      if (isNaN(id) || id <= 0) {
        console.error('Erro: ID inválido.');
        return;
      }

      const novoNome = await perguntar('Digite o novo nome do curso: ');
      if (!novoNome) {
        console.error('Erro: O nome do curso não pode ser vazio.');
        return;
      }

      await escolaDao.editarCurso(id, novoNome);
      console.log(`Curso com ID ${id} foi atualizado para '${novoNome}' com sucesso!`);
    } catch (err: any) {
      console.error('Erro ao editar o curso:', err.message);
    }
  }

  menuPrincipal();

});  
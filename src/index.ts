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

	async function adicionarAlunosECursos() {
		const escolaDao = new EscolaDao();

		try {
			await escolaDao.connect();

			function perguntarQuantidade(): Promise<number> {
				return new Promise((resolve, reject) => {
					rl.question('Quantos alunos deseja adicionar? ', (resposta: string) => {
						const quantidade = Number(resposta.trim());
						if (isNaN(quantidade) || quantidade <= 0) {
							reject('Entrada inválida.');
						} else {
							resolve(quantidade);
						}
					});
				});
			}

			const quantidade = await perguntarQuantidade();
			for (let i = 0; i < quantidade; i++) {
				const nomeAluno: string = await new Promise((resolve) => {
					rl.question(`Digite o nome do aluno ${i + 1}: `, (nome: string) => {
						resolve(nome.trim());
					});
				});

				if (!nomeAluno) {
					console.error('Nome inválido. Por favor, tente novamente.');
					i--;
					continue;
				}

				const alunoId = await escolaDao.inserirAluno(nomeAluno);

				if (!alunoId) {
					console.error('Erro ao recuperar o ID do aluno. Tente novamente.');
					i--;
					continue;
				}

				const nomeCurso = await new Promise((resolve) => {
					rl.question(`Digite o curso do aluno ${i + 1}: `, (curso: string) => {
						resolve(curso.trim());
					});
				});

				if (!nomeCurso) {
					console.error('Curso inválido. Por favor, tente novamente.');
					i--;
					continue;
				}

				await escolaDao.inserirCurso(nomeCurso, alunoId);

				console.log(`Aluno '${nomeAluno}' e curso '${nomeCurso}' adicionados com sucesso!`);
			}

			await editarNomeAluno(escolaDao);
		} catch (err: any) {
			console.error('Erro ao salvar no banco de dados:', err.message);
		} finally {
			rl.close();
			await escolaDao.disconnect();
		}
	}

	async function editarNomeAluno(escolaDao: { editarAluno: (arg0: unknown, arg1: {}) => any; }) {
		try {
			const id = await new Promise((resolve) => {
				rl.question('Digite o ID do aluno que deseja editar: ', (resposta: string) => {
					resolve(Number(resposta.trim()));
				});
			});

			const novoNome = await new Promise((resolve) => {
				rl.question('Digite o novo nome do aluno: ', (nome: string) => {
					resolve(nome.trim());
				});
			});

			if (!novoNome) {
				console.error('O nome não pode ser vazio.');
				return;
			}

			await escolaDao.editarAluno(id, novoNome);

		} catch (err: any) {
			console.error('Erro ao editar o aluno:', err.message);
		}
	}

	adicionarAlunosECursos();

});
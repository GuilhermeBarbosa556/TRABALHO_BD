const Aluno = require('../modelos/alunoModelo');

const responder = (res, dados, status = 200) => res.status(status).json(dados);
const erro = (res, mensagem, status = 500) => responder(res, { error: mensagem }, status);

exports.obterTodosAlunos = async (req, res) => {
  try {
    responder(res, await Aluno.buscarTodos());
  } catch (e) {
    erro(res, e.message);
  }
};

exports.obterAlunoPorId = async (req, res) => {
  try {
    const aluno = await Aluno.buscarPorId(req.params.id);
    aluno ? responder(res, aluno) : erro(res, 'Aluno não encontrado', 404);
  } catch (e) {
    erro(res, e.message);
  }
};

exports.criarAluno = async (req, res) => {
  try {
    if (!req.body.nome || !req.body.email) return erro(res, 'Nome e email são obrigatórios', 400);
    const { insertedId } = await Aluno.criar(req.body);
    responder(res, { message: 'Aluno criado com sucesso', alunoId: insertedId }, 201);
  } catch (e) {
    erro(res, e.message);
  }
};

exports.atualizarAluno = async (req, res) => {
  try {
    const { matchedCount } = await Aluno.atualizar(req.params.id, req.body);
    matchedCount ? responder(res, { message: 'Aluno atualizado com sucesso' }) : 
                  erro(res, 'Aluno não encontrado', 404);
  } catch (e) {
    erro(res, e.message);
  }
};

exports.excluirAluno = async (req, res) => {
  try {
    const { deletedCount } = await Aluno.excluir(req.params.id);
    deletedCount ? responder(res, { message: 'Aluno excluído com sucesso' }) : 
                  erro(res, 'Aluno não encontrado', 404);
  } catch (e) {
    erro(res, e.message);
  }
};
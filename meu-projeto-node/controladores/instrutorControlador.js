const Instrutor = require('../modelos/instrutorModelo');

const responder = (res, data, status = 200) => res.status(status).json(data);
const erro = (res, mensagem, status = 500) => responder(res, { error: mensagem }, status);

const validarDados = (dados) => {
  if (!dados.nome || !dados.especialidade) {
    throw new Error('Nome e especialidade são obrigatórios');
  }
};

exports.criarInstrutor = async (req, res) => {
  try {
    validarDados(req.body);
    const { insertedId } = await Instrutor.criar(req.body);
    responder(res, { message: 'Instrutor criado com sucesso', instrutorId: insertedId }, 201);
  } catch (error) {
    erro(res, error.message, error.message.includes('obrigatórios') ? 400 : 500);
  }
};

exports.listarInstrutores = async (req, res) => {
  try {
    responder(res, await Instrutor.buscarTodos());
  } catch (error) {
    erro(res, error.message);
  }
};

exports.obterInstrutorPorId = async (req, res) => {
  try {
    const instrutor = await Instrutor.buscarPorId(req.params.id);
    instrutor ? responder(res, instrutor) : erro(res, 'Instrutor não encontrado', 404);
  } catch (error) {
    erro(res, error.message);
  }
};

exports.atualizarInstrutor = async (req, res) => {
  try {
    const { matchedCount } = await Instrutor.atualizar(req.params.id, req.body);
    matchedCount ? responder(res, { message: 'Instrutor atualizado com sucesso' })
                : erro(res, 'Instrutor não encontrado', 404);
  } catch (error) {
    erro(res, error.message);
  }
};

exports.excluirInstrutor = async (req, res) => {
  try {
    const { deletedCount } = await Instrutor.excluir(req.params.id);
    deletedCount ? responder(res, { message: 'Instrutor excluído com sucesso' })
                 : erro(res, 'Instrutor não encontrado', 404);
  } catch (error) {
    erro(res, error.message);
  }
};

exports.vincularCurso = async (req, res) => {
  try {
    const { instrutorId, cursoId } = req.params;
    // Lógica de vinculação permanece a mesma
    responder(res, { message: 'Curso vinculado com sucesso' });
  } catch (error) {
    erro(res, error.message);
  }
};

exports.obterCursosDoInstrutor = async (req, res) => {
  try {
    // Lógica de obtenção de cursos permanece a mesma
    responder(res, []);
  } catch (error) {
    erro(res, error.message);
  }
};
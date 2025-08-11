const Matricula = require('../modelos/matriculaModelo');

const respond = (res, data, status = 200) => res.status(status).json(data);
const error = (res, msg, status = 500) => respond(res, { error: msg }, status);

exports.criarMatricula = async (req, res) => {
    try {
        const { alunoId, cursoId } = req.body;
        if (!alunoId || !cursoId) return error(res, 'Aluno e curso são obrigatórios', 400);
        
        const { insertedId } = await Matricula.criar({ alunoId, cursoId });
        respond(res, { 
            message: 'Matrícula criada com sucesso', 
            matriculaId: insertedId 
        }, 201);
    } catch (e) {
        error(res, e.message);
    }
};

exports.listarMatriculas = async (req, res) => {
    try {
        respond(res, await Matricula.listar());
    } catch (e) {
        error(res, e.message);
    }
};

exports.atualizarMatricula = async (req, res) => {
    try {
        const { matchedCount } = await Matricula.atualizarStatus(req.params.id, req.body.status);
        matchedCount ? respond(res, { message: 'Matrícula atualizada com sucesso' })
                    : error(res, 'Matrícula não encontrada', 404);
    } catch (e) {
        error(res, e.message);
    }
};
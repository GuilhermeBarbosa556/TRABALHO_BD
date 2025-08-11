const { getBanco } = require('./banco');
const { ObjectId } = require('mongodb');

class Matricula {
    static #collection() {
        return getBanco().collection('matriculas');
    }

    static #toObjectId(id) {
        return new ObjectId(id);
    }

    static async criar({ alunoId, cursoId }) {
        return await this.#collection().insertOne({
            aluno_id: this.#toObjectId(alunoId),
            curso_id: this.#toObjectId(cursoId),
            data_matricula: new Date(),
            status: 'ativo'
        });
    }

    static async listar() {
        return await this.#collection().aggregate([
            { $match: { status: 'ativo' } },
            { 
                $lookup: {
                    from: 'alunos',
                    localField: 'aluno_id',
                    foreignField: '_id',
                    as: 'aluno'
                }
            },
            { $unwind: '$aluno' },
            { 
                $lookup: {
                    from: 'cursos',
                    localField: 'curso_id',
                    foreignField: '_id',
                    as: 'curso'
                }
            },
            { $unwind: '$curso' },
            { 
                $project: {
                    'aluno.data_cadastro': 0,
                    'curso.descricao': 0,
                    'curso.data_criacao': 0
                }
            }
        ]).toArray();
    }

    static async atualizarStatus(id, status) {
        return await this.#collection().updateOne(
            { _id: this.#toObjectId(id) },
            { $set: { status } }
        );
    }
}

module.exports = Matricula;
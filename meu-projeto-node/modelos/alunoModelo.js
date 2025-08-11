const { getBanco } = require('./banco');
const { ObjectId } = require('mongodb');

const formatarCPF = cpf => cpf?.replace(/\D/g,'').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') || '';
const formatarCEP = cep => cep?.replace(/\D/g,'').replace(/(\d{5})(\d{3})/, '$1-$2') || '';
const formatarTelefone = tel => {
  if (!tel) return '';
  const numeros = tel.replace(/\D/g,'');
  return numeros.length === 11 
    ? numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    : numeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
};

class Aluno {
  static #colecao() {
    return getBanco().collection('alunos');
  }

  static #dadosAluno(dados) {
    return {
      nome: dados.nome,
      email: dados.email,
      telefone: dados.telefone,
      cpf: dados.cpf,
      rg: dados.rg,
      dataNascimento: dados.dataNascimento,
      endereco: {
        cep: dados.cep,
        rua: dados.rua,
        numero: dados.numero,
        complemento: dados.complemento,
        bairro: dados.bairro,
        cidade: dados.cidade,
        estado: dados.estado
      },
      ...(dados.data_cadastro ? {} : { data_cadastro: new Date() })
    };
  }

  static async criar(dados) {
    return await this.#colecao().insertOne(this.#dadosAluno(dados));
  }

  static async buscarTodos() {
    return await this.#colecao().find().toArray();
  }

  static async buscarPorId(id) {
    const aluno = await this.#colecao().findOne({ _id: new ObjectId(id) });
    return aluno ? {
      ...aluno,
      cpf: formatarCPF(aluno.cpf),
      telefone: formatarTelefone(aluno.telefone),
      endereco: {
        ...aluno.endereco,
        cep: formatarCEP(aluno.endereco?.cep)
      }
    } : null;
  }

  static async excluir(id) {
    return await this.#colecao().deleteOne({ _id: new ObjectId(id) });
  }

  static async atualizar(id, dados) {
    return await this.#colecao().updateOne(
      { _id: new ObjectId(id) },
      { $set: this.#dadosAluno(dados) }
    );
  }
}

module.exports = Aluno;

document.addEventListener('DOMContentLoaded', () => {
    // ========== CONFIGURAÇÃO DAS ABAS ==========
    function setupTabs() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

                btn.classList.add('active');
                const tabId = btn.getAttribute('data-tab');
                document.getElementById(tabId).classList.add('active');
                window.scrollTo(0, 0);
            });
        });
    }

    // ========== SISTEMA DE MENSAGENS ==========
    function showMessage(message, isError = false, parentElement = document.querySelector('.container')) {
        const messageDiv = document.createElement('div');
        messageDiv.className = isError ? 'error-message' : 'success-message';
        messageDiv.textContent = message;

        parentElement.insertBefore(messageDiv, parentElement.firstChild);

        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    function recarregarPaginaComMensagem(mensagem, isError = false) {
        const abaAtiva = document.querySelector('.tab-btn.active')?.getAttribute('data-tab');
        if (abaAtiva) {
            sessionStorage.setItem('ultimaAbaAtiva', abaAtiva);
        }

        sessionStorage.setItem('ultimaMensagem', mensagem);
        sessionStorage.setItem('mensagemErro', isError);

        window.location.reload();
        window.scrollTo(0, 0);
    }

    // ========== MÁSCARAS DE FORMULÁRIO ==========
    function aplicarMascara(input, tipo) {
        if (!input) return;

        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');

            switch(tipo) {
                case 'cpf':
                    if (value.length > 3) value = value.substring(0, 3) + '.' + value.substring(3);
                    if (value.length > 7) value = value.substring(0, 7) + '.' + value.substring(7);
                    if (value.length > 11) value = value.substring(0, 11) + '-' + value.substring(11);
                    e.target.value = value.substring(0, 14);
                    break;

                case 'cep':
                    if (value.length > 5) value = value.substring(0, 5) + '-' + value.substring(5);
                    e.target.value = value.substring(0, 9);
                    break;

                case 'telefone':
                    if (value.length > 0) value = '(' + value.substring(0, 2) + ') ' + value.substring(2);
                    if (value.length > 10) value = value.substring(0, 10) + '-' + value.substring(10);
                    else if (value.length > 9) value = value.substring(0, 9) + '-' + value.substring(9);
                    e.target.value = value.substring(0, 15);
                    break;
            }
        });
    }

    function aplicarMascaras() {
        // Máscaras para alunos
        const cpfAluno = document.getElementById('cpf');
        const cepAluno = document.getElementById('cep');
        const telAluno = document.getElementById('telefone');

        if (cpfAluno) aplicarMascara(cpfAluno, 'cpf');
        if (cepAluno) aplicarMascara(cepAluno, 'cep');
        if (telAluno) aplicarMascara(telAluno, 'telefone');

        // Máscaras para instrutores
        const cpfInstrutor = document.getElementById('instrutorCpf');
        const cepInstrutor = document.getElementById('instrutorCep');
        const telInstrutor = document.getElementById('instrutorTelefone');

        if (cpfInstrutor) aplicarMascara(cpfInstrutor, 'cpf');
        if (cepInstrutor) aplicarMascara(cepInstrutor, 'cep');
        if (telInstrutor) aplicarMascara(telInstrutor, 'telefone');
    }

    // ========== VALIDAÇÕES ==========
    function validarCPF(cpf) {
        cpf = cpf.replace(/\D/g, '');
        if (cpf.length !== 11) return false;

        // Validação dos dígitos verificadores
        let soma = 0;
        let resto;

        if (/^(\d)\1+$/.test(cpf)) return false;

        for (let i = 1; i <= 9; i++) {
            soma += parseInt(cpf.substring(i-1, i)) * (11 - i);
        }
        resto = (soma * 10) % 11;

        if ((resto === 10) || (resto === 11)) resto = 0;
        if (resto !== parseInt(cpf.substring(9, 10))) return false;

        soma = 0;
        for (let i = 1; i <= 10; i++) {
            soma += parseInt(cpf.substring(i-1, i)) * (12 - i);
        }
        resto = (soma * 10) % 11;

        if ((resto === 10) || (resto === 11)) resto = 0;
        if (resto !== parseInt(cpf.substring(10, 11))) return false;

        return true;
    }

    function validarCEP(cep) {
        cep = cep.replace(/\D/g, '');
        return cep.length === 8;
    }

    function validarTelefone(tel) {
        tel = tel.replace(/\D/g, '');
        return tel.length >= 10 && tel.length <= 11;
    }

    function validarEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // ========== GERENCIAMENTO DE ALUNOS ==========
    if (document.getElementById('alunoForm') && document.getElementById('alunosTable')) {
        const alunoForm = document.getElementById('alunoForm');
        const alunosTable = document.getElementById('alunosTable').querySelector('tbody');
        const alunoSubmitBtn = alunoForm.querySelector('button[type="submit"]');

        async function carregarDadosAlunoParaEdicao(id) {
            try {
                if (!id) {
                    console.error('ID do aluno não fornecido.');
                    return;
                }

                const response = await fetch(`/api/alunos/${id}`);
                if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);

                const aluno = await response.json();

                // Preenche o formulário com os dados do aluno
                document.getElementById('nome').value = aluno.nome || '';
                document.getElementById('dataNascimento').value = aluno.dataNascimento ? aluno.dataNascimento.split('T')[0] : '';
                document.getElementById('cpf').value = aluno.cpf || '';
                document.getElementById('rg').value = aluno.rg || '';
                document.getElementById('email').value = aluno.email || '';
                document.getElementById('telefone').value = aluno.telefone || '';

                // Preenche endereço
                const endereco = aluno.endereco || {};
                document.getElementById('cep').value = endereco.cep || '';
                document.getElementById('rua').value = endereco.rua || '';
                document.getElementById('numero').value = endereco.numero || '';
                document.getElementById('complemento').value = endereco.complemento || '';
                document.getElementById('bairro').value = endereco.bairro || '';
                document.getElementById('cidade').value = endereco.cidade || '';
                document.getElementById('estado').value = endereco.estado || '';

                // Altera o botão de submit para "Atualizar" e armazena o ID
                const alunoSubmitBtn = document.querySelector('#alunoForm button[type="submit"]');
                alunoSubmitBtn.textContent = 'Atualizar Aluno';
                alunoSubmitBtn.dataset.id = id;

                // Rola a página para o topo
                window.scrollTo(0, 0);
            } catch (error) {
                console.error('Erro ao carregar aluno:', error);
                showMessage('Erro ao carregar dados do aluno', true);
            }
        }

        async function carregarAlunos() {
            try {
                const response = await fetch('/api/alunos');
                if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);

                const alunos = await response.json();
                alunosTable.innerHTML = '';

                alunos.forEach(aluno => {
                    const endereco = aluno.endereco || {};
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${aluno.nome}</td>
                        <td>${aluno.cpf ? aluno.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : 'Não informado'}</td>
                        <td>${aluno.rg || 'Não informado'}</td>
                        <td>${aluno.email || 'Não informado'}</td>
                        <td>${aluno.telefone ? aluno.telefone.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3') : 'Não informado'}</td>
                        <td>${aluno.dataNascimento ? new Date(aluno.dataNascimento).toLocaleDateString() : 'Não informado'}</td>
                        <td>${endereco.rua || 'Não informado'}</td>
                        <td>${endereco.numero || 'Não informado'}</td>
                        <td>${endereco.complemento || 'Não informado'}</td>
                        <td>${endereco.bairro || 'Não informado'}</td>
                        <td>${endereco.cidade || 'Não informado'}</td>
                        <td>${endereco.estado || 'Não informado'}</td>
                        <td>${endereco.cep ? endereco.cep.replace(/(\d{5})(\d{3})/, '$1-$2') : 'Não informado'}</td>
                        <td class="actions">
                            <button class="btn-edit" data-id="${aluno._id}">Editar</button>
                            <button class="btn-delete" data-id="${aluno._id}">Excluir</button>
                        </td>
                    `;
                    alunosTable.appendChild(row);
                });

                // Configura os eventos dos botões
                document.querySelectorAll('#alunosTable .btn-delete').forEach(btn => {
                    btn.addEventListener('click', deletarAluno);
                });

                // Configura os eventos dos botões de edição
                setupEditButtons();
            } catch (error) {
                console.error('Erro ao carregar alunos:', error);
                showMessage('Erro ao carregar lista de alunos', true, alunoForm.parentNode);
            }
        }

        // Adiciona event listeners para os botões de edição
        function setupEditButtons() {
            document.querySelectorAll('#alunosTable .btn-edit').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.getAttribute('data-id');
                    carregarDadosAlunoParaEdicao(id);
                });
            });
        }

        async function deletarAluno(e) {
            if (!confirm('Tem certeza que deseja excluir este aluno?')) return;

            const id = e.target.getAttribute('data-id');

            try {
                const response = await fetch(`/api/alunos/${id}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    recarregarPaginaComMensagem('Aluno excluído com sucesso');
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Erro ao excluir');
                }
            } catch (error) {
                showMessage(error.message, true, alunoForm.parentNode);
            }
        }

        // Modifica o event listener do formulário para lidar com edição e cadastro
        alunoForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = {
                nome: document.getElementById('nome').value.trim(),
                dataNascimento: document.getElementById('dataNascimento').value,
                cpf: document.getElementById('cpf').value.replace(/\D/g, ''),
                rg: document.getElementById('rg').value.trim(),
                email: document.getElementById('email').value.trim(),
                telefone: document.getElementById('telefone').value.replace(/\D/g, ''),
                cep: document.getElementById('cep').value.replace(/\D/g, ''),
                rua: document.getElementById('rua').value.trim(),
                numero: document.getElementById('numero').value.trim(),
                complemento: document.getElementById('complemento').value.trim(),
                bairro: document.getElementById('bairro').value.trim(),
                cidade: document.getElementById('cidade').value.trim(),
                estado: document.getElementById('estado').value
            };

            // Validações
            if (!formData.nome || !formData.email) {
                showMessage('Nome e email são obrigatórios', true, alunoForm.parentNode);
                return;
            }

            if (!validarEmail(formData.email)) {
                showMessage('Email inválido', true, alunoForm.parentNode);
                return;
            }

            if (!validarCPF(document.getElementById('cpf').value)) {
                showMessage('CPF inválido', true, alunoForm.parentNode);
                return;
            }

            if (!validarTelefone(document.getElementById('telefone').value)) {
                showMessage('Telefone inválido. Formato: (DD) 99999-9999', true, alunoForm.parentNode);
                return;
            }

            if (!validarCEP(document.getElementById('cep').value)) {
                showMessage('CEP inválido. Formato: 99999-999', true, alunoForm.parentNode);
                return;
            }

            const alunoId = alunoSubmitBtn.dataset.id;

            try {
                let response;
                if (alunoId) {
                    // Se tem ID, é uma edição
                    response = await fetch(`/api/alunos/${alunoId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(formData)
                    });
                } else {
                    // Se não tem ID, é um novo cadastro
                    response = await fetch('/api/alunos', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(formData)
                    });
                }

                if (response.ok) {
                    const message = alunoId ? 'Aluno atualizado com sucesso!' : 'Aluno cadastrado com sucesso!';
                    recarregarPaginaComMensagem(message);
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Erro ao salvar');
                }
            } catch (error) {
                showMessage(error.message || 'Erro ao salvar aluno', true, alunoForm.parentNode);
            }
        });

        carregarAlunos();
    }

    // ========== GERENCIAMENTO DE INSTRUTORES ==========
    if (document.getElementById('instrutorForm') && document.getElementById('instrutoresTable')) {
        const instrutorForm = document.getElementById('instrutorForm');
        const instrutoresTable = document.getElementById('instrutoresTable').querySelector('tbody');

        // Função adicionada para carregar dados do instrutor para edição
        async function carregarDadosInstrutorParaEdicao(id) {
            try {
                if (!id) {
                    console.error('ID do instrutor não fornecido.');
                    return;
                }
                const response = await fetch(`/api/instrutores/${id}`);
                if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);

                const instrutor = await response.json();

                // Funções auxiliares de formatação
                const formatarCPF = (cpf) => {
                    if (!cpf) return '';
                    cpf = cpf.replace(/\D/g, '');
                    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
                };

                const formatarCEP = (cep) => {
                    if (!cep) return '';
                    cep = cep.replace(/\D/g, '');
                    return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
                };

                const formatarTelefone = (tel) => {
                    if (!tel) return '';
                    tel = tel.replace(/\D/g, '');
                    if (tel.length === 11) {
                        return tel.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
                    } else if (tel.length === 10) {
                        return tel.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
                    }
                    return tel;
                };

                // Preenche o formulário com os dados do instrutor
                document.getElementById('instrutorNome').value = instrutor.nome || '';
                document.getElementById('instrutorDataNascimento').value = instrutor.dataNascimento ? instrutor.dataNascimento.split('T')[0] : '';
                document.getElementById('instrutorCpf').value = formatarCPF(instrutor.cpf) || '';
                document.getElementById('instrutorRg').value = instrutor.rg || '';
                document.getElementById('instrutorEspecialidade').value = instrutor.especialidade || '';
                document.getElementById('instrutorFormacao').value = instrutor.formacao || '';
                document.getElementById('instrutorEmail').value = instrutor.email || '';
                document.getElementById('instrutorTelefone').value = formatarTelefone(instrutor.telefone) || '';

                // Preenche endereço
                const endereco = instrutor.endereco || {};
                document.getElementById('instrutorCep').value = formatarCEP(endereco.cep) || '';
                document.getElementById('instrutorRua').value = endereco.rua || '';
                document.getElementById('instrutorNumero').value = endereco.numero || '';
                document.getElementById('instrutorComplemento').value = endereco.complemento || '';
                document.getElementById('instrutorBairro').value = endereco.bairro || '';
                document.getElementById('instrutorCidade').value = endereco.cidade || '';
                document.getElementById('instrutorEstado').value = endereco.estado || '';

                // Altera o botão de submit para "Atualizar" e armazena o ID
                const btnSubmit = document.querySelector('#instrutorForm button[type="submit"]');
                btnSubmit.textContent = 'Atualizar Instrutor';
                btnSubmit.dataset.id = id;

                window.scrollTo(0, 0);
            } catch (error) {
                console.error('Erro ao carregar instrutor:', error);
                showMessage('Erro ao carregar dados do instrutor', true);
            }
        }

        async function carregarInstrutores() {
            try {
                const response = await fetch('/api/instrutores');
                if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);

                const instrutores = await response.json();
                instrutoresTable.innerHTML = '';

                instrutores.forEach(instrutor => {
                    const endereco = instrutor.endereco || {};
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${instrutor.nome}</td>
                        <td>${instrutor.cpf || 'Não informado'}</td>
                        <td>${instrutor.rg || 'Não informado'}</td>
                        <td>${instrutor.dataNascimento ? new Date(instrutor.dataNascimento).toLocaleDateString() : 'Não informado'}</td>
                        <td>${instrutor.especialidade}</td>
                        <td>${instrutor.formacao || 'Não informado'}</td>
                        <td>${instrutor.email || 'Não informado'}</td>
                        <td>${instrutor.telefone || 'Não informado'}</td>
                        <td>${endereco.rua || 'Não informado'}</td>
                        <td>${endereco.numero || 'Não informado'}</td>
                        <td>${endereco.complemento || 'Não informado'}</td>
                        <td>${endereco.bairro || 'Não informado'}</td>
                        <td>${endereco.cidade || 'Não informado'}</td>
                        <td>${endereco.estado || 'Não informado'}</td>
                        <td>${endereco.cep || 'Não informado'}</td>
                        <td>${instrutor.cursosVinculados ? instrutor.cursosVinculados.map(curso => curso.nome).join(', ') : 'Nenhum curso vinculado'}</td>
                        <td class="actions">
                            <button class="btn-edit" data-id="${instrutor._id}">Editar</button>
                            <button class="btn-delete" data-id="${instrutor._id}">Excluir</button>
                        </td>
                    `;
                    instrutoresTable.appendChild(row);
                });

                // Configura os eventos dos botões
                document.querySelectorAll('#instrutoresTable .btn-delete').forEach(btn => {
                    btn.addEventListener('click', deletarInstrutor);
                });

                document.querySelectorAll('#instrutoresTable .btn-edit').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const id = e.target.getAttribute('data-id');
                        carregarDadosInstrutorParaEdicao(id);
                    });
                });

            } catch (error) {
                console.error('Erro ao carregar instrutores:', error);
                showMessage('Erro ao carregar lista de instrutores', true, instrutorForm.parentNode);
            }
        }

        async function deletarInstrutor(e) {
            if (!confirm('Tem certeza que deseja excluir este instrutor?')) return;

            const id = e.target.getAttribute('data-id');

            try {
                const response = await fetch(`/api/instrutores/${id}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    recarregarPaginaComMensagem('Instrutor excluído com sucesso');
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Erro ao excluir');
                }
            } catch (error) {
                showMessage(error.message, true, instrutorForm.parentNode);
            }
        }

        instrutorForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const instrutor = {
                nome: document.getElementById('instrutorNome').value.trim(),
                dataNascimento: document.getElementById('instrutorDataNascimento').value,
                cpf: document.getElementById('instrutorCpf').value.replace(/\D/g, ''),
                rg: document.getElementById('instrutorRg').value.trim(),
                especialidade: document.getElementById('instrutorEspecialidade').value.trim(),
                formacao: document.getElementById('instrutorFormacao').value,
                email: document.getElementById('instrutorEmail').value.trim(),
                telefone: document.getElementById('instrutorTelefone').value.replace(/\D/g, ''),
                cep: document.getElementById('instrutorCep').value.replace(/\D/g, ''),
                rua: document.getElementById('instrutorRua').value.trim(),
                numero: document.getElementById('instrutorNumero').value.trim(),
                complemento: document.getElementById('instrutorComplemento').value.trim(),
                bairro: document.getElementById('instrutorBairro').value.trim(),
                cidade: document.getElementById('instrutorCidade').value.trim(),
                estado: document.getElementById('instrutorEstado').value
            };

            // Validações (manter as existentes)

            const btnSubmit = document.querySelector('#instrutorForm button[type="submit"]');
            const instrutorId = btnSubmit.dataset.id;

            try {
                let response;
                if (instrutorId) {
                    // Se tem ID, é uma edição
                    response = await fetch(`/api/instrutores/${instrutorId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(instrutor)
                    });
                } else {
                    // Se não tem ID, é um novo cadastro
                    response = await fetch('/api/instrutores', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(instrutor)
                    });
                }

                if (response.ok) {
                    const message = instrutorId ? 'Instrutor atualizado com sucesso!' : 'Instrutor cadastrado com sucesso!';
                    recarregarPaginaComMensagem(message);
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Erro ao salvar');
                }
            } catch (error) {
                showMessage(error.message, true, instrutorForm.parentNode);
            }
        });

        carregarInstrutores();
    }

    // ========== GERENCIAMENTO DE CURSOS ==========
    if (document.getElementById('cursoForm') && document.getElementById('cursosTable')) {
        const cursoForm = document.getElementById('cursoForm');
        const cursosTable = document.getElementById('cursosTable').querySelector('tbody');
        const cursoSubmitBtn = cursoForm.querySelector('button[type="submit"]');

        // NOVO: Função para carregar dados do curso para edição
        async function carregarDadosCursoParaEdicao(id) {
            try {
                if (!id) {
                    console.error('ID do curso não fornecido.');
                    return;
                }

                const response = await fetch(`/api/cursos/${id}`);
                if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
                
                const curso = await response.json();
                
                document.getElementById('cursoNome').value = curso.nome || '';
                document.getElementById('cursoDescricao').value = curso.descricao || '';
                document.getElementById('cursoCodigo').value = curso.codigo || '';
                document.getElementById('cursoCargaHoraria').value = curso.carga_horaria || '';
                document.getElementById('cursoCategoria').value = curso.categoria || '';
                document.getElementById('cursoNivel').value = curso.nivel || '';

                cursoSubmitBtn.textContent = 'Atualizar Curso';
                cursoSubmitBtn.dataset.id = id;

                window.scrollTo(0, 0);
            } catch (error) {
                console.error('Erro ao carregar curso:', error);
                showMessage('Erro ao carregar dados do curso', true);
            }
        }
        
        async function carregarCursos() {
            try {
                const response = await fetch('/api/cursos');
                if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
                
                const cursos = await response.json();
                cursosTable.innerHTML = '';
                
                cursos.forEach(curso => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${curso.nome}</td>
                        <td>${curso.descricao}</td>
                        <td>${curso.codigo}</td>
                        <td>${curso.carga_horaria}</td>
                        <td>${curso.categoria}</td>
                        <td>${curso.nivel}</td>
                        <td class="actions">
                            <button class="btn-edit-curso" data-id="${curso._id}">Editar</button>
                            <button class="btn-delete-curso" data-id="${curso._id}">Excluir</button>
                        </td>
                    `;
                    cursosTable.appendChild(row);
                });

                // Configura os eventos dos botões de exclusão
                document.querySelectorAll('.btn-delete-curso').forEach(btn => {
                    btn.addEventListener('click', deletarCurso);
                });

                // NOVO: Configura os eventos dos botões de edição
                document.querySelectorAll('.btn-edit-curso').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const id = e.target.getAttribute('data-id');
                        carregarDadosCursoParaEdicao(id);
                    });
                });
            } catch (error) {
                console.error('Erro ao carregar cursos:', error);
                showMessage('Erro ao carregar lista de cursos', true, cursoForm.parentNode);
            }
        }
        
        async function deletarCurso(e) {
            if (!confirm('Tem certeza que deseja excluir este curso?')) return;
            
            const id = e.target.getAttribute('data-id');
            
            try {
                const response = await fetch(`/api/cursos/${id}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    recarregarPaginaComMensagem('Curso excluído com sucesso');
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Erro ao excluir');
                }
            } catch (error) {
                showMessage(error.message, true, cursoForm.parentNode);
            }
        }

        cursoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const cursoData = {
                nome: document.getElementById('cursoNome').value,
                descricao: document.getElementById('cursoDescricao').value,
                codigo: document.getElementById('cursoCodigo').value,
                carga_horaria: parseInt(document.getElementById('cursoCargaHoraria').value),
                categoria: document.getElementById('cursoCategoria').value,
                nivel: document.getElementById('cursoNivel').value
            };

            const id = cursoSubmitBtn.dataset.id;
            const method = id ? 'PUT' : 'POST';
            const url = id ? `/api/cursos/${id}` : '/api/cursos';

            try {
                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(cursoData)
                });

                if (response.ok) {
                    const message = id ? 'Curso atualizado com sucesso!' : 'Curso criado com sucesso!';
                    recarregarPaginaComMensagem(message);
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Erro ao salvar curso');
                }
            } catch (error) {
                showMessage(error.message, true, cursoForm.parentNode);
            }
        });

        carregarCursos();
    }
    // ========== GERENCIAMENTO DE VINCULAÇÃO (Instrutor-Curso) ==========
    if (document.getElementById('vinculacaoForm')) {
        const vinculacaoForm = document.getElementById('vinculacaoForm');
        const vinculacaoInstrutorSelect = document.getElementById('vinculacaoInstrutor');
        const vinculacaoCursoSelect = document.getElementById('vinculacaoCurso');
        const cursosVinculadosList = document.getElementById('cursosVinculadosList');

        // Carrega instrutores e cursos para os selects de vinculação
        async function carregarDadosParaVinculacao() {
            try {
                const [instrutoresResponse, cursosResponse] = await Promise.all([
                    fetch('/api/instrutores'),
                    fetch('/api/cursos')
                ]);

                const instrutores = await instrutoresResponse.json();
                const cursos = await cursosResponse.json();

                // Popula o select de instrutores
                populaSelect(vinculacaoInstrutorSelect, instrutores, 'Selecione um instrutor');
                // Popula o select de cursos
                populaSelect(vinculacaoCursoSelect, cursos, 'Selecione um curso');

            } catch (error) {
                console.error('Erro ao carregar dados para vinculação:', error);
                showMessage('Erro ao carregar dados para a seção de vinculação.', true, vinculacaoForm.parentNode);
            }
        }

        // Função para popular um select (reaproveitada)
        function populaSelect(selectElement, items, defaultText) {
            selectElement.innerHTML = `<option value="">${defaultText}</option>`;
            items.forEach(item => {
                const option = document.createElement('option');
                option.value = item._id;
                option.textContent = item.nome;
                selectElement.appendChild(option);
            });
        }

        // Exibe a lista de cursos vinculados a um instrutor
        async function exibirCursosVinculados(instrutorId) {
            if (!instrutorId) {
                cursosVinculadosList.innerHTML = 'Selecione um instrutor para ver os vínculos.';
                return;
            }

            try {
                const response = await fetch(`/api/instrutores/${instrutorId}`);
                if (!response.ok) throw new Error('Instrutor não encontrado');

                const instrutor = await response.json();
                const cursos = instrutor.cursosVinculados; // Assume que o backend retorna os cursos populados

                if (cursos && cursos.length > 0) {
                    cursosVinculadosList.innerHTML = '<ul>' + cursos.map(curso => `
                        <li>
                            ${curso.nome}
                            <button class="btn-delete btn-desvincular" data-instrutor-id="${instrutorId}" data-curso-id="${curso._id}">Desvincular</button>
                        </li>
                    `).join('') + '</ul>';
                    
                    document.querySelectorAll('.btn-desvincular').forEach(btn => {
                        btn.addEventListener('click', desvincularCurso);
                    });
                } else {
                    cursosVinculadosList.innerHTML = 'Nenhum curso vinculado.';
                }

            } catch (error) {
                console.error('Erro ao buscar cursos vinculados:', error);
                cursosVinculadosList.innerHTML = 'Erro ao carregar cursos vinculados.';
            }
        }
        
        // Lida com o envio do formulário de vinculação
        vinculacaoForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const instrutorId = vinculacaoInstrutorSelect.value;
            const cursoId = vinculacaoCursoSelect.value;

            if (!instrutorId || !cursoId) {
                showMessage('Selecione um instrutor e um curso válidos.', true, vinculacaoForm.parentNode);
                return;
            }

            try {
                const response = await fetch('/api/cursos/vincular-instrutor', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ instrutorId, cursoId })
                });

                if (response.ok) {
                    recarregarPaginaComMensagem('Instrutor vinculado ao curso com sucesso!');
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Erro ao vincular instrutor.');
                }
            } catch (error) {
                showMessage(error.message, true, vinculacaoForm.parentNode);
            }
        });

        // Lida com o desvínculo
        async function desvincularCurso(e) {
            const btn = e.target;
            const instrutorId = btn.getAttribute('data-instrutor-id');
            const cursoId = btn.getAttribute('data-curso-id');

            if (!confirm('Tem certeza que deseja desvincular este curso do instrutor?')) return;

            try {
                const response = await fetch('/api/cursos/desvincular-instrutor', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ instrutorId, cursoId })
                });

                if (response.ok) {
                    recarregarPaginaComMensagem('Vínculo removido com sucesso!');
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Erro ao desvincular curso.');
                }
            } catch (error) {
                showMessage(error.message, true, vinculacaoForm.parentNode);
            }
        }

        // Exibe os cursos vinculados quando o instrutor é selecionado
        vinculacaoInstrutorSelect.addEventListener('change', (e) => {
            exibirCursosVinculados(e.target.value);
        });

        carregarDadosParaVinculacao();
    }

    // ========== GERENCIAMENTO DE MATRÍCULAS ==========
    if (document.getElementById('matriculaForm') && document.getElementById('matriculasTable') && 
        document.getElementById('alunoSelect') && document.getElementById('cursoSelect')) {
        const matriculaForm = document.getElementById('matriculaForm');
        const matriculasTable = document.getElementById('matriculasTable').querySelector('tbody');
        const alunoSelect = document.getElementById('alunoSelect');
        const cursoSelect = document.getElementById('cursoSelect');

        async function carregarAlunosParaSelect() {
            try {
                const response = await fetch('/api/alunos');
                const alunos = await response.json();
                
                alunoSelect.innerHTML = '<option value="">Selecione um aluno</option>';
                alunos.forEach(aluno => {
                    const option = document.createElement('option');
                    option.value = aluno._id;
                    option.textContent = aluno.nome;
                    alunoSelect.appendChild(option);
                });
            } catch (error) {
                console.error('Erro ao carregar alunos:', error);
                showMessage('Erro ao carregar lista de alunos para seleção', true);
            }
        }

        async function carregarCursosParaSelect() {
            try {
                const response = await fetch('/api/cursos');
                const cursos = await response.json();
                
                cursoSelect.innerHTML = '<option value="">Selecione um curso</option>';
                cursos.forEach(curso => {
                    const option = document.createElement('option');
                    option.value = curso._id;
                    option.textContent = curso.nome;
                    cursoSelect.appendChild(option);
                });
            } catch (error) {
                console.error('Erro ao carregar cursos:', error);
                showMessage('Erro ao carregar lista de cursos para seleção', true);
            }
        }

        async function carregarMatriculas() {
            try {
                const response = await fetch('/api/matriculas');
                const matriculas = await response.json();
                
                matriculasTable.innerHTML = '';
                
                if (matriculas.length === 0) {
                    const row = document.createElement('tr');
                    row.innerHTML = `<td colspan="7">Nenhuma matrícula encontrada</td>`;
                    matriculasTable.appendChild(row);
                    return;
                }

                for (const matricula of matriculas) {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${matricula.aluno.nome}</td>
                        <td>${matricula.curso.nome}</td>
                        <td>${new Date(matricula.data_matricula).toLocaleDateString()}</td>
                        <td>${matricula.status}</td>
                        <td>${matricula.aluno.email}<br>${matricula.aluno.telefone ? matricula.aluno.telefone.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3') : ''}</td>
                        <td>Carga: ${matricula.curso.carga_horaria}h<br>Nível: ${matricula.curso.nivel}</td>
                        <td class="actions">
                            <button class="btn-cancelar" data-id="${matricula._id}">Cancelar</button>
                        </td>
                    `;
                    matriculasTable.appendChild(row);
                }

                document.querySelectorAll('.btn-cancelar').forEach(btn => {
                    btn.addEventListener('click', cancelarMatricula);
                });

            } catch (error) {
                console.error('Erro ao carregar matrículas:', error);
                showMessage('Erro ao carregar lista de matrículas', true);
            }
        }

        async function cancelarMatricula(e) {
            const id = e.target.getAttribute('data-id');
            if (!confirm('Tem certeza que deseja cancelar esta matrícula?')) return;
            
            try {
                const response = await fetch(`/api/matriculas/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'cancelado' })
                });

                if (response.ok) {
                    recarregarPaginaComMensagem('Matrícula cancelada com sucesso');
                } else {
                    throw new Error('Erro ao cancelar matrícula');
                }
            } catch (error) {
                showMessage(error.message, true);
            }
        }

        matriculaForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const alunoId = alunoSelect.value;
            const cursoId = cursoSelect.value;
            const dataMatricula = document.getElementById('matriculaData').value;
            const status = document.getElementById('matriculaStatus').value;

            if (!alunoId || !cursoId) {
                showMessage('Selecione um aluno e um curso', true);
                return;
            }

            try {
                const response = await fetch('/api/matriculas', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        alunoId, 
                        cursoId,
                        dataMatricula,
                        status
                    })
                });

                if (response.ok) {
                    recarregarPaginaComMensagem('Matrícula realizada com sucesso!');
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Erro ao matricular');
                }
            } catch (error) {
                showMessage(error.message, true);
            }
        });

        carregarAlunosParaSelect();
        carregarCursosParaSelect();
        carregarMatriculas();
    }

    // ========== RESTAURAR ESTADO DA PÁGINA ==========
    window.addEventListener('load', () => {
        const abaAtiva = sessionStorage.getItem('ultimaAbaAtiva');
        if (abaAtiva) {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            const btnAtivo = document.querySelector(`.tab-btn[data-tab="${abaAtiva}"]`);
            if (btnAtivo) {
                btnAtivo.classList.add('active');
                document.getElementById(abaAtiva).classList.add('active');
            }
            sessionStorage.removeItem('ultimaAbaAtiva');
        }
        
        const mensagem = sessionStorage.getItem('ultimaMensagem');
        const isError = sessionStorage.getItem('mensagemErro') === 'true';
        
        if (mensagem) {
            showMessage(mensagem, isError);
            sessionStorage.removeItem('ultimaMensagem');
            sessionStorage.removeItem('mensagemErro');
            window.scrollTo(0, 0);
        }
    });

    // ========== INICIALIZAÇÃO FINAL ==========
    setupTabs();
    aplicarMascaras();
});

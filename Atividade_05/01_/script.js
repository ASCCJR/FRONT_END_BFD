/*
 * CONVERSOR DE DATA PARA EXTENSO
 * 
 * Observações feit pela I.A --> Abordagens de manipulação do DOM:
 * 1. createElement() + textContent: ✅ RECOMENDADO - Seguro contra XSS
 * 2. innerHTML: ⚠️ CUIDADO - Funcional mas pode ser vulnerável se mal usado
 * 3. document.write(): ❌ EVITAR - Obsoleto e problemático
 */

// Array com os nomes dos meses
const meses = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
];

// Função para verificar se um ano é bissexto
const ehAnoBissexto = (ano) => (ano % 4 === 0 && ano % 100 !== 0) || (ano % 400 === 0);

// Função para obter o número de dias em um mês
function diasNoMes(mes, ano) {
    if (mes === 2 && ehAnoBissexto(ano)) {
        return 29;
    }
    // Retorna o número de dias do mês correspondente
    return [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][mes - 1];
}

// Função para validar a data de forma mais concisa
function validarData(dia, mes, ano) {
    // Validações básicas de tipo e intervalo
    if (isNaN(dia) || isNaN(mes) || isNaN(ano) || mes < 1 || mes > 12 || ano < 1) {
        return false;
    }
    // Valida o dia com base no mês e ano
    return dia >= 1 && dia <= diasNoMes(mes, ano);
}

// Função centralizada para exibir mensagens no DOM usando createElement (mais segura)
function mostrarResultado(elemento, mensagem, tipo = 'danger') {
    // Limpar conteúdo anterior
    elemento.innerHTML = '';

    // Criar elemento principal do alerta
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${tipo}`;
    alertDiv.setAttribute('role', 'alert');

    if (tipo === 'success') {
        // Criar título para sucesso
        const titulo = document.createElement('h4');
        titulo.className = 'alert-heading';
        titulo.textContent = 'Data convertida:';

        // Criar parágrafo com a mensagem
        const paragrafo = document.createElement('p');
        paragrafo.className = 'mb-0 fs-5';

        const strong = document.createElement('strong');
        strong.textContent = mensagem;
        paragrafo.appendChild(strong);

        // Montar estrutura para sucesso
        alertDiv.appendChild(titulo);
        alertDiv.appendChild(paragrafo);
    } else {
        // Para erros, criar estrutura mais simples
        const strong = document.createElement('strong');
        strong.textContent = 'Erro: ';

        const textoErro = document.createTextNode(mensagem);

        alertDiv.appendChild(strong);
        alertDiv.appendChild(textoErro);
    }

    // Adicionar o alerta ao elemento pai
    elemento.appendChild(alertDiv);
}

// Função auxiliar para criar alertas informativos (anos bissextos)
function adicionarAlertaInfo(elemento, mensagem) {
    const alertInfo = document.createElement('div');
    alertInfo.className = 'alert alert-info mt-2';
    alertInfo.setAttribute('role', 'alert');

    const strong = document.createElement('strong');
    strong.textContent = 'Observação: ';

    const textoInfo = document.createTextNode(mensagem);

    alertInfo.appendChild(strong);
    alertInfo.appendChild(textoInfo);
    elemento.appendChild(alertInfo);
}

// Função principal para converter a data
function converterData() {
    const dataInput = document.getElementById('dataInput');
    const resultadoDiv = document.getElementById('resultado');
    const input = dataInput.value.trim();

    // Validação do input
    if (!input) {
        mostrarResultado(resultadoDiv, 'Por favor, digite uma data.');
        return;
    }
    if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(input)) {
        mostrarResultado(resultadoDiv, 'Formato inválido. Use o formato dd/mm/aaaa.');
        return;
    }

    // Extração e conversão das partes da data
    const [diaStr, mesStr, anoStr] = input.split('/');
    const dia = parseInt(diaStr, 10);
    const mes = parseInt(mesStr, 10);
    const ano = parseInt(anoStr, 10);

    // Validação da data
    if (!validarData(dia, mes, ano)) {
        mostrarResultado(resultadoDiv, 'Data inválida. Verifique se o dia, mês e ano estão corretos.');
        return;
    }

    // Geração da data por extenso e exibição
    const nomeMes = meses[mes - 1];
    const dataExtenso = `${dia} de ${nomeMes} de ${ano}`;
    mostrarResultado(resultadoDiv, dataExtenso, 'success');

    // Adiciona observação sobre ano bissexto, se aplicável
    if (ehAnoBissexto(ano)) {
        adicionarAlertaInfo(resultadoDiv, `${ano} é um ano bissexto.`);
    }
}

// Função para formatar o input da data automaticamente
function formatarInputData(event) {
    // Remove todos os caracteres não numéricos e limita a 8 dígitos
    let value = event.target.value.replace(/\D/g, '').substring(0, 8);
    // Aplica a formatação com barras
    if (value.length > 4) {
        value = `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4)}`;
    } else if (value.length > 2) {
        value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    event.target.value = value;
}

// Adiciona os event listeners quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    const dataInput = document.getElementById('dataInput');

    // Listener para formatar o input em tempo real
    dataInput.addEventListener('input', formatarInputData);

    // Listener para submit do formulário
    const form = document.getElementById('formData');
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        converterData();
    });
});

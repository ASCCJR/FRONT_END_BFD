/*
 * SISTEMA DE PEDIDOS DA LANCHONETE
 * 
 * Funcionalidades:
 * - Captura o nome do cliente
 * - Permite seleção de bebidas e comidas
 * - Calcula o valor total do pedido
 * - Exibe resumo legível com todas as informações
 */

// Elementos do DOM
const form = document.querySelector('#order-form');
const customerNameInput = document.querySelector('#customer-name');
const feedbackDiv = document.querySelector('#feedback');
const orderResultSection = document.querySelector('#order-result');
const orderSummaryDiv = document.querySelector('#order-summary');
const totalValueSpan = document.querySelector('#total-value');

// Dados dos produtos com nomes amigáveis
const produtos = {
    bebidas: {
        suco: { nome: 'Suco Natural', preco: 4.00 },
        refrigerante: { nome: 'Refrigerante', preco: 2.50 },
        agua: { nome: 'Água Mineral', preco: 1.50 }
    },
    comidas: {
        bolo: { nome: 'Bolo Caseiro', preco: 3.50 },
        pastel: { nome: 'Pastel Assado', preco: 3.00 },
        torta: { nome: 'Torta Especial', preco: 4.00 }
    }
};

// Formatador de moeda brasileira
const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
});

// Event listener principal do formulário
form.addEventListener('submit', (event) => {
    event.preventDefault();
    
    const customerName = customerNameInput.value.trim();
    const selectedBeverage = getSelectedItems('bebidas');
    const selectedFood = getSelectedItems('comidas');
    
    // Validação
    const validationMessage = validateOrder(customerName, selectedBeverage, selectedFood);
    
    if (validationMessage) {
        showFeedback(validationMessage, 'danger');
        hideOrderResult();
        return;
    }
    
    // Limpar feedback de erro
    clearFeedback();
    
    // Calcular e exibir pedido
    const totalValue = calculateTotal(selectedBeverage, selectedFood);
    displayOrderSummary(customerName, selectedBeverage, selectedFood, totalValue);
    showOrderResult();
});

// Função para obter itens selecionados de uma categoria
function getSelectedItems(category) {
    const checkboxes = document.querySelectorAll(`input[name="${category}"]:checked`);
    return Array.from(checkboxes).map(checkbox => {
        const productId = checkbox.id;
        const productInfo = produtos[category][productId];
        return {
            id: productId,
            nome: productInfo.nome,
            preco: productInfo.preco
        };
    });
}

// Função para validar o pedido
function validateOrder(customerName, beverages, foods) {
    if (!customerName) {
        return 'Por favor, informe o nome do cliente.';
    }
    
    if (beverages.length === 0 && foods.length === 0) {
        return 'Por favor, selecione pelo menos um item do cardápio.';
    }
    
    return null; // Sem erros
}

// Função para calcular o valor total
function calculateTotal(beverages, foods) {
    const beverageTotal = beverages.reduce((sum, item) => sum + item.preco, 0);
    const foodTotal = foods.reduce((sum, item) => sum + item.preco, 0);
    return beverageTotal + foodTotal;
}

// Função para exibir o resumo do pedido
function displayOrderSummary(customerName, beverages, foods, totalValue) {
    // Limpar conteúdo anterior
    orderSummaryDiv.innerHTML = '';
    
    // Criar elementos do resumo
    const summaryFragment = document.createDocumentFragment();
    
    // Nome do cliente
    const customerInfo = document.createElement('div');
    customerInfo.className = 'mb-3';
    const customerTitle = document.createElement('strong');
    customerTitle.textContent = 'Cliente: ';
    const customerNameSpan = document.createElement('span');
    customerNameSpan.textContent = customerName;
    customerNameSpan.className = 'text-primary';
    customerInfo.appendChild(customerTitle);
    customerInfo.appendChild(customerNameSpan);
    summaryFragment.appendChild(customerInfo);
    
    // Bebidas consumidas
    if (beverages.length > 0) {
        const beverageSection = createItemSection('🥤 Bebidas consumidas:', beverages);
        summaryFragment.appendChild(beverageSection);
    }
    
    // Comidas consumidas
    if (foods.length > 0) {
        const foodSection = createItemSection('🍰 Doces e salgados consumidos:', foods);
        summaryFragment.appendChild(foodSection);
    }
    
    // Adicionar ao DOM
    orderSummaryDiv.appendChild(summaryFragment);
    
    // Atualizar valor total
    totalValueSpan.textContent = currencyFormatter.format(totalValue);
}

// Função auxiliar para criar seção de itens
function createItemSection(title, items) {
    const section = document.createElement('div');
    section.className = 'mb-3';
    
    // Título da seção
    const sectionTitle = document.createElement('div');
    sectionTitle.className = 'fw-semibold mb-2';
    sectionTitle.textContent = title;
    section.appendChild(sectionTitle);
    
    // Lista de itens
    const itemsList = document.createElement('ul');
    itemsList.className = 'list-unstyled ms-3 mb-0';
    
    items.forEach(item => {
        const listItem = document.createElement('li');
        listItem.className = 'd-flex justify-content-between align-items-center py-1';
        
        const itemName = document.createElement('span');
        itemName.textContent = `• ${item.nome}`;
        
        const itemPrice = document.createElement('span');
        itemPrice.className = 'text-success fw-semibold';
        itemPrice.textContent = currencyFormatter.format(item.preco);
        
        listItem.appendChild(itemName);
        listItem.appendChild(itemPrice);
        itemsList.appendChild(listItem);
    });
    
    section.appendChild(itemsList);
    return section;
}

// Função para exibir feedback de erro
function showFeedback(message, type) {
    feedbackDiv.hidden = false;
    feedbackDiv.className = `alert alert-${type}`;
    feedbackDiv.innerHTML = `<strong>Atenção:</strong> ${message}`;
}

// Função para limpar feedback
function clearFeedback() {
    feedbackDiv.hidden = true;
    feedbackDiv.className = '';
    feedbackDiv.innerHTML = '';
}

// Função para mostrar resultado do pedido
function showOrderResult() {
    orderResultSection.hidden = false;
    // Scroll suave para o resultado
    orderResultSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
    });
}

// Função para esconder resultado do pedido
function hideOrderResult() {
    orderResultSection.hidden = true;
}

// Função para limpar formulário (opcional)
function clearForm() {
    form.reset();
    hideOrderResult();
    clearFeedback();
}

// Event listener para melhorar UX - limpar resultado quando formulário for modificado
form.addEventListener('input', () => {
    if (!orderResultSection.hidden) {
        // Se há resultado visível e o usuário está modificando, esconder o resultado
        clearFeedback();
    }
});

// Adicionar funcionalidade de limpar formulário (opcional)
document.addEventListener('DOMContentLoaded', () => {
    // Focar no campo nome quando a página carregar
    customerNameInput.focus();
    
    // Adicionar máscara de formatação no nome (capitalizar)
    customerNameInput.addEventListener('blur', () => {
        if (customerNameInput.value.trim()) {
            customerNameInput.value = capitalizeWords(customerNameInput.value.trim());
        }
    });
});

// Função auxiliar para capitalizar palavras
function capitalizeWords(str) {
    return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
}

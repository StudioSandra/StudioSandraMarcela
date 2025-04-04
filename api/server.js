const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Configuração do Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail', // Você pode usar outros serviços como 'outlook', 'hotmail', etc.
    auth: {
        user: 'seu-email@gmail.com', // Substitua pelo seu email
        pass: 'sua-senha-de-app' // Substitua pela sua senha de aplicativo
    }
});

// Rota para enviar email
app.post('/api/send-email', async (req, res) => {
    try {
        const { name, email, phone, service, date, message } = req.body;

        // Configuração do email
        const mailOptions = {
            from: 'seu-email@gmail.com', // Mesmo email usado na configuração do transporter
            to: 'arthur@matutos.com.br', // Email que receberá as mensagens
            subject: `Nova mensagem de contato - ${name}`,
            html: `
                <h2>Nova mensagem de contato</h2>
                <p><strong>Nome:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Telefone:</strong> ${phone}</p>
                <p><strong>Serviço de interesse:</strong> ${service}</p>
                <p><strong>Data desejada:</strong> ${date}</p>
                <p><strong>Mensagem:</strong></p>
                <p>${message}</p>
            `
        };

        // Enviar email
        await transporter.sendMail(mailOptions);

        res.status(200).json({ success: true, message: 'Email enviado com sucesso!' });
    } catch (error) {
        console.error('Erro ao enviar email:', error);
        res.status(500).json({ success: false, message: 'Erro ao enviar email' });
    }
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
}); 


// Elementos do Carrinho
const cartOverlay = document.querySelector('.cart-overlay');
const cartItemsContainer = document.querySelector('.cart-items');
const totalPriceElement = document.querySelector('.total-price');
const cartCount = document.querySelector('.cart-count');

// Função para adicionar item ao carrinho
function adicionarItemCarrinho(nome, preco) {
    const cartItem = document.createElement('div');
    cartItem.classList.add('cart-item');
    cartItem.innerHTML = `
        <div class="cart-item-info">
            <p>${nome}</p>
            <p class="item-price">R$ ${preco}</p>
        </div>
        <button class="remove-item-btn" onclick="removerItemCarrinho(this, ${preco})">
            <i class="fas fa-trash"></i>
        </button>
    `;
    
    // Adicionar o item ao carrinho
    cartItemsContainer.appendChild(cartItem);
    atualizarTotal(preco);
    atualizarContador();
}

// Função para atualizar o total
function atualizarTotal(preco) {
    let total = parseFloat(totalPriceElement.textContent.replace('R$ ', '').replace(',', '.'));
    if (isNaN(total)) total = 0;
    total += parseFloat(preco.replace('R$ ', '').replace(',', '.'));
    totalPriceElement.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

// Atualizar o contador de itens no carrinho
function atualizarContador() {
    const count = cartItemsContainer.querySelectorAll('.cart-item').length;
    cartCount.textContent = count;
}

// Função para remover um item do carrinho
function removerItemCarrinho(button, preco) {
    const item = button.closest('.cart-item');
    item.remove();
    atualizarTotal(-preco); // Subtrai o valor do item removido
    atualizarContador();
}

// Finalizar a compra
document.querySelector('.checkout').addEventListener('click', function() {
    if (parseFloat(totalPriceElement.textContent.replace('R$ ', '').replace(',', '.')) === 0) {
        alert('Seu carrinho está vazio!');
    } else {
        alert('Compra finalizada com sucesso!');
        limparCarrinho();
    }
});

// Função para limpar o carrinho
function limparCarrinho() {
    cartItemsContainer.innerHTML = '';
    totalPriceElement.textContent = 'R$ 0,00';
    cartCount.textContent = '0';
    fecharCarrinho();
}

// Função para abrir o carrinho (mostrar o overlay)
document.querySelector('.cart-btn').addEventListener('click', function() {
    cartOverlay.style.display = 'flex';
});

// Função para fechar o carrinho
document.querySelector('.close-cart').addEventListener('click', function() {
    cartOverlay.style.display = 'none';
});

// Exemplo de como adicionar itens ao carrinho
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', function() {
        const nomeProduto = this.closest('.product-card').querySelector('h3').textContent;
        const precoProduto = this.closest('.product-card').querySelector('.product-price').textContent;
        adicionarItemCarrinho(nomeProduto, precoProduto);
    });
});

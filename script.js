// Dados e estado global
const dados = {
    produtos: {
        1: {
            id: 1,
            nome: "Kit Maquiagem Básico",
            preco: 199.90,
            imagem: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800",
            descricao: "Kit completo com produtos essenciais para maquiagem diária."
        },
        2: {
            id: 2,
            nome: "Paleta de Sombras",
            preco: 149.90,
            imagem: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800",
            descricao: "Paleta com 12 cores versáteis para looks diários e noturnos."
        },
        3: {
            id: 3,
            nome: "Kit Pincéis",
            preco: 129.90,
            imagem: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800",
            descricao: "Conjunto com 8 pincéis profissionais para maquiagem."
        },
        4: {
            id: 4,
            nome: "Kit Noiva",
            preco: 299.90,
            imagem: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800",
            descricao: "Kit especial para noivas com produtos de longa duração."
        }
    }
};

const estado = {
    carrinho: [],
    tema: localStorage.getItem('theme') || 'light',
    currentStep: 1
};

// Módulo de Carrinho
const carrinhoModule = {
    elementos: null,
    
    inicializar(elementos) {
        this.elementos = elementos;
        this.atualizarCarrinho();
    },

    atualizarCarrinho() {
        this.elementos.cartItems.innerHTML = '';
        let total = 0;

        estado.carrinho.forEach(item => {
            const produto = dados.produtos[item.id];
            total += produto.preco * item.quantidade;

            this.elementos.cartItems.innerHTML += `
                <div class="cart-item">
                    <img src="${produto.imagem}" alt="${produto.nome}">
                    <div class="cart-item-info">
                        <h4>${produto.nome}</h4>
                        <p>R$ ${produto.preco.toFixed(2)}</p>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn minus" data-id="${produto.id}">-</button>
                        <span>${item.quantidade}</span>
                        <button class="quantity-btn plus" data-id="${produto.id}">+</button>
                    </div>
                    <button class="remove-item" data-id="${produto.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        });

        this.elementos.cartCount.textContent = estado.carrinho.reduce((total, item) => total + item.quantidade, 0);
        this.elementos.totalAmount.textContent = `R$ ${total.toFixed(2)}`;
    },

    adicionarAoCarrinho(id) {
        const item = estado.carrinho.find(item => item.id === id);
        if (item) {
            item.quantidade++;
        } else {
            estado.carrinho.push({ id, quantidade: 1 });
        }
        this.atualizarCarrinho();
    },

    removerDoCarrinho(id) {
        estado.carrinho = estado.carrinho.filter(item => item.id !== id);
        this.atualizarCarrinho();
    },

    atualizarQuantidade(id, delta) {
        const item = estado.carrinho.find(item => item.id === id);
        if (item) {
            item.quantidade += delta;
            if (item.quantidade <= 0) {
                this.removerDoCarrinho(id);
            } else {
                this.atualizarCarrinho();
            }
        }
    }
};

// Módulo de Checkout
const checkoutModule = {
    elementos: null,
    
    inicializar(elementos) {
        this.elementos = elementos;
        this.updateSteps();
    },

    updateSteps() {
        this.elementos.steps.forEach(step => {
            const stepNum = parseInt(step.dataset.step);
            if (stepNum < estado.currentStep) {
                step.classList.add('completed');
            } else if (stepNum === estado.currentStep) {
                step.classList.add('active');
                step.classList.remove('completed');
            } else {
                step.classList.remove('active', 'completed');
            }
        });

        this.elementos.checkoutSteps.forEach(step => {
            if (parseInt(step.dataset.step) === estado.currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        this.elementos.prevStepBtn.style.display = estado.currentStep === 1 ? 'none' : 'block';
        this.elementos.nextStepBtn.style.display = estado.currentStep === 3 ? 'none' : 'block';
        this.elementos.submitOrderBtn.style.display = estado.currentStep === 3 ? 'block' : 'none';
    },

    validateStep(step) {
        const inputs = this.elementos.checkoutSteps[step - 1].querySelectorAll('input[required], select[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.classList.add('error');
            } else {
                input.classList.remove('error');
            }
        });

        return isValid;
    }
};

// Módulo de Produtos
const produtosModule = {
    elementos: null,
    
    inicializar(elementos) {
        this.elementos = elementos;
        this.filtrarProdutos();
    },

    ordenarProdutosGrid(produtos, criterio) {
        return [...produtos].sort((a, b) => {
            switch(criterio) {
                case 'menor-preco':
                    return a.preco - b.preco;
                case 'maior-preco':
                    return b.preco - a.preco;
                case 'mais-vendidos':
                    return b.vendidos - a.vendidos;
                case 'mais-recentes':
                    return b.data - a.data;
                default:
                    return 0;
            }
        });
    },

    filtrarProdutos() {
        const precoSelecionado = this.elementos.filtroPreco.value;
        const categoriaSelecionada = this.elementos.filtroCategoria.value;
        const ordenacaoSelecionada = this.elementos.ordenarProdutos.value;

        let produtosFiltrados = Object.values(dados.produtos);

        if (precoSelecionado !== 'todos') {
            const [min, max] = precoSelecionado.split('-').map(Number);
            produtosFiltrados = produtosFiltrados.filter(produto => {
                if (max) {
                    return produto.preco >= min && produto.preco <= max;
                } else {
                    return produto.preco >= min;
                }
            });
        }

        if (categoriaSelecionada !== 'todos') {
            produtosFiltrados = produtosFiltrados.filter(produto => 
                produto.categoria === categoriaSelecionada
            );
        }

        produtosFiltrados = this.ordenarProdutosGrid(produtosFiltrados, ordenacaoSelecionada);

        this.elementos.produtosContador.innerHTML = `Mostrando <strong>${produtosFiltrados.length}</strong> de <strong>${Object.keys(dados.produtos).length}</strong> produtos`;

        this.elementos.produtosGrid.innerHTML = produtosFiltrados.map(produto => `
            <div class="produto-card">
                <div class="produto-badge">${produto.badge}</div>
                <div class="produto-imagem">
                    <img src="${produto.imagem}" alt="${produto.nome}">
                    <div class="produto-overlay">
                        <button class="btn btn-primary add-to-cart" data-id="${produto.id}">
                            <i class="fas fa-shopping-cart"></i> Adicionar ao Carrinho
                        </button>
                    </div>
                </div>
                <div class="produto-info">
                    <h3>${produto.nome}</h3>
                    <p class="produto-descricao">${produto.descricao}</p>
                    <div class="produto-avaliacao">
                        ${Array(5).fill().map((_, i) => `
                            <i class="fas fa-star${i < produto.avaliacao ? '' : ' far'}"></i>
                        `).join('')}
                        <span>(${produto.avaliacao})</span>
                    </div>
                    <div class="produto-preco">
                        <span class="preco">R$ ${produto.preco.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
};

// Módulo de Tema
const temaModule = {
    elementos: null,
    
    inicializar(elementos) {
        this.elementos = elementos;
        document.documentElement.setAttribute('data-theme', estado.tema);
        this.updateThemeIcon();
    },

    updateThemeIcon() {
        this.elementos.themeIcon.className = estado.tema === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    },

    toggleTheme() {
        estado.tema = estado.tema === 'light' ? 'dark' : 'dark';
        document.documentElement.setAttribute('data-theme', estado.tema);
        localStorage.setItem('theme', estado.tema);
        this.updateThemeIcon();
    }
};

// Configuração do WhatsApp
const whatsappConfig = {
    phoneNumber: '5511999999999', // Substitua pelo número correto
    messages: {
        noiva: 'Maquiagem para Noivas - R$ 350,00',
        festa: 'Maquiagem para Festas - R$ 150,00',
        ensaio: 'Maquiagem para Ensaios - R$ 180,00',
        curso: 'Curso de Maquiagem - R$ 800,00',
        sobrancelha: 'Design de Sobrancelhas - R$ 70,00',
        limpeza: 'Limpeza de Pele - R$ 120,00'
    }
};

// Função para formatar a data
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

// Função para enviar mensagem para o WhatsApp
function sendToWhatsApp(event) {
    event.preventDefault();

    // Pegar valores do formulário
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const service = document.getElementById('service');
    const serviceName = service.options[service.selectedIndex].text;
    const date = formatDate(document.getElementById('date').value);
    const time = document.getElementById('time').value;
    const message = document.getElementById('message').value;

    // Construir a mensagem
    const whatsappMessage = `Olá! 👋

*Novo Agendamento*
Nome: ${name}
Email: ${email}
Telefone: ${phone}
Serviço: ${serviceName}
Data: ${date}
Horário: ${time}

${message ? `\nMensagem Adicional:\n${message}` : ''}

Aguardo confirmação! 😊`;

    // Codificar a mensagem para URL
    const encodedMessage = encodeURIComponent(whatsappMessage);

    // Abrir WhatsApp
    window.open(`https://wa.me/${whatsappConfig.phoneNumber}?text=${encodedMessage}`, '_blank');
    return false;
}

// Função para abrir WhatsApp
function openWhatsApp(serviceType) {
    const message = whatsappConfig.messages[serviceType];
    if (message) {
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${whatsappConfig.phoneNumber}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
    }
}

// Adicionar eventos aos botões de WhatsApp
document.addEventListener('DOMContentLoaded', function() {
    const whatsappButtons = document.querySelectorAll('.whatsapp-btn');
    whatsappButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const serviceType = this.dataset.service;
            openWhatsApp(serviceType);
        });
    });
});

// Função para atualizar o relógio e status
document.addEventListener('DOMContentLoaded', function() {
    const menuBtn = document.querySelector('.menu-btn');
    const menuOverlay = document.querySelector('.menu-overlay');
    const closeMenuBtn = document.querySelector('.close-menu');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav a');

    function toggleMenu() {
        menuOverlay.classList.toggle('active');
        document.body.style.overflow = menuOverlay.classList.contains('active') ? 'hidden' : '';
    }

    menuBtn.addEventListener('click', toggleMenu);
    closeMenuBtn.addEventListener('click', toggleMenu);
    menuOverlay.addEventListener('click', function(e) {
        if (e.target === menuOverlay) {
            toggleMenu();
        }
    });

    mobileNavLinks.forEach(link => {
        link.addEventListener('click', toggleMenu);
    });

    // Atualizar horário
    function updateTime() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const timeElement = document.querySelector('.time');
        const statusElement = document.querySelector('.status');
        
        if (timeElement) {
            timeElement.textContent = `${hours}:${minutes}`;
        }
        
        if (statusElement) {
            const isOpen = hours >= 9 && hours < 19;
            statusElement.textContent = isOpen ? 'Aberto' : 'Fechado';
            statusElement.className = `status ${isOpen ? 'open' : 'closed'}`;
        }
    }

    updateTime();
    setInterval(updateTime, 60000);

    // Marcar link ativo no menu
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-links a, .mobile-nav a');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });

    // Formulários de Contato
    const formTabs = document.querySelectorAll('.form-tab');
    const formContents = document.querySelectorAll('.form-content');
    const whatsappForm = document.getElementById('whatsappForm');
    const emailForm = document.getElementById('emailForm');

    // Alternar entre formulários
    formTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            formTabs.forEach(t => t.classList.remove('active'));
            formContents.forEach(form => form.classList.remove('active'));
            
            tab.classList.add('active');
            const formType = tab.dataset.form;
            document.querySelector(`#${formType}Form`).classList.add('active');
        });
    });

    // Enviar formulário WhatsApp
    if (whatsappForm) {
        whatsappForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('whatsapp-name').value;
            const phone = document.getElementById('whatsapp-phone').value;
            const service = document.getElementById('whatsapp-service').value;
            const date = document.getElementById('whatsapp-date').value;
            const message = document.getElementById('whatsapp-message').value;

            const text = `Olá! Gostaria de agendar um horário:\n\n` +
                        `Nome: ${name}\n` +
                        `Telefone: ${phone}\n` +
                        `Serviço: ${service}\n` +
                        `Data: ${date}\n` +
                        `Mensagem: ${message}`;

            const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(text)}`;
            window.open(whatsappUrl, '_blank');
        });
    }
});

// Função principal de inicialização
function inicializarAplicacao() {
    // Inicialização de elementos do DOM
    const elementos = {
        cartToggle: document.querySelector('.cart-toggle'),
        cartOverlay: document.querySelector('.cart-overlay'),
        closeCart: document.querySelector('.close-cart'),
        cartItems: document.querySelector('.cart-items'),
        cartCount: document.querySelector('.cart-count'),
        totalAmount: document.querySelector('.total-amount'),
        checkoutBtn: document.querySelector('.checkout-btn'),
        menuBtn: document.querySelector('.menu-btn'),
        navLinks: document.querySelector('.nav-links'),
        navActions: document.querySelector('.nav-actions'),
        menuOverlay: document.querySelector('.menu-overlay'),
        themeToggle: document.querySelector('.theme-toggle'),
        themeIcon: document.querySelector('.theme-toggle i'),
        checkoutOverlay: document.querySelector('.checkout-overlay'),
        closeCheckout: document.querySelector('.close-checkout'),
        checkoutForm: document.querySelector('.checkout-form'),
        steps: document.querySelectorAll('.step'),
        checkoutSteps: document.querySelectorAll('.checkout-step'),
        nextStepBtn: document.querySelector('.next-step'),
        prevStepBtn: document.querySelector('.prev-step'),
        submitOrderBtn: document.querySelector('.submit-order'),
        paymentMethods: document.querySelectorAll('input[name="payment"]'),
        creditCardForm: document.querySelector('.credit-card-form'),
        pixForm: document.querySelector('.pix-form'),
        ordenarProdutos: document.querySelector('.ordenar-produtos'),
        filtroPreco: document.querySelector('.filtro-preco'),
        filtroCategoria: document.querySelector('.filtro-categoria'),
        produtosGrid: document.querySelector('.produtos-grid'),
        produtosContador: document.querySelector('.produtos-contador')
    };

    // Inicializar módulos
    carrinhoModule.inicializar(elementos);
    checkoutModule.inicializar(elementos);
    produtosModule.inicializar(elementos);
    temaModule.inicializar(elementos);

    // Event Listeners
    elementos.cartToggle.addEventListener('click', () => {
        elementos.cartOverlay.classList.add('show');
    });

    elementos.closeCart.addEventListener('click', () => {
        elementos.cartOverlay.classList.remove('show');
    });

    elementos.cartItems.addEventListener('click', (e) => {
        if (e.target.classList.contains('minus')) {
            carrinhoModule.atualizarQuantidade(parseInt(e.target.dataset.id), -1);
        } else if (e.target.classList.contains('plus')) {
            carrinhoModule.atualizarQuantidade(parseInt(e.target.dataset.id), 1);
        } else if (e.target.classList.contains('remove-item') || e.target.closest('.remove-item')) {
            carrinhoModule.removerDoCarrinho(parseInt(e.target.dataset.id || e.target.closest('.remove-item').dataset.id));
        }
    });

    elementos.checkoutBtn.addEventListener('click', () => {
        elementos.checkoutOverlay.classList.add('show');
        checkoutModule.updateSteps();
    });

    elementos.closeCheckout.addEventListener('click', () => {
        elementos.checkoutOverlay.classList.remove('show');
    });

    elementos.nextStepBtn.addEventListener('click', () => {
        if (checkoutModule.validateStep(estado.currentStep)) {
            estado.currentStep++;
            checkoutModule.updateSteps();
        }
    });

    elementos.prevStepBtn.addEventListener('click', () => {
        estado.currentStep--;
        checkoutModule.updateSteps();
    });

    elementos.themeToggle.addEventListener('click', () => temaModule.toggleTheme());

    elementos.ordenarProdutos.addEventListener('change', () => produtosModule.filtrarProdutos());
    elementos.filtroPreco.addEventListener('change', () => produtosModule.filtrarProdutos());
    elementos.filtroCategoria.addEventListener('change', () => produtosModule.filtrarProdutos());
}

// Inicializar a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', inicializarAplicacao);
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

// Carrinho de Compras
const cartBtn = document.querySelector('.cart-btn');
const cartOverlay = document.querySelector('.cart-overlay');
const closeCart = document.querySelector('.close-cart');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.total-price');
const addToCartBtns = document.querySelectorAll('.add-to-cart');

let cart = [];

// Abrir/Fechar Carrinho
cartBtn.addEventListener('click', () => {
    cartOverlay.style.display = 'block';
});

closeCart.addEventListener('click', () => {
    cartOverlay.style.display = 'none';
});

// Adicionar ao Carrinho
addToCartBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const productCard = e.target.closest('.product-card');
        const productName = productCard.querySelector('h3').textContent;
        const productPrice = productCard.querySelector('.product-price').textContent;
        const productImage = productCard.querySelector('img').src;

        const item = {
            name: productName,
            price: productPrice,
            image: productImage,
            quantity: 1
        };

        cart.push(item);
        updateCart();
        updateCartCount();
    });
});

// Atualizar Carrinho
function updateCart() {
    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        const cartItem = document.createElement('div');
        cartItem.classList.add('cart-item');
        cartItem.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>${item.price}</p>
                <div class="cart-item-quantity">
                    <button class="quantity-btn minus" data-index="${index}">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn plus" data-index="${index}">+</button>
                </div>
            </div>
            <button class="remove-item" data-index="${index}">
                <i class="fas fa-times"></i>
            </button>
        `;

        cartItems.appendChild(cartItem);
        total += parseFloat(item.price.replace('R$ ', '').replace(',', '.')) * item.quantity;
    });

    cartTotal.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;

    // Adicionar eventos aos botões de quantidade
    document.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = e.target.dataset.index;
            const isPlus = e.target.classList.contains('plus');
            
            if (isPlus) {
                cart[index].quantity++;
            } else {
                if (cart[index].quantity > 1) {
                    cart[index].quantity--;
                }
            }
            
            updateCart();
            updateCartCount();
        });
    });

    // Adicionar eventos aos botões de remover
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = e.target.closest('.remove-item').dataset.index;
            cart.splice(index, 1);
            updateCart();
            updateCartCount();
        });
    });
}

// Atualizar Contador do Carrinho
function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.querySelector('.cart-count').textContent = count;
}

// Menu Mobile
const menuBtn = document.querySelector('.menu-btn');
const menuOverlay = document.querySelector('.menu-overlay');
const closeMenu = document.querySelector('.close-menu');

menuBtn.addEventListener('click', () => {
    menuOverlay.style.display = 'block';
});

closeMenu.addEventListener('click', () => {
    menuOverlay.style.display = 'none';
});

// Fechar Overlays ao clicar fora
window.addEventListener('click', (e) => {
    if (e.target === cartOverlay) {
        cartOverlay.style.display = 'none';
    }
    if (e.target === menuOverlay) {
        menuOverlay.style.display = 'none';
    }
});

// Filtros de Produtos
const filterBtns = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.product-card');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remover classe active de todos os botões
        filterBtns.forEach(b => b.classList.remove('active'));
        // Adicionar classe active ao botão clicado
        btn.classList.add('active');

        const filter = btn.dataset.filter;

        productCards.forEach(card => {
            if (filter === 'all' || card.dataset.category === filter) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// Filtros de Portfólio
const portfolioFilterBtns = document.querySelectorAll('.portfolio-filters .filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');

portfolioFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remover classe active de todos os botões
        portfolioFilterBtns.forEach(b => b.classList.remove('active'));
        // Adicionar classe active ao botão clicado
        btn.classList.add('active');

        const filter = btn.dataset.filter;

        portfolioItems.forEach(item => {
            if (filter === 'all' || item.dataset.category === filter) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });
});

// Smooth Scroll para links internos
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Newsletter
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = newsletterForm.querySelector('input[type="email"]').value;
        // Aqui você pode adicionar a lógica para enviar o email para seu backend
        alert('Obrigada por se cadastrar! Você receberá nossas novidades em breve.');
        newsletterForm.reset();
    });
}

// Formulário de Contato
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Coletar dados do formulário
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            service: document.getElementById('service').value,
            date: document.getElementById('date').value,
            message: document.getElementById('message').value
        };

        try {
            // Enviar dados para a API
            const response = await fetch('http://localhost:3000/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
                contactForm.reset();
            } else {
                alert('Erro ao enviar mensagem. Por favor, tente novamente mais tarde.');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao enviar mensagem. Por favor, tente novamente mais tarde.');
        }
    });
} 
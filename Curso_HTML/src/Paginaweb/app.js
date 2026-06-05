const productos = [
    { 
        id: 1, 
        nombre: 'iPhone 15 Pro', 
        precio: 25000.00, 
        imagen: 'https://content.macstore.mx/img/sku/IPHONE670_FZ.jpg' 
    },
    { 
        id: 2, 
        nombre: 'Samsung Galaxy S24 Ultra', 
        precio: 22000.00, 
        imagen: 'https://i5.walmartimages.com/asr/eef98c4f-179f-4cd9-80c6-1e2640239a8b.d437e17aac70d095f9d56c3d3bdfc469.jpeg?odnHeight=612&odnWidth=612&odnBg=FFFFFF' 
    },
    { 
        id: 3, 
        nombre: 'Xiaomi 14 Ultra', 
        precio: 18000.00, 
        imagen: 'https://resources.claroshop.com/medios-plazavip/t1/1713063042White01jpg' 
    },
    { 
        id: 4, 
        nombre: 'Google Pixel 8', 
        precio: 15000.00, 
        imagen: 'https://i5.walmartimages.com/asr/b8352d18-7ae7-456b-9448-b0ef0ee0ef85.6a9a52c4cb5d728eb44c4e760c239a09.jpeg?odnHeight=612&odnWidth=612&odnBg=FFFFFF' 
    },
    { 
        id: 5, 
        nombre: 'Motorola Edge 50', 
        precio: 12000.00, 
        imagen: 'https://cell-shop.com.mx/wp-content/uploads/2024/08/169017-800-auto.png' 
    },
    { 
        id: 6, 
        nombre: 'Huawei Pura 70', 
        precio: 17000.00, 
        imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVm5vUItqEI9CdXHadxdQBl6Tw96j4Ng-jWQ&s' 
    }
];

// Estado Global
let carrito = [];
let pasoActual = 1;
let descuentoAplicado = 0;
let cuponActivo = "";

// Referencias del DOM
const productGrid = document.getElementById('product-grid');
const cartCount = document.getElementById('cart-count');
const cartModal = document.getElementById('cart-modal');
const checkoutModal = document.getElementById('checkout-modal');
const cartItemsContainer = document.getElementById('cart-items');
const totalPriceEl = document.getElementById('total-price');
const btnCheckout = document.getElementById('btn-checkout');

// ==========================================================================
// 2. Renderizar Productos utilizando Atributos data-* obligatorios
// ==========================================================================
function renderizarProductos() {
    if (!productGrid) return;
    productGrid.innerHTML = ''; 
    
    productos.forEach(prod => {
        const article = document.createElement('article');
        article.className = 'category-card';
        article.innerHTML = `
            <img src="${prod.imagen}" alt="${prod.nombre}">
            <h3>${prod.nombre}</h3>
            <p class="price">$${prod.precio.toFixed(2)}</p>
            <button class="btn-main btn-add-cart" data-id="${prod.id}">Agregar al carrito</button>
        `;
        productGrid.appendChild(article);
    });

    // Delegación y lectura correcta del atributo data-id mediante dataset
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            agregarAlCarrito(id, e.target);
        });
    });
}

// ==========================================================================
// 3. Funciones del Carrito (Cálculos dinámicos)
// ==========================================================================
function agregarAlCarrito(id, botonEl) {
    const producto = productos.find(p => p.id === id);
    const existe = carrito.find(p => p.id === id);

    if (existe) {
        existe.cantidad++;
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }

    // Cambio visual obligatorio solicitado por el profesor
    botonEl.textContent = '¡Agregado! ✓';
    botonEl.style.backgroundColor = '#2ecc71'; 
    setTimeout(() => {
        botonEl.textContent = 'Agregar al carrito';
        botonEl.style.backgroundColor = ''; 
    }, 1000);

    actualizarCarrito();
}

function eliminarDelCarrito(id) {
    carrito = carrito.filter(p => p.id !== id);
    actualizarCarrito();
}

function actualizarCarrito() {
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    cartCount.textContent = totalItems;

    cartItemsContainer.innerHTML = '';
    let total = 0;

    carrito.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;

        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <span>${item.cantidad}x ${item.nombre}</span>
            <span>$${subtotal.toFixed(2)}</span>
            <button class="btn-secondary btn-delete" data-id="${item.id}">X</button>
        `;
        cartItemsContainer.appendChild(div);
    });

    // Eventos de eliminación dinámicos
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            eliminarDelCarrito(parseInt(e.target.dataset.id));
        });
    });

    totalPriceEl.textContent = total.toFixed(2);
    btnCheckout.disabled = carrito.length === 0;
}

// ==========================================================================
// 4. Control de Modales y Flujo de Checkout
// ==========================================================================
document.getElementById('btn-cart').addEventListener('click', () => cartModal.classList.remove('hidden'));
document.getElementById('btn-close-cart').addEventListener('click', () => cartModal.classList.add('hidden'));

document.querySelectorAll('.btn-cancel-checkout').forEach(btn => {
    btn.addEventListener('click', () => {
        checkoutModal.classList.add('hidden');
        pasoActual = 1;
        mostrarPaso(1);
    });
});

btnCheckout.addEventListener('click', () => {
    cartModal.classList.add('hidden');
    checkoutModal.classList.remove('hidden');
    const summaryContainer = document.getElementById('checkout-summary');
    
    descuentoAplicado = 0;
    cuponActivo = "";
    document.getElementById('coupon-input').value = "";
    document.getElementById('coupon-message').textContent = "";
    document.getElementById('checkout-discount').textContent = "0.00";

    summaryContainer.innerHTML = '';
    carrito.forEach(item => {
        const p = document.createElement('p');
        p.textContent = `${item.cantidad}x ${item.nombre} - $${(item.precio * item.cantidad).toFixed(2)}`;
        summaryContainer.appendChild(p);
    });
    
    document.getElementById('checkout-subtotal').textContent = totalPriceEl.textContent;
    document.getElementById('checkout-total').textContent = totalPriceEl.textContent;
    actualizarProgreso();
});

// Actualización Dinámica de los Pasos
function mostrarPaso(paso) {
    document.querySelectorAll('.checkout-step').forEach(el => el.classList.add('hidden'));
    document.getElementById(`step-${paso}`).classList.remove('hidden');
    actualizarProgreso();
}

window.siguientePaso = function(pasoActualNum) {
    if (validarPaso(pasoActualNum)) {
        pasoActual = pasoActualNum + 1;
        if(pasoActual === 4) generarResumenFinal();
        mostrarPaso(pasoActual);
    }
}

window.pasoAnterior = function(pasoActualNum) {
    pasoActual = pasoActualNum - 1;
    mostrarPaso(pasoActual);
}

function actualizarProgreso() {
    document.querySelectorAll('.step').forEach(el => {
        const stepNum = parseInt(el.dataset.step);
        if (stepNum <= pasoActual) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });
}

// ==========================================================================
// 5. Motor de Cupones Opcional
// ==========================================================================
window.aplicarCupon = function() {
    const couponInput = document.getElementById('coupon-input').value.trim().toUpperCase();
    const msgEl = document.getElementById('coupon-message');
    const subtotal = parseFloat(totalPriceEl.textContent);
    
    if (couponInput === "") { msgEl.textContent = "Ingresa un código."; return; }
    if (cuponActivo !== "") { msgEl.textContent = "Cupón ya aplicado."; return; }

    if (couponInput === "IPHONE20" && carrito.some(item => item.nombre.toLowerCase().includes('iphone'))) {
        descuentoAplicado = subtotal * 0.20;
        cuponActivo = "IPHONE20";
        msgEl.style.color = "green";
        msgEl.textContent = "Descuento del 20% aplicado con éxito.";
    } else if (couponInput === "MOTOBOOM" && carrito.some(item => item.nombre.toLowerCase().includes('motorola'))) {
        descuentoAplicado = 1500;
        cuponActivo = "MOTOBOOM";
        msgEl.style.color = "green";
        msgEl.textContent = "Descuento de $1,500.00 MXN aplicado.";
    } else {
        msgEl.style.color = "red";
        msgEl.textContent = "El cupón no es válido para este carrito.";
        return;
    }

    let totalFinal = subtotal - descuentoAplicado;
    document.getElementById('checkout-discount').textContent = descuentoAplicado.toFixed(2);
    document.getElementById('checkout-total').textContent = totalFinal.toFixed(2);
};

// ==========================================================================
// 6. Validaciones Estrictas del Formulario
// ==========================================================================
function validarPaso(paso) {
    if (paso === 2) {
        const nombre = document.getElementById('nombre').value.trim();
        const email = document.getElementById('email').value.trim();
        const direccion = document.getElementById('direccion').value.trim();
        const errorDiv = document.getElementById('error-step-2');

        if (nombre.length < 3) { errorDiv.textContent = "Mínimo 3 caracteres en el nombre."; return false; }
        if (!email.includes('@') || !email.includes('.')) { errorDiv.textContent = "Correo no válido."; return false; }
        if (direccion === "") { errorDiv.textContent = "La dirección no puede estar vacía."; return false; }
        errorDiv.textContent = ""; return true;
    }

    if (paso === 3) {
        const metodo = document.querySelector('input[name="metodo_pago"]:checked').value;
        const errorDiv = document.getElementById('error-step-3');

        if (metodo === 'Tarjeta') {
            const num = document.getElementById('num-tarjeta').value.trim();
            const fecha = document.getElementById('fecha-vencimiento').value.trim();
            const cvv = document.getElementById('cvv').value.trim();

            if (num.length < 16 || isNaN(num)) { errorDiv.textContent = "Número de tarjeta debe tener 16 dígitos."; return false; }
            if (fecha.length < 5) { errorDiv.textContent = "Fecha de vencimiento incompleta (MM/AA)."; return false; }
            if (cvv.length < 3 || isNaN(cvv)) { errorDiv.textContent = "CVV inválido."; return false; }
        }
        errorDiv.textContent = ""; return true;
    }
    return true;
}

// Controladores dinámicos de los Radio Buttons obligatorios
const radioTarjeta = document.getElementById('tarjeta');
const radioCheques = document.getElementById('cheques');
const camposTarjeta = document.getElementById('campos-tarjeta');

if (radioTarjeta && radioCheques && camposTarjeta) {
    radioTarjeta.addEventListener('change', () => camposTarjeta.style.display = 'block');
    radioCheques.addEventListener('change', () => camposTarjeta.style.display = 'none');
}

// ==========================================================================
// 7. Resumen e Inicialización
// ==========================================================================
function generarResumenFinal() {
    const finalReview = document.getElementById('final-review');
    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const direccion = document.getElementById('direccion').value;
    const metodo = document.querySelector('input[name="metodo_pago"]:checked').value;
    const totalConDescuento = document.getElementById('checkout-total').textContent;
    
    finalReview.innerHTML = `
        <p><strong>Receptor:</strong> ${nombre} (${email})</p>
        <p><strong>Envío a:</strong> ${direccion}</p>
        <p><strong>Método seleccionado:</strong> ${metodo}</p>
        <hr style="margin: 10px 0; border: 0; border-top: 1px solid #ccc;">
        <h4>Total definitivo a pagar: $${totalConDescuento}</h4>
    `;
}

window.confirmarCompra = function() {
    alert('✅ ¡Compra confirmada con éxito! El carrito se ha limpiado.');
    carrito = [];
    descuentoAplicado = 0;
    cuponActivo = "";
    actualizarCarrito();
    document.getElementById('form-datos').reset();
    document.getElementById('form-pago').reset();
    checkoutModal.classList.add('hidden');
    pasoActual = 1;
    mostrarPaso(1);
}

document.addEventListener("DOMContentLoaded", renderizarProductos);
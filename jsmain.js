const API_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
    // Identificamos en qué página estamos según la URL o elementos únicos
    if (window.location.href.includes('inventario.html')) {
        cargarInventario();
    } else if (window.location.href.includes('stock.html')) {
        cargarStock();
    } else if (window.location.href.includes('dashboard.html')) {
        cargarUsuarios();
    }

    // Inicializar los eventos de autenticación
    inicializarLogin();
    inicializarRegistro();
});

// ==========================================
// 1. CARGAR Y EDITAR INVENTARIO
// ==========================================
async function cargarInventario() {
    try {
        const respuesta = await fetch(`${API_URL}/inventario`);
        const productos = await respuesta.json();
        
        const tbody = document.querySelector('tbody');
        if (!tbody) return;
        
        tbody.innerHTML = ''; 

        productos.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${item.id}</td>
                <td>${item.nombre}</td>
                <td>${item.stock}</td>
                <td class="actions-cell">
                    <i class="fa-solid fa-minus action-icon" onclick="cambiarStock('${item.id}', -1)" title="Restar"></i>
                    <i class="fa-solid fa-pencil action-icon" onclick="editarProducto('${item.id}', '${item.nombre}')" title="Editar"></i>
                    <i class="fa-solid fa-plus action-icon" onclick="cambiarStock('${item.id}', 1)" title="Sumar"></i>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error al cargar inventario:', error);
    }
}

async function cambiarStock(id, cantidadCambio) {
    try {
        const resGet = await fetch(`${API_URL}/inventario/${id}`);
        const producto = await resGet.json();
        
        const nuevoStock = Number(producto.stock) + cantidadCambio;

        await fetch(`${API_URL}/inventario/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stock: nuevoStock >= 0 ? nuevoStock : 0 })
        });

        cargarInventario();
    } catch (error) {
        console.error('Error al actualizar stock:', error);
    }
}

async function editarProducto(id, nombreActual) {
    const nuevoNombre = prompt("Edita el nombre del producto:", nombreActual);
    if (!nuevoNombre) return;

    try {
        await fetch(`${API_URL}/inventario/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: nuevoNombre })
        });
        cargarInventario();
    } catch (error) {
        console.error('Error al editar:', error);
    }
}

// ==========================================
// 2. CARGAR DASHBOARD / STOCK CRÍTICO
// ==========================================
async function cargarStock() {
    try {
        const respuesta = await fetch(`${API_URL}/inventario`);
        const productos = await respuesta.json();

        const criticos = productos.filter(p => p.stock <= 3);
        
        const spanCritico = document.querySelector('.critical-number');
        if (spanCritico) spanCritico.textContent = criticos.length;

        const tbody = document.querySelector('.stock-alert-section tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        criticos.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><i class="fa-solid fa-triangle-exclamation text-danger"></i> #${item.id}</td>
                <td>${item.nombre}</td>
                <td>${item.stock}</td>
                <td>3</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error al cargar stock:', error);
    }
}

// ==========================================
// 3. CARGAR USUARIOS (DASHBOARD)
// ==========================================
async function cargarUsuarios() {
    try {
        const respuesta = await fetch(`${API_URL}/usuarios`);
        const usuarios = await respuesta.json();

        const tbody = document.querySelector('tbody');
        if (!tbody) return;

        tbody.innerHTML = '';
        usuarios.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.id}</td>
                <td>${user.nombre}</td>
                <td>${user.rol}</td>
                <td>${user.estado} <span class="status-dot ${user.estado === 'Activo' ? 'green' : 'blue'}"></span></td>
                <td class="actions-cell">
                    <i class="fa-solid fa-pencil action-icon"></i>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
    }
}

// ==========================================
// 4. VALIDACIÓN DE INICIO DE SESIÓN CON LA API
// ==========================================
function inicializarLogin() {
    const formLogin = document.querySelector('#loginForm');
    if (!formLogin) return;

    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();

        const inputNombre = document.querySelector('#loginUsuario').value.trim();
        const inputPass = document.querySelector('#loginPassword').value.trim();
        const divError = document.querySelector('#errorMensaje');

        try {
            const respuesta = await fetch(`${API_URL}/usuarios`);
            const usuarios = await respuesta.json();

            // Buscamos coincidencia exacta por nombre de usuario (ignorando mayúsculas)
            const usuarioEncontrado = usuarios.find(u => u.nombre.toLowerCase() === inputNombre.toLowerCase());

            if (!usuarioEncontrado) {
                // Si el usuario no existe en la base de datos
                if (divError) {
                    divError.style.display = 'block';
                    divError.textContent = "❌ Este usuario no está registrado en el sistema.";
                }
                return;
            }

            // Si el usuario existe pero la contraseña no coincide
            if (usuarioEncontrado.password && usuarioEncontrado.password !== inputPass) {
                if (divError) {
                    divError.style.display = 'block';
                    divError.textContent = "❌ Contraseña incorrecta.";
                }
                return;
            }

            // Si todo es correcto, guardamos la sesión y redirigimos
            sessionStorage.setItem('usuarioLogueado', JSON.stringify(usuarioEncontrado));
            window.location.href = 'dashboard.html';

        } catch (error) {
            console.error('Error al conectar con la API para el login:', error);
            if (divError) {
                divError.style.display = 'block';
                divError.textContent = "⚠️ Error de conexión con el servidor local.";
            }
        }
    });
}

// ==========================================
// 5. REGISTRO DE NUEVOS USUARIOS EN LA API
// ==========================================
function inicializarRegistro() {
    const formRegistro = document.querySelector('#registerForm');
    if (!formRegistro) return;

    formRegistro.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Capturamos de forma segura mediante los IDs específicos del formulario de registro
        const nombreIngresado = document.querySelector('#regNombre').value.trim();
        const passwordIngresada = document.querySelector('#regPassword').value.trim();

        const nuevoUsuario = {
            id: "U0" + Math.floor(Math.random() * 90 + 10),
            nombre: nombreIngresado,
            password: passwordIngresada,
            rol: "Vendedor",
            estado: "Activo"
        };

        try {
            const respuesta = await fetch(`${API_URL}/usuarios`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoUsuario)
            });

            if (respuesta.ok) {
                alert("¡Registro exitoso! Ahora puedes iniciar sesión con tus credenciales.");
                window.location.href = 'index.html';
            } else {
                alert("Error al registrar el usuario en la base de datos.");
            }
        } catch (error) {
            console.error("Error de conexión al registrar:", error);
            alert("No se pudo conectar con el servidor local para guardar el registro.");
        }
    });
}
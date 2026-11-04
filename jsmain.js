// ==========================================
// CONFIGURACIÓN GLOBAL Y URL DE LA API
// ==========================================
const API_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
    const bienvenidaH2 = document.getElementById('bienvenidaUsuario');
    const usuarioLogueadoStr = localStorage.getItem('usuarioLogueado');
    if (bienvenidaH2 && usuarioLogueadoStr) {
        try {
            const user = JSON.parse(usuarioLogueadoStr);
            bienvenidaH2.textContent = `BIENVENIDO, ${user.nombre.toUpperCase()}.`;
        } catch (e) {
            bienvenidaH2.textContent = "BIENVENIDO, USUARIO.";
        }
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const usuarioInput = document.getElementById('loginUsuario').value.trim();
            const passwordInput = document.getElementById('loginPassword').value.trim();
            const errorDiv = document.getElementById('errorMensaje');

            try {
                const respuesta = await fetch(`${API_URL}/usuarios`);
                const usuarios = await respuesta.json();
                const usuarioEncontrado = usuarios.find(u => 
                    u.nombre.toLowerCase() === usuarioInput.toLowerCase() || u.id.toLowerCase() === usuarioInput.toLowerCase()
                );

                if (usuarioEncontrado) {
                    if (!usuarioEncontrado.password || usuarioEncontrado.password === passwordInput) {
                        localStorage.setItem('usuarioLogueado', JSON.stringify(usuarioEncontrado));
                        window.location.href = 'stock.html';
                        return;
                    }
                }

                if (errorDiv) errorDiv.style.display = 'block';
            } catch (error) {
                console.error('Error al conectar con la API:', error);
            }
        });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const nombre = document.getElementById('regNombre').value.trim();
            const password = document.getElementById('regPassword').value.trim();

            const nuevoUsuario = {
                id: `U${Math.floor(100 + Math.random() * 900)}`,
                nombre: nombre,
                password: password,
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
                    alert('¡Registro exitoso! Por favor inicia sesión.');
                    window.location.href = 'index.html';
                }
            } catch (error) {
                console.error('Error en el registro:', error);
            }
        });
    }

    // ==========================================
    // FORMULARIO DE RECUPERACIÓN DE CONTRASEÑA
    // ==========================================
    const forgotForm = document.getElementById("forgotPasswordForm");
    if (forgotForm) {
        forgotForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const usuarioInput = document.getElementById("forgotUsuario").value.trim();
            const nuevaPasswordInput = document.getElementById("forgotNuevaPassword").value.trim();
            const mensajeDiv = document.getElementById("forgotMensaje");
            const btnSubmit = document.getElementById("btnEnviarSolicitud");

            try {
                const resUsuarios = await fetch(`${API_URL}/usuarios`);
                const usuarios = await resUsuarios.json();
                
                const usuarioEncontrado = usuarios.find(u => 
                    u.nombre.toLowerCase() === usuarioInput.toLowerCase() || u.id.toLowerCase() === usuarioInput.toLowerCase()
                );

                if (!usuarioEncontrado) {
                    mensajeDiv.style.display = "block";
                    mensajeDiv.style.backgroundColor = "#fee2e2";
                    mensajeDiv.style.color = "#991b1b";
                    mensajeDiv.innerText = "El usuario no se encuentra registrado en el sistema.";
                    return;
                }

                const nuevaSolicitud = {
                    usuarioId: usuarioEncontrado.id,
                    nombreUsuario: usuarioEncontrado.nombre,
                    nuevaPassword: nuevaPasswordInput,
                    fecha: new Date().toLocaleString("es-CO"),
                    estado: "Pendiente"
                };

                const resPost = await fetch(`${API_URL}/solicitudes_password`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(nuevaSolicitud)
                });

                if (resPost.ok) {
                    mensajeDiv.style.display = "block";
                    mensajeDiv.style.backgroundColor = "#dcfce7";
                    mensajeDiv.style.color = "#166534";
                    mensajeDiv.innerText = "La solicitud de cambio de contraseña ha sido enviada a un administrador";
                    
                    btnSubmit.disabled = true;
                    btnSubmit.style.opacity = "0.6";
                    forgotForm.reset();
                } else {
                    throw new Error("Error al guardar la solicitud");
                }

            } catch (error) {
                console.error(error);
                mensajeDiv.style.display = "block";
                mensajeDiv.style.backgroundColor = "#fee2e2";
                mensajeDiv.style.color = "#991b1b";
                mensajeDiv.innerText = "Ocurrió un error al procesar la solicitud. Intente nuevamente.";
            }
        });
    }

    if (document.getElementById('tabla-usuarios-body') || document.getElementById('searchInput')) {
        cargarUsuarios();
    }
    if (document.getElementById('tabla-stock-body') || document.getElementById('searchStockInput')) {
        cargarStockDashboard();
    }
    if (document.getElementById('tabla-inventario-body') || document.getElementById('searchInventarioInput')) {
        cargarInventario();
    }
    if (document.getElementById('tabla-movimientos-body') || document.getElementById('searchMovimientosInput')) {
        cargarMovimientos();
    }

    // Inicializar eventos de la campana y notificaciones
    inicializarCampanaNotificaciones();
    cargarNotificacionesCampana();
});


// ==========================================
// GESTIÓN DE NOTIFICACIONES Y CAMPANA (CORREGIDO)
// ==========================================
function inicializarCampanaNotificaciones() {
    const bellIcon = document.getElementById("bellIcon");
    const notificationDropdown = document.getElementById("notificationDropdown");
    const closeDropdown = document.getElementById("closeDropdown");

    // Asegurar que inicie cerrado correctamente
    if (notificationDropdown) {
        notificationDropdown.classList.remove("active");
    }

    if (bellIcon && notificationDropdown) {
        bellIcon.addEventListener("click", (e) => {
            e.stopPropagation();
            notificationDropdown.classList.toggle("active");
        });
    }

    if (closeDropdown && notificationDropdown) {
        closeDropdown.addEventListener("click", (e) => {
            e.stopPropagation();
            notificationDropdown.classList.remove("active");
        });
    }

    document.addEventListener("click", (e) => {
        if (notificationDropdown && notificationDropdown.classList.contains("active")) {
            if (!notificationDropdown.contains(e.target) && e.target !== bellIcon) {
                notificationDropdown.classList.remove("active");
            }
        }
    });
}

async function cargarNotificacionesCampana() {
    const badge = document.getElementById("notifBadge");
    const listaContent = document.getElementById("notificationListContent");

    if (!badge || !listaContent) return;

    const usuarioStr = localStorage.getItem('usuarioLogueado');
    if (!usuarioStr) {
        badge.style.display = "none";
        return;
    }

    let user = {};
    try { user = JSON.parse(usuarioStr); } catch(e) { return; }

    const isAdmin = esAdministradorOEquivalente();
    
    const prefStock = localStorage.getItem(`notif_stock_${user.id}`) !== 'false';
    const prefLogins = localStorage.getItem(`notif_logins_${user.id}`) !== 'false';

    let notifsBorradas = [];
    try {
        notifsBorradas = JSON.parse(localStorage.getItem(`borradas_${user.id}`)) || [];
    } catch(e) {}

    let itemsHtml = "";
    let totalNotificaciones = 0;

    try {
        if (prefStock) {
            const resInv = await fetch(`${API_URL}/inventario`);
            const inventario = await resInv.json();
            
            inventario.forEach(prod => {
                const stockActual = Number(prod.stock) || 0;
                const stockMinimo = Number(prod.stockMinimo) || 5;
                const notifId = `stock_${prod.id}`;

                if (stockActual <= stockMinimo && !notifsBorradas.includes(notifId)) {
                    totalNotificaciones++;
                    itemsHtml += `
                        <div class="notification-item" id="notif-${notifId}">
                            <div style="display:flex; justify-content:space-between; align-items:start;">
                                <div>
                                    <i class="fa-solid fa-triangle-exclamation text-danger"></i> 
                                    <strong>Stock Bajo:</strong> ${prod.nombre} (Actual: ${stockActual})
                                </div>
                                <i class="fa-solid fa-xmark" style="cursor:pointer; color:#94a3b8;" onclick="borrarNotificacionIndividual('${notifId}')" title="Borrar notificación"></i>
                            </div>
                        </div>
                    `;
                }
            });
        }

        if (isAdmin && prefLogins) {
            const resMov = await fetch(`${API_URL}/movimientos`);
            const movimientos = await resMov.json();
            
            const actividadReciente = movimientos.slice(-3);
            actividadReciente.forEach((mov, index) => {
                const notifId = `login_${mov.id || index}`;
                if (!notifsBorradas.includes(notifId)) {
                    totalNotificaciones++;
                    itemsHtml += `
                        <div class="notification-item" id="notif-${notifId}">
                            <div style="display:flex; justify-content:space-between; align-items:start;">
                                <div>
                                    <i class="fa-solid fa-user-check" style="color:#10b981;"></i> 
                                    <strong>Actividad:</strong> ${mov.usuario || 'Sistema'} registró movimiento en ${mov.producto}
                                </div>
                                <i class="fa-solid fa-xmark" style="cursor:pointer; color:#94a3b8;" onclick="borrarNotificacionIndividual('${notifId}')" title="Borrar notificación"></i>
                            </div>
                            <div style="font-size: 10px; color: #64748b; margin-top: 2px;">${mov.fecha}</div>
                        </div>
                    `;
                }
            });
        }

        if (isAdmin) {
            const resSol = await fetch(`${API_URL}/solicitudes_password`);
            const solicitudes = await resSol.json();
            const pendientes = solicitudes.filter(s => s.estado === "Pendiente");

            pendientes.forEach(sol => {
                const notifId = `sol_${sol.id}`;
                if (!notifsBorradas.includes(notifId)) {
                    totalNotificaciones++;
                    itemsHtml += `
                        <div class="notification-item" id="notif-${notifId}">
                            <div style="display:flex; justify-content:space-between; align-items:start;">
                                <div>
                                    <strong>${sol.nombreUsuario}</strong> solicitó cambio de clave.
                                </div>
                                <i class="fa-solid fa-xmark" style="cursor:pointer; color:#94a3b8;" onclick="borrarNotificacionIndividual('${notifId}')" title="Borrar notificación"></i>
                            </div>
                            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${sol.fecha}</div>
                            <div class="notification-actions" style="margin-top: 8px; display: flex; gap: 6px;">
                                <button onclick="responderSolicitud('${sol.id}', '${sol.usuarioId}', '${sol.nuevaPassword}', true)" class="btn-save" style="padding: 4px 8px; font-size: 11px;">Aceptar</button>
                                <button onclick="responderSolicitud('${sol.id}', '${sol.usuarioId}', '', false)" class="btn-cancel" style="padding: 4px 8px; font-size: 11px;">Rechazar</button>
                            </div>
                        </div>
                    `;
                }
            });
        }

        if (badge && listaContent) {
            if (totalNotificaciones > 0) {
                badge.style.display = "block";
                badge.innerText = totalNotificaciones;
                listaContent.innerHTML = itemsHtml;
            } else {
                badge.style.display = "none";
                listaContent.innerHTML = `<div class="notification-empty">No hay notificaciones nuevas</div>`;
            }
        }

    } catch (err) {
        console.error("Error al cargar notificaciones:", err);
    }
}

function borrarNotificacionIndividual(notifId) {
    const usuarioStr = localStorage.getItem('usuarioLogueado');
    if (!usuarioStr) return;
    
    try {
        const user = JSON.parse(usuarioStr);
        let notifsBorradas = JSON.parse(localStorage.getItem(`borradas_${user.id}`)) || [];
        
        if (!notifsBorradas.includes(notifId)) {
            notifsBorradas.push(notifId);
            localStorage.setItem(`borradas_${user.id}`, JSON.stringify(notifsBorradas));
        }

        const elemento = document.getElementById(`notif-${notifId}`);
        if (elemento) elemento.remove();

        cargarNotificacionesCampana();
    } catch(e) {
        console.error("Error al borrar notificación", e);
    }
}

async function responderSolicitud(solicitudId, usuarioId, nuevaPassword, aceptado) {
    if (!esAdministradorOEquivalente()) {
        alert("Acción no permitida. Solo los administradores pueden aceptar o rechazar solicitudes.");
        return;
    }

    try {
        if (aceptado) {
            await fetch(`${API_URL}/usuarios/${usuarioId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: nuevaPassword })
            });
            alert("Contraseña actualizada exitosamente.");
        } else {
            alert("Solicitud rechazada.");
        }

        await fetch(`${API_URL}/solicitudes_password/${solicitudId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estado: aceptado ? "Aprobada" : "Rechazada" })
        });

        cargarNotificacionesCampana();

    } catch (error) {
        console.error("Error al responder la solicitud:", error);
        alert("Ocurrió un error al procesar la respuesta.");
    }
}


// ==========================================
// CONTROL DE ROLES Y SEGURIDAD
// ==========================================
function esAdministradorOEquivalente() {
    const usuarioLogueadoStr = localStorage.getItem('usuarioLogueado');
    if (!usuarioLogueadoStr) return false;
    try {
        const user = JSON.parse(usuarioLogueadoStr);
        const rol = (user.rol || '').toLowerCase();
        return rol === 'administrador' || rol === 'inventarista' || rol === 'inversionista';
    } catch (e) {
        return false;
    }
}


// ==========================================
// GESTIÓN DE USUARIOS (DASHBOARD)
// ==========================================
let listaUsuariosGlobal = [];
const jerarquiaRoles = { "administrador": 1, "inversionista": 2, "inventarista": 2, "vendedor": 3 };

async function cargarUsuarios() {
    try {
        const respuesta = await fetch(`${API_URL}/usuarios`);
        listaUsuariosGlobal = await respuesta.json();
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.removeEventListener('input', filtrarUsuarios);
            searchInput.addEventListener('input', filtrarUsuarios);
        }
        renderizarTablaUsuarios(listaUsuariosGlobal);
    } catch (error) { console.error('Error al cargar usuarios:', error); }
}

function ordenarUsuarios(usuarios) {
    return usuarios.sort((a, b) => {
        const pesoA = jerarquiaRoles[(a.rol || '').toLowerCase()] || 99;
        const pesoB = jerarquiaRoles[(b.rol || '').toLowerCase()] || 99;
        if (pesoA !== pesoB) return pesoA - pesoB;
        return a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' });
    });
}

function renderizarTablaUsuarios(usuarios) {
    const tbody = document.getElementById('tabla-usuarios-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    const usuariosOrdenados = ordenarUsuarios([...usuarios]);
    const isAdmin = esAdministradorOEquivalente();

    usuariosOrdenados.forEach(user => {
        const rolLower = (user.rol || '').toLowerCase();
        let rolHtml = user.rol;
        if (['administrador', 'inventarista', 'inversionista'].includes(rolLower)) {
            rolHtml = `<span class="badge-role">${user.rol}</span>`;
        }

        let accionesHtml = '';
        if (isAdmin) {
            accionesHtml = `
                <i class="fa-solid fa-pencil action-icon" onclick="togglePanelAccionUsuario('${user.id}', 'editar')" title="Editar nombre"></i>
                <i class="fa-solid fa-key action-icon" onclick="togglePanelAccionUsuario('${user.id}', 'password')" title="Cambiar contraseña"></i>
                <i class="fa-solid fa-trash action-icon text-danger" onclick="eliminarUsuario('${user.id}', '${user.nombre}')" title="Eliminar usuario"></i>
            `;
        } else {
            accionesHtml = `<span style="color: #ff6b6b; font-weight: 700; font-size: 0.9rem;">No eres Administrador</span>`;
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><button class="btn-toggle-history" onclick="toggleHistorial('${user.id}', '${user.nombre}')"><i class="fa-solid fa-chevron-down" id="icon-chevron-${user.id}"></i></button></td>
            <td>${user.id}</td>
            <td><strong>${user.nombre}</strong></td>
            <td>${rolHtml}</td>
            <td>${user.estado || 'Activo'} <span class="status-dot ${user.estado === 'Inactivo' ? 'blue' : 'green'}"></span></td>
            <td class="actions-cell">${accionesHtml}</td>
        `;
        tbody.appendChild(tr);

        const trEditar = document.createElement('tr');
        trEditar.id = `panel-editar-${user.id}`;
        trEditar.className = 'action-dropdown-row';
        trEditar.style.display = 'none';
        trEditar.innerHTML = `
            <td colspan="6">
                <div class="action-panel-container">
                    <h4><i class="fa-solid fa-user-pen"></i> Editar Nombre de Usuario (${user.id})</h4>
                    <form onsubmit="guardarNombreUsuario(event, '${user.id}')" class="inline-form">
                        <div class="form-group" style="margin-bottom: 12px;">
                            <label>Nuevo Nombre:</label>
                            <input type="text" id="input-edit-nombre-${user.id}" value="${user.nombre}" class="form-control" required>
                        </div>
                        <div class="panel-actions">
                            <button type="submit" class="btn-save"><i class="fa-solid fa-check"></i> Guardar</button>
                            <button type="button" class="btn-cancel" onclick="ocultarPanelesUsuario('${user.id}')">Cancelar</button>
                        </div>
                    </form>
                </div>
            </td>
        `;
        tbody.appendChild(trEditar);

        const trPass = document.createElement('tr');
        trPass.id = `panel-password-${user.id}`;
        trPass.className = 'action-dropdown-row';
        trPass.style.display = 'none';
        trPass.innerHTML = `
            <td colspan="6">
                <div class="action-panel-container">
                    <h4><i class="fa-solid fa-key"></i> Cambiar Contraseña de: ${user.nombre}</h4>
                    <form onsubmit="guardarPasswordUsuario(event, '${user.id}')" class="inline-form">
                        <div class="form-group" style="margin-bottom: 12px;">
                            <label>Nueva Contraseña:</label>
                            <input type="password" id="input-edit-pass-${user.id}" placeholder="Mínimo 4 caracteres" class="form-control" required minlength="4">
                        </div>
                        <div class="panel-actions">
                            <button type="submit" class="btn-save"><i class="fa-solid fa-arrows-rotate"></i> Actualizar</button>
                            <button type="button" class="btn-cancel" onclick="ocultarPanelesUsuario('${user.id}')">Cancelar</button>
                        </div>
                    </form>
                </div>
            </td>
        `;
        tbody.appendChild(trPass);

        const trHistorial = document.createElement('tr');
        trHistorial.id = `history-row-${user.id}`;
        trHistorial.className = 'action-dropdown-row';
        trHistorial.style.display = 'none';
        trHistorial.innerHTML = `
            <td colspan="6">
                <div class="history-container">
                    <strong><i class="fa-solid fa-clock-rotate-left"></i> Últimas 10 acciones de ${user.nombre}:</strong>
                    <ul class="history-list" id="history-list-${user.id}">
                        <li><em>Cargando historial...</em></li>
                    </ul>
                </div>
            </td>
        `;
        tbody.appendChild(trHistorial);
    });
}

function filtrarUsuarios() {
    const texto = document.getElementById('searchInput').value.toLowerCase().trim();
    const filtrados = listaUsuariosGlobal.filter(u => u.id.toLowerCase().includes(texto) || u.nombre.toLowerCase().includes(texto) || u.rol.toLowerCase().includes(texto));
    renderizarTablaUsuarios(filtrados);
}

function ocultarPanelesUsuario(userId) {
    const rowEdit = document.getElementById(`panel-editar-${userId}`);
    const rowPass = document.getElementById(`panel-password-${userId}`);
    const rowHist = document.getElementById(`history-row-${userId}`);
    if (rowEdit) rowEdit.style.display = 'none';
    if (rowPass) rowPass.style.display = 'none';
    if (rowHist) rowHist.style.display = 'none';
}

function togglePanelAccionUsuario(userId, tipo) {
    if (!esAdministradorOEquivalente()) {
        alert("No eres Administrador");
        return;
    }
    const rowTarget = document.getElementById(`panel-${tipo}-${userId}`);
    if (!rowTarget) return;
    const estaAbierto = rowTarget.style.display === 'table-row';
    ocultarPanelesUsuario(userId);
    if (!estaAbierto) {
        rowTarget.style.display = 'table-row';
    }
}

async function toggleHistorial(userId, nombreUsuario) {
    const rowHist = document.getElementById(`history-row-${userId}`);
    const icon = document.getElementById(`icon-chevron-${userId}`);
    if (!rowHist || !icon) return;

    const estaAbierto = rowHist.style.display === 'table-row';

    document.querySelectorAll('.action-dropdown-row').forEach(row => {
        if(row.id.startsWith('history-row-')) row.style.display = 'none';
    });
    document.querySelectorAll('.btn-toggle-history i').forEach(i => {
        i.classList.remove('fa-chevron-up');
        i.classList.add('fa-chevron-down');
    });

    if (!estaAbierto) {
        rowHist.style.display = 'table-row';
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
        
        await cargarHistorialMovimientosUsuario(userId, nombreUsuario);
    }
}

async function cargarHistorialMovimientosUsuario(userId, nombreUsuario) {
    const listContainer = document.getElementById(`history-list-${userId}`);
    if (!listContainer) return;

    listContainer.innerHTML = `<li><em>Cargando historial de cambios...</em></li>`;

    try {
        const respuesta = await fetch(`${API_URL}/movimientos`);
        const movimientos = await respuesta.json();

        const movimientosUsuario = movimientos.filter(m => 
            m.usuario && m.usuario.toLowerCase() === nombreUsuario.toLowerCase()
        );

        movimientosUsuario.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        const agrupados = [];
        movimientosUsuario.forEach(m => {
            const ultimo = agrupados[agrupados.length - 1];
            if (ultimo && ultimo.tipo === m.tipo && ultimo.producto === m.producto && ultimo.sku === m.sku) {
                ultimo.cantidad += Number(m.cantidad);
            } else {
                agrupados.push({
                    fecha: m.fecha,
                    tipo: m.tipo,
                    producto: m.producto,
                    sku: m.sku,
                    cantidad: Number(m.cantidad)
                });
            }
        });

        const ultimas10 = agrupados.slice(0, 10);

        if (ultimas10.length === 0) {
            listContainer.innerHTML = `<li><em>No se registran cambios de inventario realizados por este usuario todavía.</em></li>`;
            return;
        }

        listContainer.innerHTML = '';
        ultimas10.forEach(m => {
            const li = document.createElement('li');
            li.className = 'history-item';
            li.innerHTML = `
                <span><strong>[${m.tipo}]</strong> ${m.cantidad} ${m.producto} (${m.sku})</span>
                <small class="text-muted">${m.fecha}</small>
            `;
            listContainer.appendChild(li);
        });

    } catch (error) {
        console.error('Error al obtener el historial del usuario:', error);
        listContainer.innerHTML = `<li><em>Error al conectar con el servidor de movimientos.</em></li>`;
    }
}

async function guardarNombreUsuario(event, userId) {
    event.preventDefault();
    if (!esAdministradorOEquivalente()) {
        alert("No eres Administrador");
        return;
    }
    const input = document.getElementById(`input-edit-nombre-${userId}`);
    if (!input) return;
    const nuevoNombre = input.value.trim();

    try {
        const respuesta = await fetch(`${API_URL}/usuarios/${userId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: nuevoNombre })
        });
        if (respuesta.ok) {
            alert('¡Nombre actualizado exitosamente!');
            await cargarUsuarios();
        } else {
            alert('Error al actualizar el nombre.');
        }
    } catch (e) { console.error(e); }
}

async function guardarPasswordUsuario(event, userId) {
    event.preventDefault();
    if (!esAdministradorOEquivalente()) {
        alert("No eres Administrador");
        return;
    }
    const input = document.getElementById(`input-edit-pass-${userId}`);
    if (!input) return;
    const nuevaPassword = input.value.trim();

    try {
        const respuesta = await fetch(`${API_URL}/usuarios/${userId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: nuevaPassword })
        });
        if (respuesta.ok) {
            alert('¡Contraseña actualizada exitosamente!');
            ocultarPanelesUsuario(userId);
            input.value = '';
        } else {
            alert('Error al actualizar la contraseña.');
        }
    } catch (e) { console.error(e); }
}

async function eliminarUsuario(id, nombre) {
    if (!esAdministradorOEquivalente()) {
        alert("No eres Administrador");
        return;
    }
    if (confirm(`¿Estás seguro de eliminar al usuario "${nombre}" (ID: ${id})?`)) {
        try {
            const respuesta = await fetch(`${API_URL}/usuarios/${id}`, { method: 'DELETE' });
            if (respuesta.ok) {
                alert('Usuario eliminado correctamente.');
                await cargarUsuarios();
            } else {
                alert('Error al eliminar el usuario.');
            }
        } catch (e) { console.error(e); }
    }
}


// ==========================================
// GENERACIÓN DE SKU ASCENDENTE
// ==========================================
function generarSiguienteSKU(productosExistentes) {
    if (!productosExistentes || productosExistentes.length === 0) return "#001";
    let maxNum = 0;
    let maxPrefijo = "";

    productosExistentes.forEach(p => {
        let skuClean = String(p.id).replace('#', '').trim();
        let matchNum = skuClean.match(/\d+$/);
        if (matchNum) {
            let num = parseInt(matchNum[0], 10);
            let pref = skuClean.replace(/\d+$/, '');
            if (pref === maxPrefijo) {
                if (num > maxNum) maxNum = num;
            } else if (pref > maxPrefijo) {
                maxPrefijo = pref;
                maxNum = num;
            }
        }
    });

    let siguienteNum = maxNum + 1;
    let numPadded = String(siguienteNum).padStart(3, '0');
    return `#${maxPrefijo}${numPadded}`;
}


// ==========================================
// FUNCIÓN AUXILIAR: REGISTRAR MOVIMIENTOS
// ==========================================
async function registrarMovimiento(tipo, productoNombre, sku, cantidad) {
    const ahora = new Date();
    const fechaFormateada = ahora.toISOString().slice(0, 16).replace('T', ' ');

    let usuarioResponsable = "Sistema";
    const usuarioLogueadoStr = localStorage.getItem('usuarioLogueado');
    if (usuarioLogueadoStr) {
        try {
            const userObj = JSON.parse(usuarioLogueadoStr);
            if (userObj && userObj.nombre) {
                usuarioResponsable = userObj.nombre;
            }
        } catch (e) {
            console.error("Error al parsear usuario logueado", e);
        }
    }

    const nuevoMovimiento = {
        fecha: fechaFormateada,
        tipo: tipo,
        producto: productoNombre,
        sku: `#${String(sku).replace('#','')}`,
        cantidad: Math.abs(cantidad),
        usuario: usuarioResponsable
    };

    try {
        await fetch(`${API_URL}/movimientos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoMovimiento)
        });
    } catch (e) {
        console.error('Error al registrar movimiento automático:', e);
    }
}


// ==========================================
// GESTIÓN Y BÚSQUEDA DE INVENTARIO
// ==========================================
let listaInventarioGlobal = [];
let modoEliminacionActivo = false;

async function cargarInventario() {
    try {
        const respuesta = await fetch(`${API_URL}/inventario`);
        listaInventarioGlobal = await respuesta.json();
        const searchInput = document.getElementById('searchInventarioInput');
        if (searchInput) {
            searchInput.removeEventListener('input', filtrarInventario);
            searchInput.addEventListener('input', filtrarInventario);
        }
        renderizarTablaInventario(listaInventarioGlobal);
    } catch (error) { console.error('Error al cargar inventario:', error); }
}

function ordenarInventarioPorSKU(productos) {
    return productos.sort((a, b) => {
        let skuA = String(a.id || '').replace('#', '').trim();
        let skuB = String(b.id || '').replace('#', '').trim();
        return skuA.localeCompare(skuB, 'es', { numeric: true, sensitivity: 'base' });
    });
}

function renderizarTablaInventario(productos) {
    const tbody = document.getElementById('tabla-inventario-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (productos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px;">No se encontraron productos.</td></tr>`;
        return;
    }

    const productosOrdenados = ordenarInventarioPorSKU([...productos]);
    const isAdmin = esAdministradorOEquivalente();

    productosOrdenados.forEach(prod => {
        const stockActual = Number(prod.stock) || 0;
        const stockMinimo = Number(prod.stockMinimo) || 5;
        const esCritico = stockActual <= stockMinimo;

        let accionesCelda = '';
        if (!isAdmin) {
            accionesCelda = `<span style="color: #ff6b6b; font-weight: 700; font-size: 0.9rem;">No eres Administrador</span>`;
        } else if (modoEliminacionActivo) {
            accionesCelda = `<i class="fa-solid fa-trash action-icon text-danger" onclick="eliminarProducto('${prod.id}', '${prod.nombre}', ${stockActual})" title="Borrar producto individual"></i>`;
        } else {
            accionesCelda = `
                <i class="fa-solid fa-minus action-icon text-danger" onclick="modificarStock('${prod.id}', -1)" title="Restar stock"></i>
                <i class="fa-solid fa-plus action-icon" onclick="modificarStock('${prod.id}', 1)" title="Sumar stock"></i>
            `;
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${esCritico ? '<i class="fa-solid fa-triangle-exclamation text-danger" title="Stock Crítico"></i> ' : ''}#${String(prod.id).replace('#','')}</td>
            <td><strong>${prod.nombre}</strong></td>
            <td>${stockActual}</td>
            <td>${stockMinimo}</td>
            <td class="actions-cell">${accionesCelda}</td>
        `;
        tbody.appendChild(tr);
    });
}

function filtrarInventario() {
    const texto = document.getElementById('searchInventarioInput').value.toLowerCase().trim();
    const filtrados = listaInventarioGlobal.filter(p => String(p.id).toLowerCase().includes(texto) || String(p.nombre).toLowerCase().includes(texto));
    renderizarTablaInventario(filtrados);
}

function alternarModoBorrado() {
    if (!esAdministradorOEquivalente()) {
        alert("No eres Administrador");
        return;
    }
    modoEliminacionActivo = !modoEliminacionActivo;
    const textoSpan = document.getElementById('textoBtnSacar');
    if (textoSpan) {
        textoSpan.textContent = modoEliminacionActivo ? "Cancelar Borrado" : "Sacar Producto (Eliminar)";
    }
    renderizarTablaInventario(listaInventarioGlobal);
}

function togglePanelIngresarProducto() {
    if (!esAdministradorOEquivalente()) {
        alert("No eres Administrador");
        return;
    }
    const panel = document.getElementById('panel-ingresar-producto');
    if (!panel) return;
    panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
}

async function eliminarProducto(idProducto, nombreProd, stockActual) {
    if (!esAdministradorOEquivalente()) {
        alert("No eres Administrador");
        return;
    }
    if (confirm(`¿Estás seguro de eliminar el producto "${nombreProd}" (ID: #${idProducto}) del inventario?`)) {
        try {
            const respuesta = await fetch(`${API_URL}/inventario/${idProducto}`, { method: 'DELETE' });
            if (respuesta.ok) {
                if (stockActual > 0) {
                    await registrarMovimiento("Salida", nombreProd, idProducto, stockActual);
                }
                alert('Producto eliminado correctamente.');
                await cargarInventario();
            } else {
                alert('Error al eliminar el producto.');
            }
        } catch (error) { console.error('Error al eliminar producto:', error); }
    }
}

async function guardarNuevoProducto(event) {
    event.preventDefault();
    if (!esAdministradorOEquivalente()) {
        alert("No eres Administrador");
        return;
    }
    const nombre = document.getElementById('nuevoNombreProd').value.trim();
    const stock = Number(document.getElementById('nuevoStockProd').value) || 0;
    const stockMinimo = Number(document.getElementById('nuevoStockMin').value) || 5;

    const nuevoIdConSimbolo = generarSiguienteSKU(listaInventarioGlobal);
    const nuevoIdLimpio = nuevoIdConSimbolo.replace('#', '');

    const nuevoProducto = {
        id: nuevoIdLimpio,
        nombre: nombre,
        stock: stock,
        stockMinimo: stockMinimo
    };

    try {
        const respuesta = await fetch(`${API_URL}/inventario`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoProducto)
        });

        if (respuesta.ok) {
            if (stock > 0) {
                await registrarMovimiento("Entrada", nombre, nuevoIdLimpio, stock);
            }

            alert('¡Producto ingresado exitosamente!');
            togglePanelIngresarProducto();
            document.getElementById('nuevoNombreProd').value = '';
            document.getElementById('nuevoStockProd').value = '1';
            document.getElementById('nuevoStockMin').value = '5';
            await cargarInventario();
        }
    } catch (error) { console.error('Error al guardar nuevo producto:', error); }
}

async function modificarStock(idProducto, cambio) {
    if (!esAdministradorOEquivalente()) {
        alert("No eres Administrador");
        return;
    }
    const prod = listaInventarioGlobal.find(p => String(p.id) === String(idProducto));
    if (!prod) return;

    let stockAnterior = Number(prod.stock) || 0;
    let nuevoStock = stockAnterior + cambio;
    if (nuevoStock < 0) nuevoStock = 0;

    let cantidadEfectiva = Math.abs(nuevoStock - stockAnterior);
    if (cantidadEfectiva === 0) return;

    let tipoMovimiento = cambio > 0 ? "Entrada" : "Salida";

    try {
        await fetch(`${API_URL}/inventario/${idProducto}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stock: nuevoStock })
        });

        await registrarMovimiento(tipoMovimiento, prod.nombre, idProducto, cantidadEfectiva);

        await cargarInventario();
    } catch (e) { console.error('Error al modificar stock:', e); }
}


// ==========================================
// GESTIÓN DE STOCK Y KPIS
// ==========================================
let listaStockGlobal = [];

async function cargarStockDashboard() {
    try {
        const respuesta = await fetch(`${API_URL}/inventario`);
        listaStockGlobal = await respuesta.json();

        const searchStockInput = document.getElementById('searchStockInput');
        if (searchStockInput) {
            searchStockInput.removeEventListener('input', filtrarStockDashboard);
            searchStockInput.addEventListener('input', filtrarStockDashboard);
        }

        renderizarStockDashboard(listaStockGlobal);

    } catch (e) { console.error(e); }
}

function renderizarStockDashboard(inventario) {
    inventario.sort((a, b) => {
        let skuA = String(a.id || '').replace('#', '').trim();
        let skuB = String(b.id || '').replace('#', '').trim();
        return skuA.localeCompare(skuB, 'es', { numeric: true, sensitivity: 'base' });
    });

    const tbody = document.getElementById('tabla-stock-body');
    const kpiCritical = document.getElementById('kpiCritical');
    const kpiTotal = document.getElementById('kpiTotal');
    const kpiZero = document.getElementById('kpiZero');

    let totalProductos = listaStockGlobal.length;
    let stockCriticoCount = 0;
    let inexistentesCount = 0;

    listaStockGlobal.forEach(prod => {
        const stockActual = Number(prod.stock) || 0;
        const stockMinimo = Number(prod.stockMinimo) || 5;
        if (stockActual <= stockMinimo) stockCriticoCount++;
        if (stockActual === 0) inexistentesCount++;
    });

    if (kpiCritical) kpiCritical.textContent = stockCriticoCount;
    if (kpiTotal) kpiTotal.textContent = totalProductos;
    if (kpiZero) kpiZero.textContent = inexistentesCount;

    if (tbody) {
        tbody.innerHTML = '';
        if (inventario.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 20px;">No se encontraron productos coincidentes.</td></tr>`;
            return;
        }

        inventario.forEach(prod => {
            const stockActual = Number(prod.stock) || 0;
            const stockMinimo = Number(prod.stockMinimo) || 5;
            const esCritico = stockActual <= stockMinimo;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${esCritico ? '<i class="fa-solid fa-triangle-exclamation text-danger"></i> ' : ''}#${prod.id}</td>
                <td><strong>${prod.nombre}</strong></td>
                <td>${stockActual}</td>
                <td>${stockMinimo}</td>
            `;
            tbody.appendChild(tr);
        });
    }
}

function filtrarStockDashboard() {
    const texto = document.getElementById('searchStockInput').value.toLowerCase().trim();
    const filtrados = listaStockGlobal.filter(prod => 
        String(prod.id).toLowerCase().includes(texto) ||
        String(prod.nombre).toLowerCase().includes(texto)
    );
    renderizarStockDashboard(filtrados);
}


// ==========================================
// GESTIÓN DE MOVIMIENTOS
// ==========================================
let listaMovimientosGlobal = [];

async function cargarMovimientos() {
    try {
        const respuesta = await fetch(`${API_URL}/movimientos`);
        listaMovimientosGlobal = await respuesta.json();

        const searchMovInput = document.getElementById('searchMovimientosInput');
        if (searchMovInput) {
            searchMovInput.removeEventListener('input', filtrarMovimientos);
            searchMovInput.addEventListener('input', filtrarMovimientos);
        }

        renderizarTablaMovimientos(listaMovimientosGlobal);
    } catch (e) { console.error('Error al cargar movimientos:', e); }
}

function renderizarTablaMovimientos(movimientos) {
    const tbody = document.getElementById('tabla-movimientos-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (movimientos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px;">No se encontraron movimientos registrados.</td></tr>`;
        return;
    }

    movimientos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    movimientos.forEach(m => {
        const esEntrada = (m.tipo || '').toLowerCase() === 'entrada';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${m.fecha}</td>
            <td><span class="${esEntrada ? 'badge-success' : 'badge-danger'}">${m.tipo}</span></td>
            <td><strong>${m.producto}</strong></td>
            <td>${m.sku}</td>
            <td>${m.cantidad}</td>
        `;
        tbody.appendChild(tr);
    });
}

function filtrarMovimientos() {
    const texto = document.getElementById('searchMovimientosInput').value.toLowerCase().trim();
    const filtrados = listaMovimientosGlobal.filter(m => 
        String(m.producto).toLowerCase().includes(texto) ||
        String(m.sku).toLowerCase().includes(texto) ||
        String(m.tipo).toLowerCase().includes(texto)
    );
    renderizarTablaMovimientos(filtrados);
}
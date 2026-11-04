document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Menú Móvil Responsivo
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    // ==========================================
// 2. VALIDACIÓN Y CONEXIÓN DEL LOGIN
// ==========================================
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        
        // Usamos los IDs reales que están en tu index.html
        const usuarioInput = document.getElementById('loginUsuario').value.trim();
        const passwordInput = document.getElementById('loginPassword').value.trim();
        const errorDiv = document.getElementById('errorMensaje');

        if (usuarioInput === '' || passwordInput === '') {
            if (errorDiv) {
                errorDiv.textContent = 'Por favor completa todos los campos.';
                errorDiv.style.display = 'block';
            }
            return;
        }

        try {
            const respuesta = await fetch(`${API_URL}/usuarios`);
            const usuarios = await respuesta.json();
            
            // Buscamos coincidencia por nombre o por ID
            const usuarioEncontrado = usuarios.find(u => 
                (u.nombre && u.nombre.toLowerCase() === usuarioInput.toLowerCase()) || 
                (u.id && u.id.toLowerCase() === usuarioInput.toLowerCase())
            );

            if (usuarioEncontrado) {
                // Verificamos la contraseña
                if (!usuarioEncontrado.password || usuarioEncontrado.password === passwordInput) {
                    localStorage.setItem('usuarioLogueado', JSON.stringify(usuarioEncontrado));
                    
                    // Opcional: mostrar alerta de éxito antes de redirigir
                    if (errorDiv) errorDiv.style.display = 'none';
                    
                    window.location.href = 'stock.html'; // O dashboard.html según prefieras
                    return;
                }
            }

            // Si falla el usuario o la contraseña
            if (errorDiv) {
                errorDiv.textContent = 'Usuario no registrado o contraseña incorrecta.';
                errorDiv.style.display = 'block';
            }

        } catch (error) {
            console.error('Error al conectar con la API:', error);
            if (errorDiv) {
                errorDiv.textContent = 'Error de conexión con el servidor.';
                errorDiv.style.display = 'block';
            }
        }
    });
}
    // 3. Notificación flotante de respuesta
    function mostrarAlerta(mensaje, tipo) {
        let alertBox = document.querySelector('.alert-msg');
        if (!alertBox) {
            alertBox = document.createElement('div');
            alertBox.className = 'alert-msg';
            document.body.appendChild(alertBox);
        }

        alertBox.textContent = mensaje;
        alertBox.style.position = 'fixed';
        alertBox.style.bottom = '20px';
        alertBox.style.right = '20px';
        alertBox.style.padding = '12px 20px';
        alertBox.style.borderRadius = '8px';
        alertBox.style.color = '#fff';
        alertBox.style.fontWeight = 'bold';
        alertBox.style.zIndex = '2000';
        alertBox.style.backgroundColor = tipo === 'exito' ? '#22C55E' : '#EF4444';

        setTimeout(() => {
            alertBox.remove();
        }, 3000);
    }
});
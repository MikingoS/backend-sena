document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Menú Móvil Responsivo
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    // 2. Validación del Formulario de Login
    const loginForm = document.querySelector('#loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.querySelector('#username').value.trim();
            const password = document.querySelector('#password').value.trim();

            if (username === '' || password === '') {
                mostrarAlerta('Por favor completa todos los campos.', 'error');
            } else {
                mostrarAlerta('¡Inicio de sesión correcto! Redirigiendo...', 'exito');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1200);
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
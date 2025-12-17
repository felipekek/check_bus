/* ===================================================
   SIDEBAR UNIVERSAL - CHECK BUS
   Funciona com as coleções: alunos, staff, motoristas
   Inclui header com logo automaticamente
   =================================================== */

import { auth, db } from './firebase-config.js';
import { doc, getDoc, collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

// Configuração de páginas
const SIDEBAR_CONFIG = {
    aluno: [
        { icon: 'fa-solid fa-house', label: 'Principal', url: 'home_principal.html' },
        { icon: 'fa-solid fa-clock', label: 'Lista de Horários', url: 'horarios.html' },
        { icon: 'fa-solid fa-location-dot', label: 'GPS', url: 'gps.html' },
        { icon: 'fa-solid fa-bell', label: 'Notificações', url: 'notificacoes.html' },
        { icon: 'fa-solid fa-circle-question', label: 'FAQ', url: 'faq.html' }
    ],
    admin: [
        { icon: 'fa-solid fa-house', label: 'Principal', url: 'home_principal.html' },
        { icon: 'fa-solid fa-users', label: 'Lista de Alunos', url: 'admin.html' },
        { icon: 'fa-solid fa-user-plus', label: 'Cadastrar Motorista', url: 'cadast_motorista.html' },
        { icon: 'fa-solid fa-id-card', label: 'Vincular Cartão', url: 'vincular_cartao.html'},
        { icon: 'fa-solid fa-bus', label: 'Cadastrar Ônibus', url: 'cadastro_onibus.html' },
        { icon: 'fa-solid fa-list', label: 'Gerenciar Motoristas & Ônibus', url: 'onibus_motorista.html' },
        { icon: 'fa-solid fa-calendar-days', label: 'Horários', url: 'adm-lista-de-horarios.html' },
        { icon: 'fa-solid fa-chart-line', label: 'Relatórios', url: 'relatorios.html' },
        { icon: 'fa-solid fa-bullhorn', label: 'Avisos', url: 'avisos.html' },
        { icon: 'fa-solid fa-comments', label: 'Feedbacks', url: 'respostas_feedback.html' }
    ],
    motorista: [
        { icon: 'fa-solid fa-gauge-high', label: 'Painel', url: 'painel_motorista.html' },
        { icon: 'fa-solid fa-location-dot', label: 'GPS', url: 'gps_motorista.html' }
    ]
};

/**
 * Gera a sidebar dinamicamente COM HEADER
 */
function gerarSidebar(userProfile) {
    console.log('🎨 [SIDEBAR] Gerando para perfil:', userProfile);
    
    if (!userProfile || !SIDEBAR_CONFIG[userProfile]) {
        console.error('❌ [SIDEBAR] Perfil inválido:', userProfile);
        return '';
    }

    const pages = SIDEBAR_CONFIG[userProfile];
    const currentPage = window.location.pathname.split('/').pop();
    
    // NOVO: Inclui header com logo do Check Bus
    let sidebarHTML = `
        <div class="sidebar" id="sidebar">
            <div class="sidebar-header">
                <i class="fas fa-bus"></i>
                <h3>Check Bus</h3>
            </div>
    `;
    
    pages.forEach(page => {
        const isActive = currentPage === page.url ? 'active' : '';
        sidebarHTML += `
            <button onclick="location.href='${page.url}'" class="${isActive}">
                <i class="${page.icon}"></i> ${page.label}
            </button>
        `;
    });
    
    sidebarHTML += `
            <button onclick="location.href='index.html'" class="logout">
                <i class="fa-solid fa-right-from-bracket"></i> Sair
            </button>
        </div>
    `;
    
    return sidebarHTML;
}

/**
 * Gera o HTML completo da sidebar (botão + overlay + sidebar)
 */
function gerarSidebarCompleta(userProfile) {
    const sidebarContent = gerarSidebar(userProfile);
    
    return `
        <!-- Botão do Menu -->
        <button class="menu-btn" id="menuBtn">
            <i class="fas fa-bars"></i>
        </button>
        
        <!-- Overlay -->
        <div class="overlay" id="overlay"></div>
        
        <!-- Sidebar -->
        ${sidebarContent}
    `;
}

/**
 * Detecta o perfil do usuário nas coleções corretas do Check Bus
 */
async function detectarPerfilUsuario() {
    try {
        const user = auth.currentUser;
        
        if (!user) {
            console.warn('⚠️ [SIDEBAR] Usuário não autenticado');
            return null;
        }
        
        console.log('🔍 [SIDEBAR] Buscando perfil do usuário:', user.uid);
        console.log('📧 [SIDEBAR] Email:', user.email);
        
        // 1. Verificar se é admin pelo email
        if (user.email === 'staff@adm.com') {
            console.log('✅ [SIDEBAR] Admin identificado por email');
            return 'admin';
        }
        
        // 2. Buscar na coleção staff por email
        const staffQuery = query(
            collection(db, 'staff'),
            where('email', '==', user.email)
        );
        const staffSnap = await getDocs(staffQuery);
        
        if (!staffSnap.empty) {
            console.log('✅ [SIDEBAR] Admin encontrado na coleção staff');
            return 'admin';
        }
        
        // 3. Buscar na coleção motoristas
        const motoristaDoc = await getDoc(doc(db, 'motoristas', user.uid));
        if (motoristaDoc.exists()) {
            console.log('✅ [SIDEBAR] Motorista encontrado');
            return 'motorista';
        }
        
        // 4. Buscar na coleção alunos
        const alunoDoc = await getDoc(doc(db, 'alunos', user.uid));
        if (alunoDoc.exists()) {
            console.log('✅ [SIDEBAR] Aluno encontrado');
            return 'aluno';
        }
        
        // 5. Se não encontrou em nenhuma coleção, assumir aluno
        console.warn('⚠️ [SIDEBAR] Usuário não encontrado em nenhuma coleção, usando padrão: aluno');
        return 'aluno';
        
    } catch (error) {
        console.error('❌ [SIDEBAR] Erro ao detectar perfil:', error);
        return 'aluno';
    }
}

/**
 * Inicializa a sidebar com detecção automática
 */
async function inicializarSidebar() {
    try {
        console.log('🚀 [SIDEBAR] Inicializando...');
        
        // Aguardar autenticação
        await new Promise((resolve) => {
            const unsubscribe = auth.onAuthStateChanged((user) => {
                unsubscribe();
                resolve(user);
            });
        });
        
        // Detectar perfil
        const userProfile = await detectarPerfilUsuario();
        
        if (!userProfile) {
            console.error('❌ [SIDEBAR] Não foi possível determinar o perfil');
            window.location.href = 'index.html';
            return;
        }
        
        // Gerar sidebar completa (botão + overlay + sidebar)
        const sidebarHTML = gerarSidebarCompleta(userProfile);
        
        // Inserir no DOM
        const sidebarContainer = document.getElementById('sidebar-container');
        if (sidebarContainer) {
            sidebarContainer.innerHTML = sidebarHTML;
            
            // Configurar eventos de toggle
            configurarEventosSidebar();
            
            console.log('✅ [SIDEBAR] Inicializada com sucesso para perfil:', userProfile);
        } else {
            console.error('❌ [SIDEBAR] Container #sidebar-container não encontrado');
        }
        
    } catch (error) {
        console.error('❌ [SIDEBAR] Erro ao inicializar:', error);
    }
}

/**
 * Configura os eventos de abrir/fechar a sidebar
 */
function configurarEventosSidebar() {
    const menuBtn = document.getElementById('menuBtn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    
    if (menuBtn && sidebar && overlay) {
        // Abrir sidebar
        menuBtn.addEventListener('click', () => {
            sidebar.classList.add('active');
            overlay.classList.add('active');
            menuBtn.classList.add('hidden');
        });
        
        // Fechar sidebar ao clicar no overlay
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            menuBtn.classList.remove('hidden');
        });
        
        // Fechar sidebar com tecla ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
                menuBtn.classList.remove('hidden');
            }
        });
    }
}

/**
 * Inicializa com perfil manual
 */
function inicializarSidebarManual(profile) {
    console.log('🚀 [SIDEBAR] Inicializando manualmente com perfil:', profile);
    
    const sidebarHTML = gerarSidebarCompleta(profile);
    const sidebarContainer = document.getElementById('sidebar-container');
    
    if (sidebarContainer) {
        sidebarContainer.innerHTML = sidebarHTML;
        configurarEventosSidebar();
        console.log('✅ [SIDEBAR] Inicializada manualmente');
    } else {
        console.error('❌ [SIDEBAR] Container não encontrado');
    }
}

// Exportar
export {
    gerarSidebar,
    gerarSidebarCompleta,
    detectarPerfilUsuario,
    inicializarSidebar,
    inicializarSidebarManual,
    configurarEventosSidebar,
    SIDEBAR_CONFIG
};
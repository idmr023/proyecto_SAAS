-- =============================================
-- SaaS Orchestrator - Datos de Semilla
-- PostgreSQL
-- =============================================
-- Contraseña de todos los usuarios: 123456
-- Hash bcrypt de "123456": $2a$10$...

-- =============================================
-- USUARIOS
-- =============================================

-- Admin del sistema
INSERT INTO "Admin" (id, email, "passwordHash", nombre)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'admin@demo.com',
    '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGmD7GVqZm0v4w2F0n6Oe',
    'Admin Demo'
);

-- Colaborador de soporte
INSERT INTO "Colaborador" (id, email, "passwordHash", nombre, activo)
VALUES (
    'c0000000-0000-0000-0000-000000000001',
    'colab@demo.com',
    '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGmD7GVqZm0v4w2F0n6Oe',
    'Colaborador Demo',
    TRUE
);

-- =============================================
-- EMPRESAS
-- =============================================

INSERT INTO "MypeEmpresa" (id, "adminId", nombre, rubro, subdominio, estado)
VALUES
    ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'TecnoMype SAC',        'Tecnología',  'tecno-mype',   'activa'),
    ('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Restobar 34',          'Restaurante', 'restobar-34',  'activa'),
    ('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Moda Express',         'Ventas',      'modaexpress',  'detenida');

-- =============================================
-- MÓDULOS POR EMPRESA
-- =============================================

INSERT INTO "ConfiguracionModulos" ("empresaId", modulo, activo)
VALUES
    ('e0000000-0000-0000-0000-000000000001', 'inventarios', TRUE),
    ('e0000000-0000-0000-0000-000000000001', 'ventas',      TRUE),
    ('e0000000-0000-0000-0000-000000000002', 'restaurantes', TRUE),
    ('e0000000-0000-0000-0000-000000000002', 'inventarios',  TRUE),
    ('e0000000-0000-0000-0000-000000000003', 'ventas',       TRUE);

-- =============================================
-- SOLICITUDES DE SISTEMA (Tickets tipo "Solicitar Sistema")
-- =============================================
-- Estos son los registros que se crean cuando un cliente
-- llena el formulario "Solicitar Sistema" desde la landing page.

INSERT INTO "Ticket" (id, cliente, email, descripcion, estado, "createdAt")
VALUES
    -- Solicitud 1: Cliente nuevo pidiendo un sistema completo
    (
        't0000000-0000-0000-0000-000000000001',
        'María García',
        'maria@bodega.com',
        'Solicitud de sistema - Bodega Don José
Rubro: Bodega
Módulos: inventarios, ventas

Necesito un sistema para mi bodega de barrio que me permita llevar el control de inventario y las ventas del día. Actualmente hago todo en cuaderno y se me pierden productos.',
        'pendiente',
        NOW() - INTERVAL '2 days'
    ),
    -- Solicitud 2: Cliente existente pidiendo módulo adicional
    (
        't0000000-0000-0000-0000-000000000002',
        'Carlos López',
        'carlos@restobar.com',
        'Solicitud de sistema - Restobar 34
Rubro: Restaurante
Módulos: restaurantes, inventarios

Ya tengo el sistema de comandas pero necesito tambien el modulo de inventarios para controlar mi stock de bebidas y alimentos.',
        'en_proceso',
        NOW() - INTERVAL '5 days'
    ),
    -- Solicitud 3: Nueva solicitud de sistema desde la landing
    (
        't0000000-0000-0000-0000-000000000003',
        'Ana Torres',
        'ana@textiles.com',
        'Solicitud de sistema - Textiles Los Andes
Rubro: Textil
Módulos: produccion, logistica, ventas

Somos un taller textil y necesitamos un sistema que nos ayude a gestionar la produccion, la materia prima y las ventas a nuestros clientes.',
        'resuelto',
        NOW() - INTERVAL '10 days'
    ),
    -- Solicitud 4: Solicitud rápida sin especificar módulos
    (
        't0000000-0000-0000-0000-000000000004',
        'Pedro Sánchez',
        'pedro@ferreteria.com',
        'Solicitud de sistema - Ferretería El Tornillo
Rubro: Ventas
Módulos: inventarios

Hola, quiero un sistema para mi ferretería. Necesito controlar el inventario y las ventas. No sé bien qué módulos necesito, quisiera que me asesoren.',
        'pendiente',
        NOW() - INTERVAL '1 day'
    );

-- =============================================
-- TICKETS DE SOPORTE (para empresas ya existentes)
-- =============================================

INSERT INTO "Ticket" (id, "empresaId", cliente, email, descripcion, estado, "asignadoAId", "asignadoPor")
VALUES
    (
        't0000000-0000-0000-0000-000000000010',
        'e0000000-0000-0000-0000-000000000001',
        'Juan Pérez',
        'juan@tecno.com',
        'Error al cargar el inventario de productos. La página se queda cargando y nunca muestra la lista.',
        'pendiente',
        NULL,
        NULL
    ),
    (
        't0000000-0000-0000-0000-000000000011',
        'e0000000-0000-0000-0000-000000000002',
        'María García',
        'maria@restobar.com',
        'La comanda no imprime en cocina. Ya revisamos la impresora y tiene papel, el problema debe ser del sistema.',
        'en_proceso',
        'c0000000-0000-0000-0000-000000000001',
        'Admin Demo'
    );

-- =============================================
-- ACTUALIZACIÓN DE ESTADOS
-- =============================================

-- Asignar solicitud de sistema #2 al colab y solicitud #3 también como resuelta por el colab
UPDATE "Ticket" SET "asignadoAId" = 'c0000000-0000-0000-0000-000000000001', "asignadoPor" = 'Admin Demo'
WHERE id = 't0000000-0000-0000-0000-000000000002';

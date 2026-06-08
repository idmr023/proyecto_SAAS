-- =============================================
-- SaaS Orchestrator - Esquema de Base de Datos
-- PostgreSQL
-- =============================================

-- Extensión para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLAS DEL SISTEMA
-- =============================================

-- Administradores del sistema
CREATE TABLE "Admin" (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email       VARCHAR(255) NOT NULL UNIQUE,
    passwordHash TEXT NOT NULL,
    nombre      VARCHAR(255) NOT NULL,
    createdAt   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updatedAt   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Colaboradores (soporte técnico / desarrolladores)
CREATE TABLE "Colaborador" (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email       VARCHAR(255) NOT NULL UNIQUE,
    passwordHash TEXT NOT NULL,
    nombre      VARCHAR(255) NOT NULL,
    activo      BOOLEAN DEFAULT TRUE,
    createdAt   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updatedAt   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Empresas registradas (clientes Mype)
CREATE TABLE "MypeEmpresa" (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    adminId     UUID NOT NULL REFERENCES "Admin"(id) ON DELETE CASCADE,
    nombre      VARCHAR(255) NOT NULL,
    rubro       VARCHAR(100) NOT NULL,
    subdominio  VARCHAR(255) NOT NULL UNIQUE,
    estado      VARCHAR(50) DEFAULT 'activa',
    createdAt   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updatedAt   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Configuración de módulos por empresa
CREATE TABLE "ConfiguracionModulos" (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresaId   UUID NOT NULL REFERENCES "MypeEmpresa"(id) ON DELETE CASCADE,
    modulo      VARCHAR(100) NOT NULL,
    activo      BOOLEAN DEFAULT FALSE,
    config      JSONB,
    createdAt   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updatedAt   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(empresaId, modulo)
);

-- Logs de contenedores Docker por empresa
CREATE TABLE "ContenedorLog" (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresaId   UUID NOT NULL REFERENCES "MypeEmpresa"(id) ON DELETE CASCADE,
    contenedorId VARCHAR(255),
    imagen      VARCHAR(255) NOT NULL,
    puerto      INTEGER,
    estado      VARCHAR(50) NOT NULL,
    mensaje     TEXT,
    createdAt   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updatedAt   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tickets / Solicitudes (soporte + solicitudes de sistema)
CREATE TABLE "Ticket" (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresaId   UUID REFERENCES "MypeEmpresa"(id) ON DELETE SET NULL,
    cliente     VARCHAR(255) NOT NULL,
    email       VARCHAR(255),
    telefono    VARCHAR(50),
    descripcion TEXT NOT NULL,
    estado      VARCHAR(50) DEFAULT 'pendiente',
    asignadoAId UUID REFERENCES "Colaborador"(id) ON DELETE SET NULL,
    asignadoPor VARCHAR(255),
    createdAt   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updatedAt   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auditoría de acciones
CREATE TABLE "AuditLog" (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    adminId     UUID REFERENCES "Admin"(id) ON DELETE SET NULL,
    accion      VARCHAR(100) NOT NULL,
    entidad     VARCHAR(100) NOT NULL,
    entidadId   VARCHAR(255),
    detalle     TEXT,
    ip          VARCHAR(50),
    createdAt   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ÍNDICES
-- =============================================
CREATE INDEX idx_mype_admin ON "MypeEmpresa"(adminId);
CREATE INDEX idx_config_empresa ON "ConfiguracionModulos"(empresaId);
CREATE INDEX idx_ticket_estado ON "Ticket"(estado);
CREATE INDEX idx_ticket_empresa ON "Ticket"(empresaId);
CREATE INDEX idx_ticket_asignado ON "Ticket"(asignadoAId);
CREATE INDEX idx_audit_admin ON "AuditLog"(adminId);
CREATE INDEX idx_audit_fecha ON "AuditLog"(createdAt);
CREATE INDEX idx_contenedor_empresa ON "ContenedorLog"(empresaId);

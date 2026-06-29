-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE IF NOT EXISTS "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "totpSecret" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Colaborador" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Colaborador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "MypeEmpresa" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rubro" TEXT NOT NULL,
    "subdominio" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'activa',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MypeEmpresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ConfiguracionModulos" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "modulo" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT false,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConfiguracionModulos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ContenedorLog" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "contenedorId" TEXT,
    "imagen" TEXT NOT NULL,
    "puerto" INTEGER,
    "estado" TEXT NOT NULL,
    "mensaje" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContenedorLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Ticket" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT,
    "cliente" TEXT NOT NULL,
    "email" TEXT,
    "telefono" TEXT,
    "descripcion" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "asignadoAId" TEXT,
    "asignadoPor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" TEXT NOT NULL,
    "adminId" TEXT,
    "accion" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidadId" TEXT,
    "detalle" TEXT,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "LockoutAttempt" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "lastAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LockoutAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Admin_email_key" ON "Admin"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "Colaborador_email_key" ON "Colaborador"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "MypeEmpresa_subdominio_key" ON "MypeEmpresa"("subdominio");
CREATE UNIQUE INDEX IF NOT EXISTS "ConfiguracionModulos_empresaId_modulo_key" ON "ConfiguracionModulos"("empresaId", "modulo");
CREATE UNIQUE INDEX IF NOT EXISTS "LockoutAttempt_identifier_key" ON "LockoutAttempt"("identifier");

-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MypeEmpresa_adminId_fkey') THEN
        ALTER TABLE "MypeEmpresa" ADD CONSTRAINT "MypeEmpresa_adminId_fkey"
            FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ConfiguracionModulos_empresaId_fkey') THEN
        ALTER TABLE "ConfiguracionModulos" ADD CONSTRAINT "ConfiguracionModulos_empresaId_fkey"
            FOREIGN KEY ("empresaId") REFERENCES "MypeEmpresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ContenedorLog_empresaId_fkey') THEN
        ALTER TABLE "ContenedorLog" ADD CONSTRAINT "ContenedorLog_empresaId_fkey"
            FOREIGN KEY ("empresaId") REFERENCES "MypeEmpresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Ticket_empresaId_fkey') THEN
        ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_empresaId_fkey"
            FOREIGN KEY ("empresaId") REFERENCES "MypeEmpresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Ticket_asignadoAId_fkey') THEN
        ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_asignadoAId_fkey"
            FOREIGN KEY ("asignadoAId") REFERENCES "Colaborador"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AuditLog_adminId_fkey') THEN
        ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_adminId_fkey"
            FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- ============================================
-- Seed: Admin + Colaborador
-- ============================================

INSERT INTO "Admin" ("id", "email", "passwordHash", "nombre")
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'admin@saas.com',
    '$2b$12$f1ZMj3Z8KiBrpmYdSlCY7.uo8XftSbFkb.0SODfoGGxi.vULQ2Wg2',
    'Administrador'
)
ON CONFLICT ("email") DO NOTHING;

INSERT INTO "Colaborador" ("id", "email", "passwordHash", "nombre", "activo")
VALUES (
    'c0000000-0000-0000-0000-000000000001',
    'colab@saas.com',
    '$2b$12$SD7v6T5tg8U8GSkeg8mGL.ms/APSQHeH0VHnn9jJjF9dChWEB8Ska',
    'Colaborador Uno',
    true
)
ON CONFLICT ("email") DO NOTHING;

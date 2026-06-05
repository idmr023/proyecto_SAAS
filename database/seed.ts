import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("=== SEED COMPLETO ===")

  const hash = await bcrypt.hash("123456", 10)

  // ─── ADMIN ───
  const admin = await prisma.admin.upsert({
    where: { email: "admin@demo.com" },
    update: {},
    create: { email: "admin@demo.com", passwordHash: hash, nombre: "Admin Demo" },
  })
  console.log(`  ✓ Admin: ${admin.email}`)

  // ─── COLABORADOR ───
  const colab = await prisma.colaborador.upsert({
    where: { email: "colab@demo.com" },
    update: {},
    create: { email: "colab@demo.com", passwordHash: hash, nombre: "Colaborador Demo", activo: true },
  })
  console.log(`  ✓ Colaborador: ${colab.email}`)

  // ─── EMPRESAS ───
  const e1 = await prisma.mypeEmpresa.upsert({
    where: { subdominio: "tecno-mype" },
    update: {},
    create: { adminId: admin.id, nombre: "TecnoMype SAC", rubro: "Tecnología", subdominio: "tecno-mype", estado: "activa" },
  })
  const e2 = await prisma.mypeEmpresa.upsert({
    where: { subdominio: "restobar-34" },
    update: {},
    create: { adminId: admin.id, nombre: "Restobar 34", rubro: "Restaurante", subdominio: "restobar-34", estado: "activa" },
  })
  const e3 = await prisma.mypeEmpresa.upsert({
    where: { subdominio: "modaexpress" },
    update: {},
    create: { adminId: admin.id, nombre: "Moda Express", rubro: "Ventas", subdominio: "modaexpress", estado: "detenida" },
  })
  console.log(`  ✓ Empresas: ${e1.nombre}, ${e2.nombre}, ${e3.nombre}`)

  // ─── MÓDULOS ───
  await prisma.configuracionModulos.createMany({
    data: [
      { empresaId: e1.id, modulo: "inventarios", activo: true },
      { empresaId: e1.id, modulo: "ventas", activo: true },
      { empresaId: e2.id, modulo: "restaurantes", activo: true },
      { empresaId: e2.id, modulo: "inventarios", activo: true },
      { empresaId: e3.id, modulo: "ventas", activo: true },
    ],
    skipDuplicates: true,
  })
  console.log("  ✓ Módulos configurados")

  // ─── SOLICITUDES DE SISTEMA (desde el formulario "Solicitar Sistema") ───
  await prisma.ticket.createMany({
    data: [
      {
        cliente: "María García",
        email: "maria@bodega.com",
        descripcion: `Solicitud de sistema - Bodega Don José\nRubro: Bodega\nMódulos: inventarios, ventas\n\nNecesito un sistema para mi bodega de barrio que me permita llevar el control de inventario y las ventas del día. Actualmente hago todo en cuaderno.`,
        estado: "pendiente",
        createdAt: new Date(Date.now() - 2 * 86400000),
      },
      {
        cliente: "Carlos López",
        email: "carlos@restobar.com",
        descripcion: `Solicitud de sistema - Restobar 34\nRubro: Restaurante\nMódulos: restaurantes, inventarios\n\nYa tengo el sistema de comandas pero necesito también el módulo de inventarios para controlar mi stock.`,
        estado: "en_proceso",
        asignadoAId: colab.id,
        asignadoPor: admin.nombre,
        createdAt: new Date(Date.now() - 5 * 86400000),
      },
      {
        cliente: "Ana Torres",
        email: "ana@textiles.com",
        descripcion: `Solicitud de sistema - Textiles Los Andes\nRubro: Textil\nMódulos: produccion, logistica, ventas\n\nSomos un taller textil y necesitamos un sistema que nos ayude a gestionar la producción, materia prima y ventas.`,
        estado: "resuelto",
        asignadoAId: colab.id,
        asignadoPor: admin.nombre,
        createdAt: new Date(Date.now() - 10 * 86400000),
      },
      {
        cliente: "Pedro Sánchez",
        email: "pedro@ferreteria.com",
        descripcion: `Solicitud de sistema - Ferretería El Tornillo\nRubro: Ventas\nMódulos: inventarios\n\nQuiero un sistema para mi ferretería. Necesito controlar inventario y ventas. No sé bien qué módulos necesito, quisiera que me asesoren.`,
        estado: "pendiente",
        createdAt: new Date(Date.now() - 1 * 86400000),
      },
    ],
    skipDuplicates: false,
  })
  console.log("  ✓ Solicitudes de sistema creadas (4)")

  // ─── TICKETS DE SOPORTE ───
  await prisma.ticket.createMany({
    data: [
      {
        empresaId: e1.id,
        cliente: "Juan Pérez",
        email: "juan@tecno.com",
        descripcion: "Error al cargar el inventario de productos. La página se queda cargando y nunca muestra la lista.",
        estado: "pendiente",
      },
      {
        empresaId: e2.id,
        cliente: "María García",
        email: "maria@restobar.com",
        descripcion: "La comanda no imprime en cocina. Ya revisamos la impresora y tiene papel, el problema debe ser del sistema.",
        estado: "en_proceso",
        asignadoAId: colab.id,
        asignadoPor: admin.nombre,
      },
    ],
    skipDuplicates: true,
  })
  console.log("  ✓ Tickets de soporte creados (2)")

  console.log("\n=== SEED COMPLETADO EXITOSAMENTE ===")
  console.log("  Admin:       admin@demo.com / 123456")
  console.log("  Colaborador: colab@demo.com / 123456")
}

main()
  .catch((e) => {
    console.error("Error:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

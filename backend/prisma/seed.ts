import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de base de datos...');

  const passwordHash = await bcrypt.hash('123456', 10);

  const admin = await prisma.admin.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      email: 'admin@demo.com',
      passwordHash,
      nombre: 'Admin Demo',
    },
  });
  console.log(`✓ Admin creado: ${admin.email} (${admin.id})`);

  const colab = await prisma.colaborador.upsert({
    where: { email: 'colab@demo.com' },
    update: {},
    create: {
      email: 'colab@demo.com',
      passwordHash,
      nombre: 'Colaborador Demo',
      activo: true,
    },
  });
  console.log(`✓ Colaborador creado: ${colab.email} (${colab.id})`);

  const empresa1 = await prisma.mypeEmpresa.upsert({
    where: { subdominio: 'tecno-mype' },
    update: {},
    create: {
      adminId: admin.id,
      nombre: 'TecnoMype SAC',
      rubro: 'Tecnología',
      subdominio: 'tecno-mype',
      estado: 'activa',
    },
  });
  console.log(`✓ Empresa creada: ${empresa1.nombre}`);

  const empresa2 = await prisma.mypeEmpresa.upsert({
    where: { subdominio: 'restobar-34' },
    update: {},
    create: {
      adminId: admin.id,
      nombre: 'Restobar 34',
      rubro: 'Restaurante',
      subdominio: 'restobar-34',
      estado: 'activa',
    },
  });
  console.log(`✓ Empresa creada: ${empresa2.nombre}`);

  const empresa3 = await prisma.mypeEmpresa.upsert({
    where: { subdominio: 'modaexpress' },
    update: {},
    create: {
      adminId: admin.id,
      nombre: 'Moda Express',
      rubro: 'Ventas',
      subdominio: 'modaexpress',
      estado: 'detenida',
    },
  });
  console.log(`✓ Empresa creada: ${empresa3.nombre}`);

  await prisma.configuracionModulos.createMany({
    data: [
      { empresaId: empresa1.id, modulo: 'inventarios', activo: true },
      { empresaId: empresa1.id, modulo: 'ventas', activo: true },
      { empresaId: empresa2.id, modulo: 'restaurantes', activo: true },
      { empresaId: empresa2.id, modulo: 'inventarios', activo: true },
      { empresaId: empresa3.id, modulo: 'ventas', activo: true },
    ],
    skipDuplicates: true,
  });
  console.log('✓ Módulos configurados');

  // ─── Solicitudes de sistema (desde el formulario "Solicitar Sistema") ───
  await prisma.ticket.createMany({
    data: [
      {
        cliente: 'María García',
        email: 'maria@bodega.com',
        descripcion: 'Solicitud de sistema - Bodega Don José\nRubro: Bodega\nMódulos: inventarios, ventas\n\nNecesito un sistema para mi bodega de barrio que me permita llevar el control de inventario y las ventas del día.',
        estado: 'pendiente',
      },
      {
        cliente: 'Carlos López',
        email: 'carlos@restobar.com',
        descripcion: 'Solicitud de sistema - Restobar 34\nRubro: Restaurante\nMódulos: restaurantes, inventarios\n\nYa tengo el sistema de comandas pero necesito también el módulo de inventarios.',
        estado: 'en_proceso',
        asignadoAId: colab.id,
        asignadoPor: admin.nombre,
      },
      {
        cliente: 'Ana Torres',
        email: 'ana@textiles.com',
        descripcion: 'Solicitud de sistema - Textiles Los Andes\nRubro: Textil\nMódulos: produccion, logistica, ventas\n\nSomos un taller textil y necesitamos un sistema que nos ayude a gestionar la producción.',
        estado: 'resuelto',
        asignadoAId: colab.id,
        asignadoPor: admin.nombre,
      },
      {
        cliente: 'Pedro Sánchez',
        email: 'pedro@ferreteria.com',
        descripcion: 'Solicitud de sistema - Ferretería El Tornillo\nRubro: Ventas\nMódulos: inventarios\n\nQuiero un sistema para mi ferretería. No sé bien qué módulos necesito, quisiera que me asesoren.',
        estado: 'pendiente',
      },
    ],
    skipDuplicates: true,
  });
  console.log('✓ Solicitudes de sistema creadas');

  // ─── Tickets de soporte (empresas existentes) ───
  await prisma.ticket.createMany({
    data: [
      {
        empresaId: empresa1.id,
        cliente: 'Juan Pérez',
        email: 'juan@example.com',
        descripcion: 'Error al cargar el inventario de productos',
        estado: 'pendiente',
      },
      {
        empresaId: empresa2.id,
        cliente: 'María García',
        email: 'maria@example.com',
        descripcion: 'La comanda no imprime en cocina',
        estado: 'en_proceso',
        asignadoAId: colab.id,
        asignadoPor: admin.nombre,
      },
    ],
    skipDuplicates: true,
  });
  console.log('✓ Tickets de soporte creados');

  console.log('✅ Seed completado exitosamente');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { execSync } from 'child_process';
import { env } from '../config/env.js';
import type { ContainerStatus } from '../types/index.js';

interface DockerResult {
  success: boolean;
  containerId?: string;
  port?: number;
  message: string;
}

const AVAILABLE_MODULES = ['landing-page', 'navbar', 'contact', 'login'] as const;
type AvailableModule = (typeof AVAILABLE_MODULES)[number];

interface AssembleOptions {
  empresaId: string;
  subdominio: string;
  modulos: string[];
  brandName?: string;
  apiUrl?: string;
}

const BUILD_DIR = process.env.BUILD_DIR || '/tmp/saas-builds';
const TEMPLATES_DIR = process.env.TEMPLATES_DIR || '/app/templates/base';
const MODULES_DIR = process.env.MODULES_DIR || '/app/modules';

function assembleBuild(options: AssembleOptions): string {
  const { subdominio, modulos, brandName = 'MultiSaas', apiUrl = `http://localhost:${env.PORT}` } = options;
  const buildDir = `${BUILD_DIR}/${subdominio}`;

  execSync(`mkdir -p "${buildDir}/src" "${buildDir}/modules"`, { stdio: 'pipe' });

  execSync(`cp -r "${TEMPLATES_DIR}/." "${buildDir}/"`, { stdio: 'pipe' });

  const validModules = modulos.filter((m): m is AvailableModule => AVAILABLE_MODULES.includes(m as AvailableModule));

  for (const mod of validModules) {
    const modDest = `${buildDir}/modules/${mod}`;
    execSync(`cp -r "${MODULES_DIR}/${mod}" "${buildDir}/modules/"`, { stdio: 'pipe' });
  }

  const envContent = `VITE_API_URL=${apiUrl}\nVITE_BRAND_NAME=${brandName}\n`;
  execSync(`echo '${envContent}' > "${buildDir}/.env"`, { stdio: 'pipe' });

  return buildDir;
}

export function deployContainer(empresaId: string, subdominio: string, modulos: string[], brandName?: string): DockerResult {
  const containerName = `mype-${subdominio}`;
  const imageName = `mype-${subdominio}:latest`;

  try {
    const validModules = modulos.filter((m): m is AvailableModule => AVAILABLE_MODULES.includes(m as AvailableModule));
    if (validModules.length === 0) {
      return {
        success: false,
        message: `No se seleccionaron módulos válidos. Disponibles: ${AVAILABLE_MODULES.join(', ')}`,
      };
    }

    const buildPath = assembleBuild({
      empresaId,
      subdominio,
      modulos: validModules,
      brandName: brandName || 'MultiSaas',
    });

    execSync(`docker build -t "${imageName}" "${buildPath}"`, {
      timeout: 300000,
      stdio: 'pipe',
    });

    const port = 3000 + Math.floor(Math.random() * 60000);

    const labels = validModules.map((m) => `--label "modulo=${m}"`).join(' ');
    const cmd = `docker run -d --name "${containerName}" --network "${env.DOCKER_NETWORK}" -p ${port}:80 ${labels} "${imageName}"`;

    const output = execSync(cmd, { timeout: 60000 }).toString().trim();

    return {
      success: true,
      containerId: output,
      port,
      message: `Contenedor "${containerName}" desplegado en puerto ${port} con módulos: ${validModules.join(', ')}`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Error desplegando contenedor: ${error.message || error}`,
    };
  }
}

export function stopContainer(containerName: string): DockerResult {
  try {
    execSync(`docker stop "${containerName}"`, { timeout: 10000 });
    return { success: true, message: `Contenedor "${containerName}" detenido` };
  } catch (error: any) {
    return { success: false, message: `Error deteniendo contenedor: ${error.message || error}` };
  }
}

export function startContainer(containerName: string): DockerResult {
  try {
    execSync(`docker start "${containerName}"`, { timeout: 10000 });
    return { success: true, message: `Contenedor "${containerName}" iniciado` };
  } catch (error: any) {
    return { success: false, message: `Error iniciando contenedor: ${error.message || error}` };
  }
}

export function restartContainer(containerName: string): DockerResult {
  try {
    execSync(`docker restart "${containerName}"`, { timeout: 10000 });
    return { success: true, message: `Contenedor "${containerName}" reiniciado` };
  } catch (error: any) {
    return { success: false, message: `Error reiniciando contenedor: ${error.message || error}` };
  }
}

export function getContainerStatus(containerName: string): ContainerStatus {
  try {
    const output = execSync(`docker inspect --format='{{.State.Status}}' "${containerName}"`, {
      timeout: 5000,
    })
      .toString()
      .trim();
    if (output === 'running') return 'running';
    if (output === 'exited' || output === 'stopped') return 'stopped';
    return 'error';
  } catch {
    return 'error';
  }
}

export function getContainerLogs(containerName: string, lines: number = 100): string {
  try {
    return execSync(`docker logs --tail ${lines} "${containerName}" 2>&1`, {
      timeout: 5000,
    })
      .toString()
      .trim();
  } catch {
    return 'No se pudieron obtener logs del contenedor.';
  }
}

export function buildMypeImage(subdominio: string, modulos: string[], brandName?: string): DockerResult {
  const imageName = `mype-${subdominio}:latest`;

  try {
    const validModules = modulos.filter((m): m is AvailableModule => AVAILABLE_MODULES.includes(m as AvailableModule));
    if (validModules.length === 0) {
      return {
        success: false,
        message: `No se seleccionaron módulos válidos. Disponibles: ${AVAILABLE_MODULES.join(', ')}`,
      };
    }

    const buildPath = assembleBuild({
      empresaId: subdominio,
      subdominio,
      modulos: validModules,
      brandName: brandName || 'MultiSaas',
    });

    execSync(`docker build -t "${imageName}" "${buildPath}"`, {
      timeout: 300000,
      stdio: 'pipe',
    });

    return {
      success: true,
      message: `Imagen "${imageName}" construida exitosamente con módulos: ${validModules.join(', ')}`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Error construyendo imagen: ${error.message || error}`,
    };
  }
}
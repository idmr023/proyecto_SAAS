import { execSync } from 'child_process';
import { env } from '../config/env.js';
import type { ContainerStatus } from '../types/index.js';

interface DockerResult {
  success: boolean;
  containerId?: string;
  port?: number;
  message: string;
}

export function deployContainer(empresaId: string, subdominio: string, modulos: string[]): DockerResult {
  const containerName = `mype-${subdominio}`;
  const imageName = `${env.DOCKER_BASE_IMAGE}`;

  try {
    const port = 3000 + Math.floor(Math.random() * 60000);

    const labels = modulos.map((m) => `--label "modulo=${m}"`).join(' ');
    const cmd = `docker run -d --name "${containerName}" --network "${env.DOCKER_NETWORK}" -p ${port}:3000 ${labels} "${imageName}" tail -f /dev/null`;

    const output = execSync(cmd, { timeout: 30000 }).toString().trim();

    return {
      success: true,
      containerId: output,
      port,
      message: `Contenedor "${containerName}" desplegado en puerto ${port}`,
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

import { z } from "zod"

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo es obligatorio")
    .email("Correo inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
})

export const deploySchema = z.object({
  clientName: z
    .string()
    .min(1, "El nombre del cliente es obligatorio")
    .max(100, "Máximo 100 caracteres"),
  modules: z.array(z.string()).min(1, "Agrega al menos un módulo"),
})

export const portalSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(80, "Máximo 80 caracteres"),
  category: z.string().min(1, "Selecciona una categoría"),
})

export type LoginInput = z.infer<typeof loginSchema>
export type DeployInput = z.infer<typeof deploySchema>
export type PortalInput = z.infer<typeof portalSchema>

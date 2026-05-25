import type { Meta, StoryObj } from "@storybook/react-vite"
import { Badge } from "@/components/ui/badge"

const meta = {
  title: "UI/Badge",
  component: Badge,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { children: "Default", variant: "default" },
}

export const Secondary: Story = {
  args: { children: "Secondary", variant: "secondary" },
}

export const Destructive: Story = {
  args: { children: "Destructive", variant: "destructive" },
}

export const Outline: Story = {
  args: { children: "Outline", variant: "outline" },
}

export const Success: Story = {
  args: { children: "Success", variant: "success" },
}

export const Warning: Story = {
  args: { children: "Warning", variant: "warning" },
}

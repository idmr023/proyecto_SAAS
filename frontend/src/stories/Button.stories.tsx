import type { Meta, StoryObj } from "@storybook/react-vite"
import { Button } from "@/components/ui/button"

const meta = {
  title: "UI/Button",
  component: Button,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: { children: "Button" },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { variant: "default", children: "Default" },
}

export const Destructive: Story = {
  args: { variant: "destructive", children: "Destructive" },
}

export const Outline: Story = {
  args: { variant: "outline", children: "Outline" },
}

export const Secondary: Story = {
  args: { variant: "secondary", children: "Secondary" },
}

export const Ghost: Story = {
  args: { variant: "ghost", children: "Ghost" },
}

export const Link: Story = {
  args: { variant: "link", children: "Link" },
}

export const Small: Story = {
  args: { size: "sm", children: "Small" },
}

export const Large: Story = {
  args: { size: "lg", children: "Large" },
}

export const Loading: Story = {
  args: { disabled: true, children: "Loading..." },
}

export const WithIcon: Story = {
  args: { children: "→ With Icon" },
}

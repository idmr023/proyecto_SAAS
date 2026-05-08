import type { Meta, StoryObj } from "@storybook/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const meta = {
  title: "UI/Card",
  component: Card,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Card content</p>
      </CardContent>
    </Card>
  ),
}

export const WithLongContent: Story = {
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>Analysis Report</CardTitle>
        <CardDescription>Monthly performance summary</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Revenue</span>
          <span className="font-medium">$45,230</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Users</span>
          <span className="font-medium">1,234</span>
        </div>
      </CardContent>
    </Card>
  ),
}

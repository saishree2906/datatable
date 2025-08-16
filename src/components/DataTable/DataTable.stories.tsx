import type { Meta, StoryObj } from "@storybook/react";
import { DataTable } from "./DataTable";
import type { Column } from "./types";

type User = {
  id: number;
  name: string;
  email: string;
  age: number;
  joinedAt: string; // ISO date
};

const sample: User[] = [
  { id: 1, name: "Alice", email: "alice@mail.com", age: 28, joinedAt: "2023-06-10" },
  { id: 2, name: "Bob", email: "bob@mail.com", age: 34, joinedAt: "2022-12-02" },
  { id: 3, name: "Charlie", email: "charlie@mail.com", age: 22, joinedAt: "2024-03-15" },
];

const columns: Column<User>[] = [
  { key: "name", header: "Name", sortable: true },
  { key: "email", header: "Email" },
  { key: "age", header: "Age", sortable: true, width: "w-24" },
  {
    key: "joinedAt",
    header: "Joined",
    sortable: true,
    render: (value) => new Date(value).toLocaleDateString(),
    width: "w-32",
  },
];

const meta: Meta<typeof DataTable<User>> = {
  title: "Components/DataTable",
  component: DataTable<User>,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Reusable, generic DataTable with sorting, selection, loading and empty states. Keyboard: Space/Enter toggles selection on focused row.",
      },
    },
  },
  argTypes: {
    loading: { control: "boolean" },
    selectable: { control: "boolean" },
    emptyMessage: { control: "text" },
  },
};
export default meta;

type Story = StoryObj<typeof DataTable<User>>;

export const Default: Story = {
  args: {
    data: sample,
    columns,
  },
};

export const Sortable: Story = {
  args: {
    data: sample,
    columns,
  },
  parameters: {
    docs: { description: { story: "Click sortable headers to toggle asc/desc." } },
  },
};

export const Selectable: Story = {
  args: {
    data: sample,
    columns,
    selectable: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Use the header checkbox to select all. Press Space/Enter on a focused row to toggle selection (a11y).",
      },
    },
  },
};

export const Loading: Story = {
  args: {
    data: [],
    columns,
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    data: [],
    columns,
    emptyMessage: "Nothing to see here 👀",
  },
};

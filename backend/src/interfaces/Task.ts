export default interface Task {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
}

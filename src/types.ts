export interface Book {
  id: string;
  title: string;
  author: string;
  dateCataloged: string; // ISO string
  userId: string;
  coverUrl?: string;
}

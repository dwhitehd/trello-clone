export interface Comment {
  id: string;
  text: string;
  author?: string;
  createdAt: number;
}

export interface CardType {
  id: number;
  title: string;
  description?: string;
  comments: Comment[];
}

export interface ColumnType {
  id: number;
  title: string;
  items: CardType[];
}

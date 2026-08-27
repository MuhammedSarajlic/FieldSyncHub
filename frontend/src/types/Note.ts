export type TNote = {
  id: string;
  createdBy: string;
  createdByName: string;
  noteText?: string;
  pathFile?: string;
  createdAt: string;
  updatedAt: string;
};

export type TAddNote = {
  customerId?: string;
  createdBy: string;
  createdByName: string;
  noteText?: string;
  pathFile?: string;
};

export type TUpdateNote = {
  id: string;
  noteText?: string;
  pathFile?: string;
};

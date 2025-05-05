export type TNote = {
  id: string;
  createdBy: string;
  createdAt: string;
  noteText: string;
  pathFile: string;
  customerId: string;
};

export type TAddNote = {
  createdBy: string;
  createdAt: string;
  noteText: string;
  pathFile: string;
  customerId: string;
};

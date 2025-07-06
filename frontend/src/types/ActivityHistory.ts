export type TActivityHistory = {
  id: string;
  type: string;
  action: string;
  changedAt: string;
  changedBy: string;
  changedByName: string;
};

export type TAddActivityHistory = {
  type: string;
  action: string;
  changedBy: string;
  changedByName: string;
};

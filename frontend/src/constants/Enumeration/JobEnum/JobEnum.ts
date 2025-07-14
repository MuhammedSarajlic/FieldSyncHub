export enum JobStatus {
  Scheduled,
  Dispatched,
  InProgress,
  Completed,
  Canceled,
}

export enum JobPriority {
  Low,
  Normal,
  High,
  Urgent,
}

export enum JobType {
  OneTime,
  Recurring,
}

export enum PaymentStatus {
  Unpaid,
  Partial,
  Paid,
  Refunded,
}

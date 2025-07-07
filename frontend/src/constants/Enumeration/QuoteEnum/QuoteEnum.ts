export enum QuoteStatus {
  Draft,
  Sent,
  AwaitingResponse,
  AwaitingApproval,
  Approved,
  Declined,
  Expired,
  ConvertedToJob,
}

export enum QuoteActivityType {
  QuoteCreated,
  QuoteEdited,
  QuoteSent,
  InternalNoteAdded,
  CustomerNoteAdded,
  CustomerMessageAdded,
  AttachmentAdded,
  MarkedSent,
  MarkedAccepted,
  MarkedRejected,
  ConvertedToJob,
  StatusChanged,
}

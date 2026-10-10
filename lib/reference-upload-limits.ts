// Shared by the upload form and API. The total stays under ~18 MB because the
// files are emailed as attachments and Gmail rejects messages over 25 MB once
// base64-encoded.
export const maxReferenceFiles = 5;
export const maxReferenceFileSize = 12 * 1024 * 1024;
export const maxReferenceTotalSize = 18 * 1024 * 1024;

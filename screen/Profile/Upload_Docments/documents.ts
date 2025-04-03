export type DocumentStatus = 'Pending' | 'Approved' | 'Rejected';

export type DocumentType = 'Registration' | 'Insurance' | 'Permit' | 'Pollution Certificate' | 'License' | 'Aadhar';

export interface Document {
  _id: string;
  vehicle_partner_Id: string;
  documentType: DocumentType;
  documentFile: string;
  documentFile_public_id: string;
  document_status: DocumentStatus;
  reject_reason: string;
  uploadedAt: string;
}

export interface User {
  id: string;
  documents: Document[];
}
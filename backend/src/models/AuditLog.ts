import { Schema, model } from 'mongoose';
import { IAuditLog } from '../types/models.types';

const auditLogSchema = new Schema<IAuditLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    action: { type: String, required: true, index: true },
    entity: {
      type: String,
      enum: ['User', 'Customer', 'Product', 'SalesOrder', 'Auth'],
      required: true,
      index: true,
    },
    entityId: { type: String, index: true },
    description: { type: String, required: true },
    timestamp: { type: Date, default: Date.now, index: true },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: false,
  }
);

export const AuditLog = model<IAuditLog>('AuditLog', auditLogSchema);
export default AuditLog;

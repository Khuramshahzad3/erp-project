import { Router } from 'express';
import AuditLogsController from './auditLogs.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';

const router = Router();

router.get('/', authenticate, authorize(['Admin']), AuditLogsController.getAuditLogs);

export default router;

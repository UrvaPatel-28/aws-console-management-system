export enum RoleEnum {
  Admin = 'Admin',
  TeamMember = 'Team Member',
  TeamLeader = 'Team Leader',
  Auditor = 'Auditor',
  AccessManager = 'Access Manager',
}

export enum PermissionEnum {
  CreateAwsCredentials = 'Create Aws Credentials',
  UpdateAwsCredentials = 'Update Aws Credentials',
  DeleteAwsCredentials = 'Delete Aws Credentials',
  ViewAwsCredentials = 'View Aws Credentials',
  ViewAuditLogs = 'View Audit Logs',
}

export enum AwsPolicyEffectEnum {
  Allow = 'Allow',
  Deny = 'Deny',
}

export enum AwsAccessKeysStatusEnum {
  Active = 'Active',
  Inactive = 'Inactive',
}

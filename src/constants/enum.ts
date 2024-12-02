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
  ManageRoleAndPermissions = 'Manage Role And Permissions',
}

export enum AwsPolicyEffectEnum {
  Allow = 'Allow',
  Deny = 'Deny',
}

export enum AwsAccessKeysStatusEnum {
  Active = 'Active',
  Inactive = 'Inactive',
}

export enum OrderByEnum {
  ApiEndpoint = 'Api Endpoint',
  HttpMethod = 'Http Method',
  ResponsesStatus = 'Response Status',
  ExecutionDurationInMs = 'Execution Duration',
  ResponseMessage = 'Response Message',
}

export enum SortByEnum {
  ASC = 'ASC',
  DESC = 'DESC',
}

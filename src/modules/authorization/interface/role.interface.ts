export interface FindAllRoleOptions {
  ids?: string[];
  relations?: {
    permissions?: boolean;
    users?: boolean;
  };
}

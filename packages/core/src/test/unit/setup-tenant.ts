// Unit tests run like a single-tenant install (MULTI_TENANT=false): whatever
// runs without a tenant context runs in the default tenant, and login tokens
// without a tenantId belong to it. Tests of the tenant layer itself reset this.
import { TenantContext } from '../../tenant/tenant-context';
import { tenantDirectory } from '../../tenant/tenant-directory';

export const UNIT_TEST_TENANT_ID = '0000000000000000000000aa';

TenantContext.setFallbackTenantId(UNIT_TEST_TENANT_ID);
tenantDirectory.setDefaultTenantId(UNIT_TEST_TENANT_ID);

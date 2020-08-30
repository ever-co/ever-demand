import { Module } from '@nestjs/common';
import { InviteRequestResolver } from './invites-requests.resolver';

@Module({
	providers: [InviteRequestResolver],
})
export class InvitesRequestsModule {}

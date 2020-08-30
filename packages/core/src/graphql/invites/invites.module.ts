import { Module } from '@nestjs/common';
import { InviteResolver } from './invite.resolver';

@Module({
	providers: [InviteResolver],
})
export class InvitesModule {}

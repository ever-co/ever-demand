import {
	BadRequestException,
	ConflictException,
	Controller,
	Headers,
	HttpCode,
	Post,
	Req,
	ServiceUnavailableException,
} from '@nestjs/common';
import type { Request } from 'express';
import {
	BillingEventBusyError,
	BillingService,
	WebhookSignatureError,
} from '../../services/billing/BillingService';

/**
 * Stripe webhook of the tenant subscriptions: POST /api/billing/webhook.
 * Verified with STRIPE_BILLING_WEBHOOK_SECRET against the raw body (kept by
 * the JSON parser in nest-bootstrap.ts).
 */
@Controller('billing')
export class BillingController {
	constructor(private readonly _billingService: BillingService) {}

	@Post('webhook')
	@HttpCode(200)
	async webhook(
		@Req() req: Request & { rawBody?: Buffer },
		@Headers('stripe-signature') signature?: string
	) {
		if (!req.rawBody) {
			throw new BadRequestException('Expected a raw JSON body');
		}

		try {
			const applied = await this._billingService.handleWebhook(req.rawBody, signature);
			return { received: true, applied };
		} catch (err) {
			if (err instanceof WebhookSignatureError) {
				throw new BadRequestException(`Webhook signature: ${err.message}`);
			}

			// another server is applying this event: a non-2xx answer makes Stripe retry
			if (err instanceof BillingEventBusyError) {
				throw new ConflictException(err.message);
			}

			if ((err as Error).message?.includes('not configured')) {
				throw new ServiceUnavailableException((err as Error).message);
			}

			throw err;
		}
	}
}

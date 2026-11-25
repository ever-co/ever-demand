/** Renders the open order modal (the Ionic `ModalController`), one at a time. */
import React from 'react';
import { useAppSelector } from '../store';
import { NewCardModal } from './NewCardModal';
import { OrderModal } from './OrderModal';
import { OrderProductsModal } from './OrderProductsModal';
import { CallModal, CancelModal, IssueModal, MapModal } from './SmallModals';
import { TakeawayModal } from './TakeawayModal';

export function ModalHost() {
	const modal = useAppSelector((state) => state.ui.modal);
	if (!modal) {
		return null;
	}
	switch (modal.type) {
		case 'order':
			return <OrderModal />;
		case 'takeaway':
			return <TakeawayModal />;
		case 'cancel':
			return <CancelModal />;
		case 'issue':
			return (
				<IssueModal
					orderId={modal.orderId}
					isPaid={modal.isPaid}
					deliveryIssue={modal.deliveryIssue}
					warehouseIssue={modal.warehouseIssue}
				/>
			);
		case 'orderProducts':
			return <OrderProductsModal orderId={modal.orderId} confirmable={modal.confirmable} />;
		case 'call':
			return <CallModal />;
		case 'map':
			return <MapModal origin={modal.origin} destination={modal.destination} />;
		case 'newCard':
			return <NewCardModal orderId={modal.orderId} />;
		default:
			return null;
	}
}

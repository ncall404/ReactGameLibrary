// modal.tsx: Modal component. Used for creating pop-ups such as when needing a form, sub-form, or custom action confirmation window.

import type { ReactNode } from "react";
import Btn from "./btn";
import { BtnStyle } from "./btn";

type ModalProps = {
	isOpen: boolean;
	isForm?: boolean;
	onClose: () => void;
	onConfirm?: () => void;
	children: ReactNode;
}

export default function Modal(props: ModalProps) {
	if (!props.isOpen) return null;

	return (
		<div className="flex justify-center backdrop-blur-md w-full h-full top-0 right-0 fixed" onClick={props.onClose}>
			<div className="min-w-xs max-w-lg md:min-w-md lg:min-w-lg lg:max-w-2xl
			h-fit p-2 self-center
			bg-(--color-dark) rounded-sm border-2 border-(--color-neutral)"
			onClick={(e) => e.stopPropagation()}>
				{props.children}
				<div className="justify-end content-center mr-1 text-(--color-light) flex gap-2 mt-3">
					{
						props.isForm ?
						<>
							<Btn style={BtnStyle.Primary} func={props.onConfirm}>Confirm</Btn>
							<Btn style={BtnStyle.Danger} func={props.onClose}>Cancel</Btn>
						</> :
						<Btn style={BtnStyle.Neutral} func={props.onClose}>Close</Btn>
					}
				</div>
			</div>
		</div>
	);
}
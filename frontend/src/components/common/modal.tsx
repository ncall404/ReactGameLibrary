// modal.tsx: Modal component. Used for creating pop-ups such as when needing a form, sub-form, or custom action confirmation window.

import Btn from "./btn";
import { BtnStyle } from "./btn";

type ModalProps = {
	isOpen: boolean;
	isForm?: boolean; // Indicates that the modal should have a confirm action.
	onClose: () => void;
	onConfirm?: () => void;
	children: React.ReactNode;
}

export default function Modal(props: ModalProps) {
	if (!props.isOpen) return null;

	return (
		<div className="flex justify-center backdrop-blur-md w-full h-full top-0 right-0 fixed" onClick={props.onClose}>
			<div className="min-w-sm max-w-lg md:min-w-md lg:min-w-lg lg:max-w-2xl
			h-fit p-2 self-center
			bg-(--color-dark) rounded-sm border-2 border-(--color-darker)"
			onClick={(e) => e.stopPropagation()}>
				{props.children}
				<div className="content-center text-(--color-light) flex gap-2 mt-3 max-md:flex-wrap">
					{
						props.isForm ?
						<>
							<Btn className="basis-1/2 max-md:basis-full" style={BtnStyle.Primary} func={props.onConfirm}>Confirm</Btn>
							<Btn className="basis-1/2 max-md:basis-full" style={BtnStyle.Neutral} func={props.onClose}>Cancel</Btn>
						</> :
						<Btn className="basis-full" style={BtnStyle.Neutral} func={props.onClose}>Close</Btn>
					}
				</div>
			</div>
		</div>
	);
}
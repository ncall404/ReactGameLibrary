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
		<div className="flex justify-center backdrop-blur-md w-full h-full top-0 right-0 fixed z-2" onClick={props.onClose}>
			<div className="w-full max-w-lg sm:min-w-md md:min-w-lg lg:max-w-2xl
			h-fit px-0 py-1 xs:p-2 self-center flex flex-col gap-2
			bg-dark xs:rounded-sm border-y-2 xs:border-2 border-darker
			modal"
			onClick={(e) => e.stopPropagation()}>
				{props.children}
				<div className="content-center text-light flex gap-2 px-2 xs:px-0 my-1 flex-wrap sm:flex-nowrap">
					{
						props.isForm ?
						<>
							<Btn className="basis-full sm:basis-1/2" style={BtnStyle.Primary} func={props.onConfirm}>Confirm</Btn>
							<Btn className="basis-full sm:basis-1/2 " style={BtnStyle.Neutral} func={props.onClose}>Cancel</Btn>
						</> :
						<Btn className="basis-full" style={BtnStyle.Neutral} func={props.onClose}>Close</Btn>
					}
				</div>
			</div>
		</div>
	);
}
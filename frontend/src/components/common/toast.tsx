// toast.tsx: Toast component. Used for creating dismissable popups to show messages/notifications to the user. Good for things such as success and error messages.

import Btn from "./btn";
import { BtnStyle } from "./btn";

// Object as const for defining a toast style.
export const ToastStyle = {
	Success: "SUCCESS",
	Err: "ERROR",
	Warning: "WARNING",
	Info: "INFORMATIVE",
} as const;
type ToastStyle = (typeof ToastStyle)[keyof typeof ToastStyle];

type ToastProps = {
	className?: string; // For if extra styling is needed in special cases.
	style: ToastStyle;
	onClose: () => void;
	children: React.ReactNode;
}

export default function Toast(props: ToastProps) {
	// Setting the styling and title that are dependent on the style type.
	let toastStyles: string;
	let toastTitle: string = "";
	switch (props.style) {
		case ToastStyle.Success:
			toastStyles = "border-l-(--color-success)";
			toastTitle = "Success"
			break;
		case ToastStyle.Err:
			toastStyles = "border-l-(--color-error)";
			toastTitle = "Error"
			break;
		case ToastStyle.Warning:
			toastStyles = "border-l-(--color-warning)";
			toastTitle = "Warning"
			break;
		case ToastStyle.Info:
			toastStyles = "border-l-(--color-info)";
			toastTitle = "Info"
			break;
	}

	return (
		<div className={`flex w-full sm:w-96 p-2 fixed 
		 bottom-0 sm:bottom-5 min-3xl:right-5 bg-(--color-darker) 
		max-3xl:left-1/2 max-3xl:-translate-x-1/2
		rounded-sm border-(--color-neutral) border-2 border-l-8
		${toastStyles}`}>
			<div>
				<h3 className="text-xl">{toastTitle}</h3>
				{props.children}
			</div>
			<Btn className="self-center ml-auto w-10 h-10" style={BtnStyle.Danger} func={props.onClose}>X</Btn>
		</div>
	);
}
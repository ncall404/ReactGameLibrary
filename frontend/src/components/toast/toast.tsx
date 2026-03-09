// toast.tsx: Toast component. Used for creating dismissable popups to show messages/notifications to the user. Good for things such as success and error messages.

import { useState, useEffect } from "react";

import Btn from "../common/btn";
import { BtnStyle } from "../common/btn";

import { ToastStyle } from "./toastContext";
import type { ToastType } from "./toastContext";


type ToastProps = {
	className?: string; // For if extra styling is needed in special cases.
	style: ToastType;
	time: number; // Time in milliseconds for the toast to stay open.
	children?: React.ReactNode;
}

export default function Toast(props: ToastProps) {
	const [visible, setVisible] = useState<boolean>(false);

	useEffect(() => {
		if (props.children) {
			setVisible(true);

			const timeout = setTimeout(() => {
				setVisible(false);
			}, props.time);

			return () => clearTimeout(timeout)
		}
	}, [props.children, props.style, props.time])

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
		<>
			{
				visible &&
				<div className={`flex w-full sm:w-96 p-2 fixed 
				bottom-0 sm:bottom-5 min-3xl:right-5 bg-(--color-darker) 
				max-3xl:left-1/2 max-3xl:-translate-x-1/2
				rounded-sm border-(--color-neutral) border-2 border-l-8
				${toastStyles}`}>
					<div>
						<h3 className="text-xl">{toastTitle}</h3>
						{props.children}
					</div>
					<Btn className="self-center ml-auto w-10 h-10" style={BtnStyle.Danger} func={() => setVisible(false)}>X</Btn>
				</div>
			}
		</>
	);
}
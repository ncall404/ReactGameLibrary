// toast.tsx: Toast component. Used for creating dismissable popups to show messages/notifications to the user. Good for things such as success and error messages.

import { useEffect, useState } from "react";
import Btn from "../common/btn";
import { BtnStyle } from "../common/btn";

import { ToastStyle, useToastContext, type ToastObj } from "./toastContext";


type ToastProps = {
	className?: string; // For if extra styling is needed in special cases.
}

export default function Toast(props: ToastProps) {
	const { clearToast, getToastState } = useToastContext();
	const [toastData, setToastData] = useState<ToastObj | undefined>(getToastState());

	useEffect(() => {
		setToastData(getToastState());
	}, [getToastState, setToastData]);

	// Setting the styling and title that are dependent on the style type.
	let toastStyles: string = "";
	let toastTitle: string = "";
	if (toastData) {
		switch (toastData.type) {
			case ToastStyle.Success:
				toastStyles = "border-l-(--color-success)";
				toastTitle = "Success";
				break;
			case ToastStyle.Error:
				toastStyles = "border-l-(--color-error)";
				toastTitle = "Error";
				break;
			case ToastStyle.Warning:
				toastStyles = "border-l-(--color-warning)";
				toastTitle = "Warning";
				break;
			case ToastStyle.Info:
				toastStyles = "border-l-(--color-info)";
				toastTitle = "Info";
				break;
		}
	}

	return (
		<>
			{
				toastData &&
				<div className={`flex w-full sm:w-96 p-2 fixed 
				bottom-0 sm:bottom-5 min-3xl:right-5 bg-(--color-darker) 
				max-3xl:left-1/2 max-3xl:-translate-x-1/2
				rounded-sm border-(--color-neutral) border-2 border-l-8
				${toastStyles} ${props.className}`}>
					<div>
						<h3 className="text-xl">{toastTitle}</h3>
						<p>{toastData ? toastData.message : "None"}</p>
					</div>
					<Btn className="self-center ml-auto min-w-10 min-h-10 w-10 h-10" style={BtnStyle.Danger} func={() => clearToast()}>X</Btn>
				</div>
			}
		</>
	);
}
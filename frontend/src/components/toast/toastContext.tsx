// toastContext.tsx: Holds context/provider, and types related to the toast component.

import { type ReactNode, createContext, useState, useEffect, useContext } from "react";

// Object as const for defining a toast style.
export const ToastStyle = {
	Success: "success",
	Error: "error",
	Warning: "warning",
	Info: "informative",
} as const;
export type ToastType = (typeof ToastStyle)[keyof typeof ToastStyle];

export type ToastObj = {
	message: string;
	type: ToastType;
	time?: number;
}


// Toast Context ------------------------------------
type ToastContextProps = {
	setToast: (toast: ToastObj) => void;
	clearToast: () => void;
	getToastState: () => ToastObj | undefined;
}

const ToastContext = createContext<ToastContextProps | undefined> (undefined);

export const useToastContext = (): ToastContextProps => {
	const context = useContext(ToastContext);
	if (!context) {
		throw new Error("useToast must be used within the ToastProvider.");
	}
	return context;
}


// Toast Provider -----------------------------------
type ToastProviderProps = {
	children: ReactNode;
}

export const ToastProvider = (props: ToastProviderProps) => {
	const [toastObj, setToastObj] = useState<ToastObj | undefined>();

	const setToast = (toast: ToastObj) => {
		setToastObj(toast);
	}

	const clearToast = () => {
		setToastObj(undefined);
	}

	const getToastState = (): ToastObj | undefined => {
		return toastObj;
	}

	// Clear the notification if the set time has passed.
	useEffect(() => {
		if (toastObj && toastObj.time) {
			const timeout = setTimeout(() => {
				clearToast();
			}, toastObj.time);

			return () => clearTimeout(timeout);
		}
	}, [toastObj]);

	return (
		<ToastContext.Provider
			value={{
				setToast,
				clearToast,
				getToastState,
			}}
		>
			{props.children}
		</ToastContext.Provider>
	)
}
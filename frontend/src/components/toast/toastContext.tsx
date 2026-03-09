// toastContext.tsx: Holds context, types, interfaces related to the toast component.



// Object as const for defining a toast style.
export const ToastStyle = {
	Success: "SUCCESS",
	Err: "ERROR",
	Warning: "WARNING",
	Info: "INFORMATIVE",
} as const;
export type ToastType = (typeof ToastStyle)[keyof typeof ToastStyle];



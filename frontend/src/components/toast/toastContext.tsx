// toastContext.tsx: Holds context, types, interfaces related to the toast component.



// Object as const for defining a toast style.
export const ToastStyle = {
	Success: "success",
	Err: "error",
	Warning: "warning",
	Info: "informative",
} as const;
export type ToastType = (typeof ToastStyle)[keyof typeof ToastStyle];



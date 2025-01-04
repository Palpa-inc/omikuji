type AlertProps = {
  type: "error" | "success";
  message: string;
  onClose?: () => void;
};

export function Alert({ type, message, onClose }: AlertProps) {
  const bgColor =
    type === "error"
      ? "bg-red-50 dark:bg-red-900/20"
      : "bg-green-50 dark:bg-green-900/20";
  const textColor =
    type === "error"
      ? "text-red-800 dark:text-red-200"
      : "text-green-800 dark:text-green-200";
  const borderColor =
    type === "error"
      ? "border-red-200 dark:border-red-800"
      : "border-green-200 dark:border-green-800";

  return (
    <div className={`rounded-lg border p-4 ${bgColor} ${borderColor}`}>
      <div className="flex items-center justify-between">
        <p className={`text-sm ${textColor}`}>{message}</p>
        {onClose && (
          <button
            onClick={onClose}
            className={`ml-4 ${textColor} hover:opacity-80`}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

export default function Status(props) {
  return (
    <span
      class={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-sm transition-all duration-200 ${
        props.status === "CLOSED"
          ? "bg-red-50 text-red-700 border-red-200"
          : props.status === "IN_PROGRESS"
          ? "bg-amber-50 text-amber-700 border-amber-200"
          : "bg-emerald-50 text-emerald-700 border-emerald-200"
      }`}
    >
      <div
        class={`size-2 rounded-full mr-1.5 ${
          props.status === "CLOSED"
            ? "bg-red-500"
            : props.status === "IN_PROGRESS"
            ? "bg-amber-500"
            : "bg-emerald-500"
        }`}
      ></div>
      {props.status}
    </span>
  );
}

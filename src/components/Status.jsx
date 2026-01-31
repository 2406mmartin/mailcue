export default function Status(props) {
  return (
    <span
      class={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-sm transition-all duration-100 ${
        props.status === "CLOSED"
          ? "bg-red-50 text-red-700 border-red-200"
          : props.status === "IN_PROGRESS"
          ? "bg-amber-50 text-amber-700 border-amber-200"
          : "bg-green-50 text-green-700 border-green-200"
      }`}
    >
      <div
        class={`size-2 rounded-full mr-1.5 ${
          props.status === "CLOSED"
            ? "bg-red-500"
            : props.status === "IN_PROGRESS"
            ? "bg-amber-500"
            : "bg-green-500"
        }`}
      ></div>
      {props.status}
    </span>
  );
}

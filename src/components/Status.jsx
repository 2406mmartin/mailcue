export default function Status(props) {
  return (
    <span class="inline-flex items-center text-xs font-medium text-neutral-600">
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

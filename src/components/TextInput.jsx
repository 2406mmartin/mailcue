export default function TextInput(props) {
  return (
    <div class={`flex flex-col group ${props.fill ? "flex-1" : ""}`}>
      <label class="font-semibold text-neutral-600 text-sm bg-neutral-100 py-2 px-4 rounded-t-sm group-focus-within:bg-neutral-200 transition-colors">
        {props.label}
      </label>
      {props.textarea ? (
        <textarea
          class={`text-neutral-600 text-xs p-3 rounded-b-sm border-2 focus:border-neutral-200 focus:bg-neutral-50 border-neutral-100 appearance-none outline-none resize-none duration-100 transition-colors ${props.fill ? "flex-1" : "min-h-24"}`}
        ></textarea>
      ) : (
        <input
          class={`text-neutral-600 text-xs p-3 rounded-b-sm border-2 focus:border-neutral-200 focus:bg-neutral-50 border-neutral-100 appearance-none outline-none duration-100 transition-colors`}
        ></input>
      )}
    </div>
  );
}

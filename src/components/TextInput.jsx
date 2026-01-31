export default function TextInput(props) {
  return (
    <div class={`flex flex-col group ${props.fill ? "flex-1" : ""}`}>
      <label class="font-semibold text-neutral-600 text-sm bg-neutral-100 py-2 px-4 rounded-t-sm group-focus-within:bg-neutral-200 transition-colors duration-100">
        {props.label}
      </label>
      {props.textarea ? (
        <textarea
          class={`text-neutral-600 text-sm p-3 rounded-b-sm border-2 focus:border-neutral-300 focus:bg-neutral-50 border-neutral-100 hover:border-neutral-200 appearance-none outline-none resize-none duration-100 transition-all placeholder:text-neutral-400 ${props.fill ? "flex-1" : "min-h-24"}`}
          placeholder={props.placeholder}
        ></textarea>
      ) : (
        <input
          class={`text-neutral-600 text-sm p-3 rounded-b-sm border-2 focus:border-neutral-300 focus:bg-neutral-50 border-neutral-100 hover:border-neutral-200 appearance-none outline-none duration-100 transition-all placeholder:text-neutral-400`}
          placeholder={props.placeholder}
        ></input>
      )}
    </div>
  );
}

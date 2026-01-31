import { createSignal } from "solid-js";

export default function TextInput(props) {
  const [error, setError] = createSignal("");

  const handleInput = (e) => {
    const value = e.target.value;

    if (props.pattern && value) {
      const regex = new RegExp(props.pattern);
      if (!regex.test(value)) {
        setError(props.errorMessage);
      } else {
        setError("");
      }
    } else {
      setError("");
    }

    props.onInput?.(value);
    props.onError?.(!!error());
  };

  return (
    <div class={`flex flex-col group ${props.fill ? "flex-1" : ""}`}>
      <label class="font-semibold text-neutral-600 text-sm bg-neutral-100 py-2 px-4 rounded-t-sm group-focus-within:bg-neutral-200 transition-colors duration-100">
        {props.label}
        {error() && <span class="text-red-600 text-xs">{error()}</span>}
      </label>
      {props.textarea ? (
        <textarea
          class={`text-neutral-600 text-sm p-3 rounded-b-sm border-2 focus:border-neutral-300 focus:bg-neutral-50 ${error() ? "border-red-600" : "border-neutral-100"} hover:border-neutral-200 appearance-none outline-none resize-none duration-100 transition-all placeholder:text-neutral-400 ${props.fill ? "flex-1" : "min-h-24"}`}
          placeholder={props.placeholder}
          value={props.value}
          onInput={handleInput}
        ></textarea>
      ) : (
        <input
          class={`text-neutral-600 text-sm p-3 rounded-b-sm border-2 focus:border-neutral-300 focus:bg-neutral-50 ${error() ? "border-red-600" : "border-neutral-100"} hover:border-neutral-200 appearance-none outline-none duration-100 transition-all placeholder:text-neutral-400`}
          placeholder={props.placeholder}
          pattern={props.pattern}
          value={props.value}
          onInput={handleInput}
        ></input>
      )}
    </div>
  );
}

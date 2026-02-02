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
    <div class={`flex flex-col group ${props.hFill && "h-full"}`}>
      <label class="text-xs font-medium text-neutral-500 py-2 px-4 rounded-t-sm transition-colors duration-100">
        {props.label}
        {error() && <span class="text-red-600 text-xs">{error()}</span>}
      </label>
      {props.textarea ? (
        <textarea
          class={`text-sm text-black p-2 rounded-md border-2 focus:border-neutral-300 focus:bg-neutral-100 ${error() ? "border-red-600" : "border-neutral-100"} hover:border-neutral-200 appearance-none outline-none resize-none duration-100 transition-all placeholder:text-neutral-300 ${props.fill && "w-full"} ${props.hFill && "h-full"}`}
          placeholder={props.placeholder}
          value={props.value}
          onInput={handleInput}
        />
      ) : (
        <div class="flex flex-row gap-4">
          <input
            class={`text-sm text-black p-2 rounded-md border-2 focus:border-neutral-300 focus:bg-neutral-100 ${error() ? "border-red-600" : "border-neutral-100"} hover:border-neutral-200 appearance-none outline-none duration-100 transition-all placeholder:text-neutral-300 ${props.fill && "w-full"}`}
            placeholder={props.placeholder}
            pattern={props.pattern}
            value={props.value}
            onInput={handleInput}
          />
          {props.button && (
            <button class="w-fit py-2 px-4 bg-black hover:bg-neutral-800 text-white rounded-md text-sm transition-all duration-100 hover:cursor-pointer active:scale-95">
              {props.buttonLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

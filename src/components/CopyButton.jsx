import { createSignal } from "solid-js";
import CopyIcon from "../assets/icons/copy.svg?raw";
import CheckIcon from "../assets/icons/check.svg?raw";

export default function CopyButton(props) {
  const [copied, setCopied] = createSignal(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(props.text);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 1000);
    } catch (err) {
      console.log("Error copying to clipboard: ", err);
    }
  };

  return (
    <div class="text-xs text-neutral-500 flex flex-row items-center bg-neutral-100 py-1 px-2 w-fit rounded-md">
      {props.text}
      <button
        class="ml-1 p-1 hover:bg-neutral-200 active:scale-95 rounded transition-all duration-100 hover:cursor-pointer"
        aria-label={copied() ? "Copied" : "Copy"}
        title={copied() ? "Copied" : "Copy"}
        onClick={handleCopy}
      >
        {copied() === false ? (
          <div class="size-4" innerHTML={CopyIcon} />
        ) : (
          <div class="size-4" innerHTML={CheckIcon} />
        )}
      </button>
    </div>
  );
}

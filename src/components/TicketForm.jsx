import TextInput from "./TextInput.jsx";
import PlusCircle from "../assets/icons/plus-circle-bold.svg?raw";

export default function TicketForm() {
  return (
    <div class="p-8 flex flex-col w-full gap-2 h-full">
      <div class="font-bold text-lg">Create a Ticket</div>
      <div class="rounded-md border-2 border-neutral-100 bg-white flex flex-col gap-4 p-6 flex-1 min-h-0">
        <TextInput label="Subject"></TextInput>
        <TextInput label="Contact"></TextInput>
        <TextInput label="Description" textarea={true} fill={true}></TextInput>
        <button class="w-fit px-3 py-2 self-center rounded-md text-sm flex flex-row justify-center font-bold items-center gap-1.5 transition-all duration-100 bg-black text-white hover:scale-95 hover:cursor-pointer">
          <div class="size-4" innerHTML={PlusCircle} />
          Create Ticket
        </button>
      </div>
    </div>
  );
}

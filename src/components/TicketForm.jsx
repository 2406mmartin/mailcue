import { createSignal } from "solid-js";
import TextInput from "./TextInput.jsx";
import PlusCircle from "../assets/icons/plus-circle-bold.svg?raw";
import CircleNotch from "../assets/icons/circle-notch.svg?raw";

export default function TicketForm() {
  const [subject, setSubject] = createSignal("");
  const [contact, setContact] = createSignal("");
  const [description, setDescription] = createSignal("");
  const [hasEmailError, setHasEmailError] = createSignal(false);
  const [submitted, setSubmitted] = createSignal(false);

  const isFormValid = () =>
    subject().trim() &&
    contact().trim() &&
    description().trim() &&
    !hasEmailError();

  const handleSubmit = async () => {
    setSubmitted(true);

    const response = await fetch(`/api/ticket/create`, {
      method: "POST",
      body: JSON.stringify({
        subject: subject(),
        contact: contact(),
        description: description(),
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(data);

      window.location.href = `/view/${data.ticket.id}`;
    }
  };

  return (
    <div class="p-8 flex flex-col w-full gap-2 h-full">
      <div class="font-bold text-lg">Create a Ticket</div>
      {submitted() && (
        <div
          class="size-18 animate-spin self-center my-auto"
          innerHTML={CircleNotch}
        />
      )}
      <div
        class={`rounded-md border-2 border-neutral-100 bg-white flex flex-col gap-4 p-6 flex-1 min-h-0 ${submitted() && "hidden"}`}
      >
        <TextInput
          label="Subject"
          value={subject()}
          onInput={setSubject}
        ></TextInput>
        <TextInput
          label="Contact"
          pattern="^[\w\-.]+@([\w\-]+\.)+[\w\-]{2,4}$"
          errorMessage=" - Invalid email format"
          value={contact()}
          onInput={setContact}
          onError={setHasEmailError}
        ></TextInput>
        <TextInput
          label="Description"
          textarea={true}
          fill={true}
          value={description()}
          onInput={setDescription}
        ></TextInput>
        <button
          class={`w-fit px-3 py-2 self-center rounded-md text-sm flex flex-row justify-center font-bold items-center gap-1.5 transition-all duration-100 ${
            isFormValid()
              ? "bg-black text-white hover:scale-95 hover:cursor-pointer"
              : "bg-neutral-100 text-white cursor-not-allowed"
          }`}
          disabled={!isFormValid()}
          onClick={handleSubmit}
        >
          <div class="size-4" innerHTML={PlusCircle} />
          Create Ticket
        </button>
      </div>
    </div>
  );
}

import { createSignal } from "solid-js";
import Status from "./Status.jsx";
import PencilIcon from "../assets/icons/pencil-bold.svg?raw";
import TrashIcon from "../assets/icons/trash-bold.svg?raw";

export default function TicketRow(props) {
  const { id, subject, status, updated_at } = props;

  const [deleted, setDeleted] = createSignal(false);

  const handleDelete = () => {
    setDeleted(true);

    console.log("made it here");

    fetch(`/api/ticket/delete`, {
      method: "POST",
      body: JSON.stringify({
        ticketId: id,
      }),
    });
  };

  return (
    <div
      class={`relative grid grid-cols-12 items-center px-6 py-5 gap-6 text-sm bg-white border-t-2 border-neutral-100 ${
        deleted() === true ? "hidden" : ""
      }`}
    >
      <div class="col-span-1 font-bold">#{id}</div>
      <div class="col-span-5 flex flex-col">
        <a
          href={`/view/${id}`}
          class="font-medium text-xs transition-colors duration-100 hover:underline"
        >
          {subject}
        </a>
      </div>

      <div class="col-span-2">
        <Status status={status}></Status>
      </div>

      <div class="col-span-2 font-medium text-xs">
        {new Date(updated_at).toLocaleDateString()}
      </div>

      <div class="col-span-2 text-xs justify-end flex flex-row gap-2">
        <a
          href={`/view/${id}`}
          class="p-1 hover:bg-neutral-200 rounded transition-all duration-100 hover:cursor-pointer hover:scale-95"
          aria-label="Edit ticket"
          title="Edit ticket"
        >
          <div class="size-4" innerHTML={PencilIcon} />
        </a>
        <button
          class="p-1 hover:bg-neutral-200 rounded transition-all duration-100 hover:cursor-pointer hover:scale-95"
          aria-label="Delete ticket"
          title="Delete ticket"
          onClick={() => handleDelete()}
        >
          <div class="size-4" innerHTML={TrashIcon} />
        </button>
      </div>
    </div>
  );
}

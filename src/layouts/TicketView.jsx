import { createSignal, onMount } from "solid-js";
import Status from "../components/Status.jsx";
import CopyButton from "../components/CopyButton.jsx";
import PaperPlaneTilt from "../assets/icons/paper-plane-tilt-bold.svg?raw";
import CheckIcon from "../assets/icons/check.svg?raw";
import EyeSlashIcon from "../assets/icons/eye-slash.svg?raw";

export default function TicketView(props) {
  const { ticket } = props;
  const [copied, setCopied] = createSignal(false);
  const [reply, setReply] = createSignal("");
  const [status, setStatus] = createSignal(ticket?.status);
  const [messages, setMessages] = createSignal(ticket?.messages || []);
  const [internal, setInternal] = createSignal(false);

  const scrollToBottom = () => {
    const scrollableDiv = document.getElementById("activity-log");
    scrollableDiv.scrollTop = scrollableDiv.scrollHeight;
  };

  // run on client
  onMount(async () => {
    scrollToBottom();
  });

  const handleReplyChange = (e) => setReply(e.target.value);

  const handleSendReply = async (newReply, internal) => {
    if (!newReply.trim()) return;

    const newMessage = {
      body: newReply,
      created_at: new Date(),
      is_internal: internal,
      author_id: "You",
    };

    setMessages([...messages(), newMessage]);
    scrollToBottom();

    const response = await fetch(`/api/tickets/${id}/reply`, {
      method: "POST",
      body: JSON.stringify({
        ticketId: ticket?.id,
        message: newReply,
        internal: internal,
      }),
    });

    if (response.ok) {
      setReply("");
    }
  };

  const changeStatus = (newStatus) => {
    setStatus(newStatus);
    scrollToBottom();

    fetch(`/api/tickets/${ticket?.id}`, {
      method: "POST",
      body: JSON.stringify({
        status: newStatus,
        subject: ticket?.subject,
      }),
    });
  };

  return (
    <div class="flex flex-col h-full w-full">
      <div class="px-8 py-4 flex flex-row gap-3 h-fit w-full text-xs text-neutral-500 border-b-2 border-neutral-100">
        <a href="./" class="hover:underline">
          Tickets
        </a>
        <div>/</div>
        <div class="font-medium text-neutral-900">#{ticket?.id}</div>
      </div>
      <div class="grid grid-cols-4 h-[calc(100%-56px)] overflow-hidden">
        <div class="col-span-3 flex flex-col overflow-y-auto better-scrollbar">
          <div class="flex flex-col gap-8 px-8 py-6 border-b-2 border-neutral-100 w-full">
            <div class="flex flex-col gap-4">
              <div class="flex flex-row items-center gap-4">
                <div class="text-xl font-semibold text-neutral-900">
                  {ticket?.subject}
                </div>
                <Status status={status()} />
              </div>
            </div>
          </div>
          {/* First message is the initial message */}
          {messages().length > 0 && messages()[0] && (
            <div class="flex flex-col gap-4 px-8 py-6 border-b-2 border-neutral-100 w-full">
              <div class="text-lg font-semibold text-neutral-900">
                Description
              </div>
              <div class="text-sm text-neutral-700 px-4 py-6 bg-neutral-50 rounded-md whitespace-pre-wrap">
                {messages()[0].body}
              </div>
            </div>
          )}
          <div class="flex flex-col gap-4 px-8 py-6">
            <div class="text-lg font-semibold text-neutral-900">
              Conversation
            </div>
            {messages().length <= 1 && (
              <div class="text-xs text-neutral-300 tracking-wide text-center">
                No activity yet.
              </div>
            )}
            <div
              id="activity-log"
              class="flex flex-col overflow-y-auto max-h-64 gap-4 better-scrollbar border-neutral-100 border-l-2"
            >
              {messages()
                .slice(1)
                .map((message) => (
                  <div class="text-xs text-neutral-500 flex flex-row justify-between pl-4">
                    <div class="flex flex-col gap-1">
                      <div class="flex flex-row gap-1.5 items-center">
                        <span>
                          <span class="font-medium text-neutral-900">
                            {message.author_id || "User"}
                          </span>{" "}
                          {message.is_internal ? "replied" : "replied"}
                        </span>
                        {message.is_internal && (
                          <div class="flex flex-row items-center gap-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[0.625rem] font-medium">
                            <div class="size-3" innerHTML={EyeSlashIcon} />
                            Internal
                          </div>
                        )}
                      </div>
                      <div class="text-xs text-neutral-700 px-2 py-3 bg-neutral-50 rounded-md whitespace-pre-wrap">
                        {message.body}
                      </div>
                    </div>
                    <div class="px-3 whitespace-nowrap">
                      {new Date(message.created_at).toLocaleDateString(
                        "en-US",
                        { month: "long", day: "numeric", year: "numeric" },
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
          <div class="flex flex-col px-8 py-6 gap-4 border-t-2 border-neutral-100 w-full">
            <div
              class={`text-lg font-semibold text-neutral-900 ${
                status() === "CLOSED" ? "hidden" : ""
              }`}
            >
              Add Reply
            </div>
            <textarea
              placeholder="Enter your reply..."
              class={`text-sm text-black p-2 focus:border-neutral-300 focus:bg-neutral-100 outline-none border-2 border-neutral-100 hover:border-neutral-200 duration-100 transition-all rounded-md min-h-32 placeholder:text-neutral-300 ${
                status() === "CLOSED" ? "hidden" : ""
              }`}
              value={reply()}
              onInput={handleReplyChange}
            />
            <div
              class={`flex flex-row justify-between items-center ${status() === "CLOSED" && "hidden"}`}
            >
              <button
                class="flex items-center font-medium gap-2 text-xs text-neutral-600 group hover:cursor-pointer select-none"
                onClick={() => setInternal(!internal())}
              >
                <div
                  class={`p-1 rounded-sm outline-2 -outline-offset-2 flex items-center justify-center transition-all duration-100 ${
                    internal()
                      ? "bg-black outline-black"
                      : "outline-neutral-100 group-hover:outline-neutral-200"
                  }`}
                >
                  <div
                    class={`size-4 text-white ${internal() ? "" : "transparent"}`}
                    innerHTML={CheckIcon}
                  />
                </div>
                Internal
              </button>
              <div class="flex flex-row gap-4">
                <button
                  class={`w-fit py-2 px-4 rounded-md text-sm font-semibold flex flex-row justify-center active:scale-95 items-center gap-1.5 transition-all duration-100 ${
                    reply().trim().length === 0
                      ? "bg-neutral-100 text-white cursor-not-allowed"
                      : "bg-black text-white hover:bg-neutral-800 hover:cursor-pointer"
                  }`}
                  disabled={reply().trim().length === 0}
                  onClick={() => handleSendReply(reply(), internal())}
                >
                  <div class="size-4" innerHTML={PaperPlaneTilt} />
                  Send Reply
                </button>
                <button
                  class="w-fit py-2 px-4 rounded-md text-sm font-semibold bg-black text-white hover:bg-neutral-800 hover:cursor-pointer transition-all duration-100 active:scale-95"
                  onClick={() =>
                    changeStatus(status() === "OPEN" ? "CLOSED" : "OPEN")
                  }
                >
                  Close Ticket
                </button>
              </div>
            </div>
            <div
              class={`flex flex-row justify-end ${status() === "CLOSED" ? "" : "hidden"}`}
            >
              <button
                class="w-fit py-2 px-4 rounded-md text-sm font-semibold bg-black text-white hover:bg-neutral-800 hover:cursor-pointer transition-all duration-100 active:scale-95"
                onClick={() => changeStatus("OPEN")}
              >
                Open Ticket
              </button>
            </div>
          </div>
        </div>
        <div class="col-span-1">
          <div class="bg-neutral-50 border-l-2 border-neutral-100 flex flex-col w-full h-full">
            <div class="px-6 py-8 flex flex-col gap-4">
              <div class="text-lg font-semibold text-neutral-900">
                Ticket Details
              </div>
              <ol class="flex flex-col gap-4">
                <li class="flex flex-col gap-1">
                  <div class="text-xs font-semibold uppercase text-neutral-600 pt-2 pb-1">
                    Contact
                  </div>
                  <div class="py-1 px-3 text-xs font-medium">
                    <CopyButton text={ticket?.contact}></CopyButton>
                  </div>
                </li>
                <li class="flex flex-col gap-1">
                  <div class="text-xs font-semibold uppercase text-neutral-600 pt-2 pb-1">
                    Updated
                  </div>
                  <div class="py-1 px-3 text-xs font-medium">
                    <CopyButton
                      text={new Date(ticket.updated_at).toLocaleDateString()}
                    ></CopyButton>
                  </div>
                </li>
                <li class="flex flex-col gap-1">
                  <div class="text-xs font-semibold uppercase text-neutral-600 pt-2 pb-1">
                    Created
                  </div>
                  <div class="py-1 px-3 text-xs font-medium">
                    <CopyButton
                      text={new Date(ticket.created_at).toLocaleDateString()}
                    ></CopyButton>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

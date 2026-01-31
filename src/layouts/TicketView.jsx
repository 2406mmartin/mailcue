import { createSignal, onMount } from "solid-js";
import Status from "../components/Status.jsx";
import CopyIcon from "../assets/icons/copy.svg?raw";
import CheckIcon from "../assets/icons/check.svg?raw";
import PaperPlaneTilt from "../assets/icons/paper-plane-tilt-bold.svg?raw";

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

  const handleCopyContact = () => {
    navigator.clipboard.writeText(ticket.contact);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  const handleReplyChange = (e) => setReply(e.target.value);

  const handleSendReply = (newReply, internal) => {
    if (!newReply.trim()) return;

    const newMessage = {
      body: newReply,
      created_at: new Date(),
      is_internal: internal,
      author_id: "You",
    };

    setMessages([...messages(), newMessage]);
    scrollToBottom();

    fetch(`/api/ticket/reply`, {
      method: "POST",
      body: JSON.stringify({
        ticketId: ticket?.id,
        message: newReply,
        internal: internal,
      }),
    });
    setReply("");
  };

  const changeStatus = (newStatus) => {
    setStatus(newStatus);
    scrollToBottom();

    fetch(`/api/ticket/update`, {
      method: "POST",
      body: JSON.stringify({
        ticketId: ticket?.id,
        field: "status",
        value: newStatus,
      }),
    });
  };

  return (
    <div class="flex flex-col h-full w-full">
      <div class="px-8 py-4 flex flex-row gap-3 h-fit w-full text-neutral-600 text-xs border-b-2 border-neutral-100">
        <a href="./" class="hover:underline">
          Tickets
        </a>
        <div>/</div>
        <div class="font-bold">#{ticket?.id}</div>
      </div>
      <div class="grid grid-cols-4 h-[calc(100%-56px)] overflow-hidden">
        <div class="col-span-3 flex flex-col overflow-y-auto">
          <div class="flex flex-col gap-8 px-8 py-6 border-b-2 border-neutral-100 w-full">
            <div class="flex flex-col gap-4">
              <div class="flex flex-row gap-4">
                <div class="font-bold text-xl">{ticket?.subject}</div>
              </div>
              <div class="text-neutral-600 text-xs flex flex-row items-center bg-neutral-100 py-1 px-2 w-fit rounded-md">
                {ticket?.contact}
                <button
                  class="ml-1 p-1 hover:bg-neutral-200 rounded transition-all duration-100 hover:cursor-pointer"
                  aria-label={copied() ? "Copied" : "Copy contact"}
                  title={copied() ? "Copied" : "Copy contact"}
                  onClick={handleCopyContact}
                >
                  {copied() === false ? (
                    <div class="size-4" innerHTML={CopyIcon} />
                  ) : (
                    <div class="size-4 text-green-600" innerHTML={CheckIcon} />
                  )}
                </button>
              </div>
            </div>
          </div>
          {/* First message is the customer's initial message */}
          {messages().length > 0 && messages()[0] && (
            <div class="flex flex-col gap-4 px-8 py-6 border-b-2 border-neutral-100 w-full">
              <div class="font-bold text-md">Initial Message</div>
              <div class="text-neutral-600 text-sm px-4 py-6 bg-neutral-50 rounded-md whitespace-pre-wrap">
                {messages()[0].body}
              </div>
            </div>
          )}
          <div class="flex flex-col gap-4 px-8 py-6">
            <div class="font-bold text-md">Conversation</div>
            {messages().length <= 1 && (
              <div class="text-xs text-neutral-600 text-center">
                No replies yet.
              </div>
            )}
            <div
              id="activity-log"
              class="flex flex-col overflow-y-auto max-h-64 gap-4 border-neutral-100 border-l-2"
            >
              {messages()
                .slice(1)
                .map((message) => (
                  <div class="text-xs text-neutral-600 flex flex-row justify-between pl-4">
                    <div class="flex flex-col gap-1">
                      <div>
                        <span class="font-bold">
                          {message.author_id || "Customer"}{" "}
                        </span>
                        {message.is_internal
                          ? "added an internal note"
                          : "replied"}
                        {message.is_internal && (
                          <span class="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 border-1 border-yellow-200 rounded-full">
                            Internal
                          </span>
                        )}
                      </div>
                      <div class="text-neutral-600 text-xs px-2 py-3 bg-neutral-50 rounded-md whitespace-pre-wrap">
                        {message.body}
                      </div>
                    </div>
                    <div>
                      {new Date(message.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
            </div>
          </div>
          <div class="flex flex-col gap-4 px-8 py-6 border-t-2 border-neutral-100 w-full">
            <div
              class={`font-bold text-md ${
                status() === "CLOSED" ? "hidden" : ""
              }`}
            >
              Add Reply
            </div>
            <div
              class={`flex flex-row gap-4 ${
                status() === "CLOSED" ? "hidden" : ""
              }`}
            >
              <div
                class={`flex flex-row items-center justify-center gap-2 text-xs font-bold py-2 px-3 hover:bg-neutral-100 rounded transition-all duration-100 hover:cursor-pointer ${
                  internal() === true ? "" : "bg-neutral-100"
                }`}
                onClick={() => setInternal(false)}
              >
                <div
                  class={`border-2 p-1 w-fit h-fit rounded-full transition-all duration-100 ${
                    internal() === true
                      ? "border-neutral-200"
                      : "bg-green-500 border-green-200"
                  }`}
                ></div>
                Public
              </div>
              <div
                class={`flex flex-row items-center justify-center gap-2 text-xs font-bold py-2 px-3 hover:bg-neutral-100 rounded transition-all duration-100 hover:cursor-pointer ${
                  internal() === false ? "" : "bg-neutral-100"
                }`}
                onClick={() => setInternal(true)}
              >
                <div
                  class={`border-2 p-1 w-fit h-fit rounded-full transition-all duration-100 ${
                    internal() === false
                      ? "border-neutral-200"
                      : "bg-green-500 border-green-200"
                  }`}
                ></div>
                Internal
              </div>
            </div>
            <textarea
              placeholder="Enter your reply..."
              class={`text-neutral-600 text-xs p-3 focus:border-neutral-200 focus:bg-neutral-50 outline-none border-2 border-neutral-100 duration-100 transition-colors rounded-md min-h-32 ${
                status() === "CLOSED" ? "hidden" : ""
              }`}
              value={reply()}
              onInput={handleReplyChange}
            />
            <div class="flex flex-row self-end gap-4">
              <button
                class={`w-fit px-3 py-2 rounded-md text-sm flex flex-row justify-center font-bold items-center gap-1.5 transition-all duration-100 ${
                  status() === "CLOSED" ? "hidden" : ""
                } ${
                  reply().trim().length === 0
                    ? "bg-neutral-100 text-white cursor-not-allowed"
                    : "bg-black text-white hover:scale-95 hover:cursor-pointer"
                }`}
                disabled={reply().trim().length === 0}
                aria-disabled={reply().trim().length === 0}
                onClick={() => handleSendReply(reply(), internal())}
              >
                <div class="size-4" innerHTML={PaperPlaneTilt} />
                Send Reply
              </button>
              <button
                class={`w-fit px-3 py-2 text-white rounded-md text-sm transition-all duration-100 hover:cursor-pointer hover:scale-95 ${
                  status() === "OPEN" ? "bg-red-700" : "bg-green-700"
                }`}
                onClick={() =>
                  changeStatus(status() === "OPEN" ? "CLOSED" : "OPEN")
                }
              >
                {status() === "OPEN" ? "Close Ticket" : "Open Ticket"}
              </button>
            </div>
          </div>
        </div>
        <div class="col-span-1">
          <div class="bg-neutral-50 border-l-2 border-neutral-100 flex flex-col w-full h-full">
            <div class="px-6 pt-8 pb-4 flex flex-col gap-4">
              <div class="font-bold text-lg">Ticket Details</div>
              <ol class="flex flex-col gap-4">
                <li class="flex flex-col gap-1 w-fit">
                  <div class="text-xs text-neutral-600">Status</div>
                  <Status status={status()} />
                </li>
                <li class="flex flex-col gap-1">
                  <div class="text-xs text-neutral-600">Contact</div>
                  <div class="text-sm">{ticket?.contact}</div>
                </li>
                <li class="flex flex-col gap-1">
                  <div class="text-xs text-neutral-600">Updated</div>
                  <div class="text-sm">
                    {new Date(ticket.updated_at).toLocaleDateString()}
                  </div>
                </li>
                <li class="flex flex-col gap-1">
                  <div class="text-xs text-neutral-600">Created</div>
                  <div class="text-sm">
                    {new Date(ticket.created_at).toLocaleDateString()}
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

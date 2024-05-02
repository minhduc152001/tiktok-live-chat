// This will use the demo backend if you open index.html locally via file://, otherwise your server will be used
let backendUrl =
  location.protocol === "file:"
    ? "https://tiktok-chat-reader.zerody.one/"
    : undefined;

const startSync = () => {
  fetch(`${location.origin}/api/v1/users/me`, {
    method: "GET",
    headers: {
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2MmE3YzdmOTUyMDVkOTI0ZmZjNGMyOCIsImlhdCI6MTcxNDY2NDc3MSwiZXhwIjoxNzQ2MjAwNzcxfQ.-J9znDNIqizLJF0UFdz_j4BlbM6pFv1OehgAACTLymI",
      "Content-Type": "application/json",
    },
  })
    .then((data) => data.json())
    .then((res) => {
      const uniqueId = res.data.user.tiktokIds[0];

      let connection = new TikTokIOConnection(backendUrl);

      if (uniqueId !== "") {
        $("#stateText").text("Connecting...");

        connection
          .connect(uniqueId, {
            enableExtendedGiftInfo: true,
          })
          .then((state) => {
            $("#stateText").text(`Connected to roomId ${state.roomId}`);

            // reset stats
            viewerCount = 0;
            likeCount = 0;
            diamondsCount = 0;
            updateRoomStats();
          })
          .catch((errorMessage) => {
            $("#stateText").text(errorMessage);

            // schedule next try if obs username set
            if (window.settings.username) {
              setTimeout(() => {
                connect(window.settings.username);
              }, 30000);
            }
          });
      } else {
        alert("no username entered");
      }

      // Counter
      let viewerCount = 0;

      // Prevent Cross site scripting (XSS)
      function sanitize(text) {
        return text.replace(/</g, "&lt;");
      }

      function updateRoomStats() {
        $("#roomStats").html(`Viewers: <b>${viewerCount.toLocaleString()}</b>`);
      }

      function generateUsernameLink(data) {
        return `<a class="usernamelink" href="https://www.tiktok.com/@${data.uniqueId}" target="_blank">${data.uniqueId}</a>`;
      }

      /**
       * Add a new message to the chat container
       */
      function addChatItem(color, data, text, summarize) {
        let container = location.href.includes("obs.html")
          ? $(".eventcontainer")
          : $(".chatcontainer");

        //   if (container.find("div").length > 500) {
        //     container.find("div").slice(0, 200).remove();
        //   }

        container.find(".temporary").remove();

        container.append(`
        <div class=${summarize ? "temporary" : "static"}>
            <img class="miniprofilepicture" src="${data.profilePictureUrl}">
            <span>
                <b>${generateUsernameLink(data)}:</b> 
                <span style="color:${color}">${sanitize(text)}</span>
            </span>
        </div>
    `);

        container.stop();
        container.animate(
          {
            scrollTop: container[0].scrollHeight,
          },
          400
        );
      }

      // viewer stats
      connection.on("roomUser", (msg) => {
        if (typeof msg.viewerCount === "number") {
          viewerCount = msg.viewerCount;
          updateRoomStats();
        }
      });

      // New chat comment received
      connection.on("chat", (msg) => {
        if (window?.settings?.showChats === "0") return;

        console.log("msg.comment:", msg.comment);

        addChatItem("", msg, msg.comment);
      });

      connection.on("streamEnd", () => {
        $("#stateText").text("Stream ended.");

        // schedule next try if obs username set
        if (window?.settings?.username) {
          setTimeout(() => {
            connect(window.settings.username);
          }, 30000);
        }
      });
    });
};

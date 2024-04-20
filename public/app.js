// This will use the demo backend if you open index.html locally via file://, otherwise your server will be used
let backendUrl =
  location.protocol === "file:"
    ? "https://tiktok-chat-reader.zerody.one/"
    : undefined;

const userInfo = fetch("http://localhost:8081/api/v1/users/me", {
  method: "GET",
  mode: "cors",
  headers: {
    "Content-Type": "application/json",
    // 'Content-Type': 'application/x-www-form-urlencoded',
  },
})
  .then((data) => data.json())
  .then((res) => {
    // const userInfo = fetch("http://localhost:8081/api/v1/users/login", {
    //   method: "POST",
    //   mode: "cors",
    //   headers: {
    //     "Content-Type": "application/json",
    //     // 'Content-Type': 'application/x-www-form-urlencoded',
    //   },
    //   body: JSON.stringify({
    //     email: "mduc152001@gmail.com",
    //     password: "123456",
    //   }),
    // }).then((data) => console.log("user info:", data.json()));

    const uniqueIds = res.data.data.tiktokIds;

    let connections = uniqueIds.map(
      (id) => new TikTokIOConnection(backendUrl, id)
    );

    // Counter
    let viewerCount = 0;

    // function connect() {
    //   let uniqueId = window.settings.username || $("#uniqueIdInput").val();
    //   if (uniqueId !== "") {
    //     $("#stateText").text("Connecting...");

    //     connections.map((connection) =>
    //       connection
    //         .connect(uniqueId, {
    //           enableExtendedGiftInfo: true,
    //         })
    //         .then((state) => {
    //           $("#stateText").text(`Connected to roomId ${state.roomId}`);

    //           // reset stats
    //           viewerCount = 0;
    //           likeCount = 0;
    //           diamondsCount = 0;
    //           updateRoomStats();
    //         })
    //         .catch((errorMessage) => {
    //           $("#stateText").text(errorMessage);

    //           // schedule next try if obs username set
    //           if (window.settings.username) {
    //             setTimeout(() => {
    //               connect(window.settings.username);
    //             }, 30000);
    //           }
    //         })
    //     );
    //   } else {
    //     alert("no username entered");
    //   }
    // }

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
    connections.map((connection) =>
      connection.on("roomUser", (msg) => {
        if (typeof msg.viewerCount === "number") {
          viewerCount = msg.viewerCount;
          updateRoomStats();
        }
      })
    );

    // New chat comment received
    connections.map((connection) =>
      connection.on("chat", (msg) => {
        if (window.settings.showChats === "0") return;

        addChatItem("", msg, msg.comment);
      })
    );

    connections.map((connection) =>
      connection.on("streamEnd", () => {
        $("#stateText").text("Stream ended.");

        // schedule next try if obs username set
        if (window.settings.username) {
          setTimeout(() => {
            connect(window.settings.username);
          }, 30000);
        }
      })
    );
  });

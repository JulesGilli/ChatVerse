export function handleCommand(input, socket, currentUserId, currentChannel) {
  const parts = input.trim().split(" ");
  const cmd = parts[0];
  const arg = parts[1];

  switch (cmd) {
    case '/create':
      if (arg && socket) {
        socket.emit('createChannel', { name: arg, isPrivate: false});
      } else {
        addNotification('Error: Please provide a channel name to create.');
      }
      break;

    case "/list":
      socket.emit('getChannels', { filter: arg });
      break;

    case "/join":
      if (arg && socket) {
        socket.emit('joinChannel', { name: arg });
      }
      break;

    case "/quit":
      if (arg && socket) {
        socket.emit('leaveChannel', { name: arg });
      }
      break;

    case "/delete":
      if (arg && socket) {
        socket.emit('deleteChannel', { name: arg });
      }
      break;

    case '/nick':
      if (!arg) {
        addNotification('Error: Please specify a nickname.');
        return;
      }
      if (socket) {
        socket.emit('changeNickname', { name: arg });
      }
        break;
      

    case "/users":
      {
        const channelToList = arg || "<votre_canal_par_defaut>";
        socket.emit("listUsersInChannel", { name: channelToList });
      }
      break;

    case "/msg":
      if (!arg) {
        console.error("Erreur : Aucun destinataire spécifié pour la commande /msg.");
        return;
      }
      const messageContent = parts.slice(2).join(' ');
      if (!messageContent) {
        console.error("Erreur : Aucun message spécifié pour la commande /msg.");
        return;
      }
      if (socket) {
        socket.emit('privateMessage', { to: arg, content: messageContent });
      }
      break;

    default:
      if (input.trim() && socket && currentChannel) {
        socket.emit('sendMessage', {
          userId: currentUserId,
          content: input.trim(),
          channel: currentChannel,
        });
      } else if (!currentChannel) {
        console.error("Erreur : Aucun canal sélectionné pour envoyer le message.");
      }
      break;
  }
}

const lucky = Math.random() < 0.2;

if (lucky) {
  const messages = ["Sowwy, this is a no right-clicking zone", "Sowwy, no right clicking allowed", "No right-clickies! Only lefties!", "Y... you can't just right-click a website like that", "Please stop, it hurts", "STOP NOW, PLEASE...PLEASE..."];
  const message = messages[Math.floor(Math.random() * messages.length)];
  console.log('❀');
  window.addEventListener("contextmenu", event => {
    event.preventDefault();
    alert(`${message} (｡>﹏<｡)`);
  });
}
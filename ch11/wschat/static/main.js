// get page DOM nodes
const dom = { form: 0, chat: 0, name: 0, message: 0 };
for (let n in dom) dom[n] = document.getElementById(n);

// set user's name
dom.name.value = decodeURIComponent(location.search.trim().slice(1,1 + window.cfg.nameLen)) || 'Anonymous' + Math.floor(Math.random() * 99999);

wsInit(`ws://${ location.hostname }:${ window.cfg.wsPort }`);

// handle WebSocket communication
function wsInit(wsServer) {

  const ws = new WebSocket(wsServer);

  // connect to server
  ws.addEventListener('open', () => {
    sendMessage('entered the chat room');
  });

  // receive message
  ws.addEventListener('message', e => {

    try {

      const
        chat = JSON.parse(e.data),
        name = document.createElement('div'),
        msg  = document.createElement('div');

      name.className = 'name';
      name.textContent = (chat.name || 'unknown');
      dom.chat.appendChild(name);

      msg.className = 'msg';
      msg.textContent = (chat.msg || 'said nothing');
      dom.chat.appendChild(msg).scrollIntoView({ behavior: 'smooth' });

    }
    catch(err) {
      console.log('invalid JSON', err);
    }

  });


  // form submit
  dom.form.addEventListener('submit', e => {
    e.preventDefault();
    sendMessage();
    dom.message.value = '';
    dom.message.focus();
  }, false);


  // send message
  function sendMessage(setMsg) {

    let
      name = dom.name.value.trim(),
      msg =  setMsg || dom.message.value.trim();

    name && msg && ws.send( JSON.stringify({ name, msg }) );

  }

}

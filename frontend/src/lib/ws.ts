export function connectWs(onMessage:(m:any)=>void){
  const token = document.cookie; // replace with cookie-based auth header if needed
  const ws = new WebSocket(`ws://${location.host}/ws?token=${encodeURIComponent(token)}`);
  ws.onmessage = (e)=> onMessage(JSON.parse(e.data));
  return ws;
}
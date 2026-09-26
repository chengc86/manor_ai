export const ONLINE_WINDOW_MS=90_000;
export function isOnline(lastSeen:number|undefined,now=Date.now()){return typeof lastSeen==='number'&&lastSeen>0&&lastSeen<=now&&now-lastSeen<ONLINE_WINDOW_MS;}

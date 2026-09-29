import {HERO_ART} from './hero-art';
// Normalised attachment points; the original characters have offset poses.
const original:Record<number,[number,number,number,number]>={0:[.63,.43,.25,.78],1:[.51,.45,.31,.78],2:[.51,.46,.3,.79],3:[.5,.47,.4,.8],4:[.51,.59,.28,.83],5:[.51,.47,.31,.79],6:[.52,.48,.31,.8],9:[.5,.46,.32,.8],10:[.5,.47,.31,.8],11:[.5,.46,.3,.8],12:[.5,.45,.3,.8],13:[.5,.46,.3,.8],14:[.5,.46,.3,.8],15:[.5,.46,.3,.8]};
const overrides:Record<number,[number,number,number,number]>={16:[.5,.405,.36,.79],32:[.49,.455,.25,.76]};
export function heroFit(type:number){const [cx,neck,width,waist]=original[type]??overrides[type]??[.5,HERO_ART[type]?.neckY??.47,.32,.79];return{cx:cx*100,neck:neck*100,width:width*100,waist:waist*100,feet:94,head:type===0?4:type===16?-2:type===32?8:Math.max(0,(neck-.44)*100)};}

export default function AdminTrophy({earned}:{earned?:boolean}){
 return earned?<span className="admin-trophy-badge"><img src="/items/admin-abuse-trophy.svg" alt="Gold trophy"/><b>Admin Abuse</b></span>:null;
}

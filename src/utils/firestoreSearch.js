import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export const searchUsers = async (searchTerm) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return [];

    const usersRef = collection(db, 'users');
    const q = query(
        usersRef,
        orderBy('username'),
        where('username', '>=', term),
        where('username', '<=', term + '\uf8ff'),
        limit(20)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

import {db} from './firebaseConfig';
import {collection, addDoc, getDocs } from 'firebase/firestore';

//adding a doc
const addUser = async(userData) => {
    try {
        const docRef = await addDoc(collection (db,'users'), userData);
        console.log('Document written with ID: ', docRef.id);
    } catch (error){
        console.error('Error adding document: ', e);
    }
};

//fetching documents

const fetchUsers = async() => {
    const querySnapshot = await getDocs(collection(db, 'users'));
    querySnapshot.forEach((doc) => {
        console.log('${doc.id} => ${doc.data()}');
    })
}
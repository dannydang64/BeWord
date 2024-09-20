import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { getFirestore, collection, query, where, getDocs, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../../firebaseConfig';

const FriendRequestScreen = ({ route }) => {
    const { currentUserUid } = route.params;
    const [friendRequests, setFriendRequests] = useState([]); //
    const db = getFirestore(app);
    const auth = getAuth(app);

    useEffect(() => {
        const fetchFriendRequests = async () => {
            try {
                console.log('Fetching friend requests for user:', currentUserUid);
                const q = query(collection(db, 'friendRequests'),
                    where('to', '==', currentUserUid),
                    where('status', '==', 'Pending')
                ); // the "to " person matches curruserid

                const querySnapshot = await getDocs(q);
                if (querySnapshot.empty) {
                    console.log('No friend requests found.');
                } else {
                    const requests = querySnapshot.docs.map(doc => {
                        console.log('Document data:', doc.data());
                        return { id: doc.id, ...doc.data() };
                    });
                    // const requests = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    //querySnapshot.docs: Contains the list of documents returned by the query.
                    //map: creates new array where each dov is transformed into an object containing 
                    //the doc "id" and all its data fields 

                    console.log('Fetched friend requests:', requests);
                    setFriendRequests(requests);
                }
            } catch (error) {
                console.error('Error fetching friend requests: ', error);
                Alert.alert('Error', 'An error occurred while fetching friend requests.');
            }
        };

        fetchFriendRequests();
    }, [currentUserUid, db]);

    const handleAcceptRequest = async (requestId, fromUid) => {
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) {         
                Alert.alert('Error', 'User not authenticated.');
                return;
            }
            //debugging on for accpeting 
            const currentUserUid = auth.currentUser.uid;
            console.log('Current User UID:', currentUserUid);
            console.log('Request ID:', requestId);
            console.log('From UID:', fromUid);

            const requestDocRef = doc(db, 'friendRequests', requestId);
            await updateDoc(requestDocRef, { status: 'accepted' }); // changed status to be accepted 

            //add each user to the other's friends list 
            const currentUserDocRef = doc(db, 'users', currentUserUid);
            const fromUserDocRef = doc(db, 'users', fromUid);

            await updateDoc(currentUserDocRef, { friends: arrayUnion(fromUid) });
            console.log('Current user friends list updated.');

            await updateDoc(fromUserDocRef, { friends: arrayUnion(currentUserUid) });
            console.log('From user friends list updated.');

            Alert.alert('Success', 'Friend request accepted.');
            setFriendRequests(friendRequests.filter(req => req.id !== requestId));
        } catch (error) {
            console.error('Error accepting friend request:', error);
            Alert.alert('Error', 'Unable to accept friend request. Please try again later.');
        }
    };

    const handleDeclineRequest = async (requestId) => {
        try {
            const requestDocRef = doc(db, 'friendRequests', requestId);
            await updateDoc(requestDocRef, { status: 'declined' });

            Alert.alert('Success', 'Friend request declined.');
            setFriendRequests(friendRequests.filter(req => req.id !== requestId));
        } catch (error) {
            console.error('Error declining friend request:', error);
            Alert.alert('Error', 'Unable to decline friend request. Please try again later.');
        }
    };
    return (
        <View style={styles.container}>
            {friendRequests.map(request => (
                <View key={request.id} style={styles.requestContainer}>
                    <Text>Friend request from {request.from}</Text>
                    <Button title="Accept" onPress={() => handleAcceptRequest(request.id, request.from)} />
                    <Button title="Decline" onPress={() => handleDeclineRequest(request.id)} />
                </View>
            ))}
        </View>
    );

};

const styles = StyleSheet.create({
    container: {
        margin: 20,
    },
    requestContainer: {
        marginTop: 10,
    },
});

export default FriendRequestScreen;

